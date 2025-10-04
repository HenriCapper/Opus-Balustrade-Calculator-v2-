import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useLayoutStore } from '@/store/useLayoutStore';

type ModelProps = {
  kind: 'spigot' | 'channel' | 'standoff' | 'post';
  code: string; // e.g. sp12
  scale?: number;
  /** Optional Euler rotation (radians) */
  rotation?: [number, number, number];
  /** Optional quaternion override */
  quaternion?: THREE.Quaternion;
} & Omit<React.ComponentPropsWithoutRef<'group'>, 'rotation'>;

// Dynamic path resolution: looks for /src/assets/<kind>s/models/<code>.glb
export function Model({ kind, code, scale = 1, rotation, quaternion, ...rest }: ModelProps){
  const normCode = code.toUpperCase();
  const path = useMemo(()=> `/models/${kind}/${normCode}.glb`, [kind, normCode]);
  console.log('Loading model from path:', path);
  let gltf: any;
  try {
    gltf = useGLTF(path);
  } catch (e) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[Model] GLB not found or failed to load: ${path}`, e);
    }
    gltf = null;
  }
  // Read selected finish from layout state
  const finish = useLayoutStore(s => s.input?.finish);

  // Conditionally load Black texture set when required
  const fstr = (finish || '').toLowerCase().replace(/\s+/g, '');
  // Only apply this texture set when hardware finish is exactly Black
  const useBlack = fstr === 'black';
  const blackMaps = useBlack
    ? (useTexture({
        map: '/textures/Black/BaseColor.jpg',
        metalnessMap: '/textures/Black/Metallic.jpg',
        normalMap: '/textures/Black/Normal.png',
        roughnessMap: '/textures/Black/Roughness.jpg',
        displacementMap: '/textures/Black/Displacement.png',
      }) as any)
    : null;

  // Conditionally load Stainless texture set when required (finish = SSS)
  const useStainless = fstr === 'sss';
  const stainlessMaps = useStainless
    ? (useTexture({
        map: '/textures/Stainless/BaseColor.jpg',
        metalnessMap: '/textures/Stainless/Metallic.jpg',
        normalMap: '/textures/Stainless/Normal.png',
        roughnessMap: '/textures/Stainless/Roughness.jpg',
        displacementMap: '/textures/Stainless/Displacement.png',
      }) as any)
    : null;

  // Configure texture sampling for quality/consistency
  const configureMaps = (maps: any) => {
    if (!maps) return;
    const setCommon = (tex?: THREE.Texture) => {
      if (!tex) return;
      tex.flipY = false; // GLTF-style UV orientation
      tex.anisotropy = Math.max(tex.anisotropy || 0, 8);
    };
    if (maps.map) {
      (maps.map as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
      setCommon(maps.map);
    }
    setCommon(maps.metalnessMap);
    setCommon(maps.roughnessMap);
    setCommon(maps.normalMap);
    setCommon(maps.displacementMap);
  };
  configureMaps(blackMaps);
  configureMaps(stainlessMaps);

  // Prepare a cloned scene with material overrides applied
  const sceneWithFinish = useMemo(() => {
    if (!gltf?.scene) return null;
    // Clone deeply to avoid mutating cached GLTF
    const root: THREE.Object3D = gltf.scene.clone(true);
    if ((useBlack && blackMaps) || (useStainless && stainlessMaps)) {
      root.traverse((obj: any) => {
        if (obj && obj.isMesh) {
          const applyToMaterial = (mat: any) => {
            if (!mat) return;
            // Only target materials named 'base' or nested mat.base if provided
            const target = (mat.base ? mat.base : mat);
            const name = (target?.name || mat?.name || '').toLowerCase();
            if (name === 'base' || mat.base) {
              // Assign PBR maps
              const maps = useBlack ? blackMaps : stainlessMaps;
              if (maps?.map) target.map = maps.map;
              if (maps?.metalnessMap) target.metalnessMap = maps.metalnessMap;
              if (maps?.roughnessMap) target.roughnessMap = maps.roughnessMap;
              if (maps?.normalMap) target.normalMap = maps.normalMap;
              if (maps?.displacementMap) target.displacementMap = maps.displacementMap;
              // Sensible defaults; keep existing scalar values if present
              if (useStainless) {
                // Stainless: shiny/brushed — high metalness, lower roughness, stronger reflections
                target.metalness = 1.0;
                if (typeof target.roughness !== 'number') target.roughness = 0.25; // more reflective
                if (typeof target.envMapIntensity !== 'number') target.envMapIntensity = 1.6;
                if (maps?.normalMap && (!target.normalScale || (target.normalScale.x === 1 && target.normalScale.y === 1))) {
                  // Emphasize surface microstructure; tweak as needed based on your normal map
                  target.normalScale = new THREE.Vector2(0.7, 0.35);
                }
              } else {
                // Black: slightly less reflective than stainless by default
                if (typeof target.metalness !== 'number') target.metalness = 1.0;
                if (typeof target.roughness !== 'number') target.roughness = 0.5;
                if (typeof target.envMapIntensity !== 'number') target.envMapIntensity = 1.0;
              }
              if (typeof target.displacementScale !== 'number') target.displacementScale = 0.0015;
              target.needsUpdate = true;
            }

            // Apply finish to screw material (mat.screw or name==='screw') with distinct tuning
            const screw = (mat.screw ? mat.screw : mat);
            const screwName = (screw?.name || mat?.name || '').toLowerCase();
            if (screwName === 'screw' || mat.screw) {
              const maps = useBlack ? blackMaps : stainlessMaps;
              if (maps?.map) screw.map = maps.map;
              if (maps?.metalnessMap) screw.metalnessMap = maps.metalnessMap;
              if (maps?.roughnessMap) screw.roughnessMap = maps.roughnessMap;
              if (maps?.normalMap) screw.normalMap = maps.normalMap;
              if (maps?.displacementMap) screw.displacementMap = maps.displacementMap;
              // Screws: slightly different PBR to distinguish from body
              if (useStainless) {
                screw.metalness = 1.0;
                if (typeof screw.roughness !== 'number') screw.roughness = 0.35;
                if (typeof screw.envMapIntensity !== 'number') screw.envMapIntensity = 1.3;
                if (maps?.normalMap && (!screw.normalScale || (screw.normalScale.x === 1 && screw.normalScale.y === 1))) {
                  screw.normalScale = new THREE.Vector2(0.5, 0.25);
                }
              } else {
                // Black screws: a touch more roughness than the body
                if (typeof screw.metalness !== 'number') screw.metalness = 0.95;
                if (typeof screw.roughness !== 'number') screw.roughness = 0.6;
                if (typeof screw.envMapIntensity !== 'number') screw.envMapIntensity = 1.0;
              }
              if (typeof screw.displacementScale !== 'number') screw.displacementScale = 0.0008;
              screw.needsUpdate = true;
            }
          };
          if (Array.isArray(obj.material)) obj.material.forEach(applyToMaterial);
          else applyToMaterial(obj.material);
        }
      });
    }
    return root;
  }, [gltf, useBlack, blackMaps, useStainless, stainlessMaps]);

  if(!gltf){
    // Fallback primitive: cylinder for spigots/posts, box for channels, sphere for standoffs
    if(kind === 'spigot' || kind === 'post'){
      return (
        <group {...rest}>
          <mesh castShadow receiveShadow scale={scale * 0.1}>
            <cylinderGeometry args={[0.5,0.5,2,16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      );
    }
    if(kind === 'channel'){
      return (
        <group {...rest}>
          <mesh castShadow receiveShadow scale={[scale*0.6, scale*0.2, scale*0.1]}>
            <boxGeometry args={[1,1,1]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      );
    }
    return (
      <group {...rest}>
        <mesh castShadow receiveShadow scale={scale * 0.12}>
          <sphereGeometry args={[0.8, 24, 24]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>
    );
  }
  return (
    <group
      {...rest}
      // Apply quaternion if provided; else use rotation array; else none.
      rotation={quaternion ? undefined : rotation}
      quaternion={quaternion as any}
      dispose={null}
    >
      <primitive object={(sceneWithFinish || gltf.scene).clone()} scale={scale} />
    </group>
    // if sp13 add a vertical plane geometry behind it to simulate wall the width of wall should be the same as side length/ width
  );
}

// Preload a common default spigot if present (public path)
useGLTF.preload('/models/spigots/SP12.glb');
useGLTF.preload('/models/spigots/SP13.glb');
useGLTF.preload('/models/spigots/SP14.glb');
useGLTF.preload('/models/spigots/SP15.glb');
useGLTF.preload('/models/spigots/RMP160.glb');
useGLTF.preload('/models/spigots/SMP160.glb');

useGLTF.preload('/models/standoffs/SD50.glb');




