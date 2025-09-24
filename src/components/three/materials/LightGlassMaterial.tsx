// Lightweight custom glass material to replace heavy MeshTransmissionMaterial
// Provides simple fresnel + refraction into env map without extra render targets.
// This keeps GPU memory low for very large panel meshes.
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { useMemo, useEffect } from 'react';

// Uniforms: color tint, base opacity, fresnel power, index of refraction + realism controls
// Added uniforms:
//  - uMinOpacity: prevents glass disappearing at grazing angles
//  - uReflectivity: scales fresnel based reflection contribution
//  - uAberrationStrength: small chromatic refraction spread (0 disables extra samples)
const LightGlassMaterialImpl = shaderMaterial(
  {
    uColor: new THREE.Color('#93c5fd'),
    uOpacity: 0.22,
    uMinOpacity: 0.08,
    uFresnelPower: 4.0,
    uReflectivity: 1.0,
    uAberrationStrength: 0.0,
    uIOR: 1.5,
    uThickness: 0.012, // meters (12mm typical laminated)
    uAttenuationColor: new THREE.Color('#ffffff'), // absorption tint per meter
    uAttenuationDistance: 1.0, // distance at which color attenuates noticeably
    uRoughness: 0.05, // micro-surface blur (0 = perfect)
    envMap: null,
  },
  // Vertex shader
  /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  void main(){
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - vWorldPos);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
  `,
  // Fragment shader
  /* glsl */`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uMinOpacity;
  uniform float uFresnelPower;
  uniform float uReflectivity;
  uniform float uAberrationStrength;
  uniform float uIOR;
  uniform float uThickness;
  uniform vec3 uAttenuationColor;
  uniform float uAttenuationDistance;
  uniform float uRoughness;
  uniform samplerCube envMap;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  float fresnelSimple(vec3 viewDir, vec3 normal){
    return pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
  }

  float schlickFresnel(float cosTheta, float ior){
    float r0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
    return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
  }

  void main(){
    vec3 N = normalize(vNormal);
    // Support double-sided panels: flip normal if backface
    if(!gl_FrontFacing){
      N = -N;
    }
    vec3 V = normalize(vViewDir);
    float cosTheta = clamp(dot(V, N), 0.0, 1.0);
    float fCustom = fresnelSimple(V, N);
    float fSchlick = schlickFresnel(cosTheta, uIOR);
    float f = mix(fCustom, fSchlick, 0.5); // blend legacy + schlick for adjustable look

    // Reflection
    vec3 reflectDir = reflect(-V, N);
  vec3 reflectCol = textureCube(envMap, reflectDir).rgb;

    // Refraction directions
    vec3 refractDir = refract(-V, N, 1.0 / uIOR);
  vec3 refractCol = textureCube(envMap, refractDir).rgb;

    // Optional cheap chromatic aberration (3 env samples) when uAberrationStrength > 0
    if(uAberrationStrength > 0.0001){
      float shift = uAberrationStrength * 0.01; // very small IOR shifts
      vec3 refractDirR = refract(-V, N, 1.0 / (uIOR + shift));
      vec3 refractDirB = refract(-V, N, 1.0 / (uIOR - shift));
      vec3 rCol = textureCube(envMap, refractDirR).rgb;
      vec3 bCol = textureCube(envMap, refractDirB).rgb;
      // combine with original green channel
      refractCol = vec3(rCol.r, refractCol.g, bCol.b);
    }

    // Micro-surface roughness blur (very cheap 3 tap) applied to both reflection & refraction when uRoughness > 0
    if(uRoughness > 0.0001){
      // Build simple orthonormal basis from N
      vec3 up = abs(N.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
      vec3 T = normalize(cross(up, N));
      vec3 B = cross(N, T);
      float r = uRoughness * 0.35; // scale factor
      // Reflection blur
      vec3 r1 = normalize(reflectDir + T * r);
      vec3 r2 = normalize(reflectDir + B * r);
      vec3 rBlur = (textureCube(envMap, r1).rgb + textureCube(envMap, r2).rgb + reflectCol) / 3.0;
      reflectCol = mix(reflectCol, rBlur, clamp(uRoughness * 1.4, 0.0, 1.0));
      // Refraction blur
      vec3 t1 = normalize(refractDir + T * r);
      vec3 t2 = normalize(refractDir + B * r);
      vec3 tBlur = (textureCube(envMap, t1).rgb + textureCube(envMap, t2).rgb + refractCol) / 3.0;
      refractCol = mix(refractCol, tBlur, clamp(uRoughness * 1.2, 0.0, 1.0));
    }

    // Approximate thickness dependent attenuation (Beer-Lambert) using view angle to scale path length.
    float invDot = 1.0 / max(cosTheta, 0.15);
    float approxDistance = uThickness * invDot; // path length inside panel
    float attLen = approxDistance / max(uAttenuationDistance, 1e-4);
    vec3 attenuation = exp(-uAttenuationColor * attLen);

    // Base tint & attenuation applied to refraction
    refractCol = mix(uColor, refractCol, 0.7) * attenuation;

    // Reflection weighting by fresnel * reflectivity
    float reflectWeight = clamp(f * uReflectivity, 0.0, 1.0);
  vec3 combined = mix(refractCol, reflectCol, reflectWeight);

    // Subtle edge brightening
    combined += reflectWeight * 0.05;

    // Ensure some minimum presence (avoid fully vanishing panel at head-on angles)
  // Transmission alpha considers attenuation (denser path -> less alpha boost)
  float transmissionFactor = (attenuation.r + attenuation.g + attenuation.b) / 3.0;
  float alpha = max(mix(uOpacity, 1.0, reflectWeight * 0.35 * transmissionFactor), uMinOpacity);
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(combined, alpha);
  }
  `
);

// Register custom material so it can be used as <lightGlassMaterialImpl />
extend({ LightGlassMaterialImpl });

// We will attach via <primitive> so no intrinsic element typing needed.
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace JSX {
//     interface IntrinsicElements {
//       lightGlassMaterialImpl: any; // Relaxed typing for custom shader material
//     }
//   }
// }

export interface LightGlassMaterialProps {
  color?: string | number;
  opacity?: number;
  ior?: number;
  fresnelPower?: number;
  minOpacity?: number;
  reflectivity?: number; // scales fresnel reflection contribution
  aberrationStrength?: number; // 0 = off, >0 small chromatic dispersion
  thickness?: number; // meters
  attenuationColor?: string | number; // absorption color per meter
  attenuationDistance?: number; // distance scaling
  roughness?: number; // micro blur
}

import { useThree } from '@react-three/fiber';
export function LightGlassMaterial({
  color = '#93c5fd',
  opacity = 0.22,
  ior = 1.5,
  fresnelPower = 4.0,
  minOpacity = 0.08,
  reflectivity = 1.0,
  aberrationStrength = 0.0,
  thickness = 0.012,
  attenuationColor = '#ffffff',
  attenuationDistance = 1.0,
  roughness = 0.05,
  ...rest
}: LightGlassMaterialProps) {
  const { scene } = useThree();
  // Use the scene's environment as the envMap
  const envMap = scene.environment || null;
  const material = useMemo(() => new LightGlassMaterialImpl(), []);
  useEffect(() => {
    (material as any).uColor.set(color as any);
    (material as any).uOpacity = opacity;
    (material as any).uMinOpacity = minOpacity;
    (material as any).uIOR = ior;
    (material as any).uFresnelPower = fresnelPower;
    (material as any).uReflectivity = reflectivity;
    (material as any).uAberrationStrength = aberrationStrength;
    (material as any).uThickness = thickness;
    (material as any).uAttenuationColor.set(attenuationColor as any);
    (material as any).uAttenuationDistance = attenuationDistance;
    (material as any).uRoughness = roughness;
    (material as any).envMap = envMap;
    material.needsUpdate = true;
  }, [color, opacity, minOpacity, ior, fresnelPower, reflectivity, aberrationStrength, thickness, attenuationColor, attenuationDistance, roughness, envMap, material]);
  return <primitive object={material} attach="material" transparent depthWrite={false} {...rest} />;
}
