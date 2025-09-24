// Lightweight custom glass material to replace heavy MeshTransmissionMaterial
// Provides simple fresnel + refraction into env map without extra render targets.
// This keeps GPU memory low for very large panel meshes.
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { useMemo, useEffect } from 'react';

// Uniforms: color tint, opacity baseline, fresnel power, index of refraction
const LightGlassMaterialImpl = shaderMaterial(
  {
    uColor: new THREE.Color('#93c5fd'),
    uOpacity: 0.22, // more visible
    uFresnelPower: 4.0,
    uIOR: 1.5,
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
  uniform float uFresnelPower;
  uniform float uIOR;
  uniform samplerCube envMap;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  float fresnelTerm(vec3 viewDir, vec3 normal){
    return pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
  }

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    float f = fresnelTerm(V, N);
    // Reflection direction
    vec3 reflectDir = reflect(-V, N);
    // Sample environment map for reflection
    vec3 envCol = textureCube(envMap, reflectDir).rgb;
    // Blend env reflection with glass tint
    vec3 base = mix(uColor, envCol, 0.55);
    // Enhance edge glow using fresnel
    vec3 finalCol = mix(base, envCol, f * 0.7);
    float alpha = clamp(uOpacity + f * 0.25, 0.0, 1.0);
    gl_FragColor = vec4(finalCol, alpha);
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
}

import { useThree } from '@react-three/fiber';
export function LightGlassMaterial({ color = '#93c5fd', opacity = 0.22, ior = 1.5, fresnelPower = 4.0, ...rest }: LightGlassMaterialProps) {
  const { scene } = useThree();
  // Use the scene's environment as the envMap
  const envMap = scene.environment || null;
  const material = useMemo(() => new LightGlassMaterialImpl(), []);
  useEffect(() => {
    (material as any).uColor.set(color as any);
    (material as any).uOpacity = opacity;
    (material as any).uIOR = ior;
    (material as any).uFresnelPower = fresnelPower;
    (material as any).envMap = envMap;
    material.needsUpdate = true;
  }, [color, opacity, ior, fresnelPower, envMap, material]);
  return <primitive object={material} attach="material" transparent depthWrite={false} {...rest} />;
}
