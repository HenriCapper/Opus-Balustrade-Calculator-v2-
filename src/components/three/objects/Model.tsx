import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

type ModelProps = {
  kind: 'spigot' | 'channel' | 'standoff' | 'post';
  code: string; // e.g. sp12
  scale?: number;
} & React.ComponentPropsWithoutRef<'group'>;

// Dynamic path resolution: looks for /src/assets/<kind>s/models/<code>.glb
export function Model({ kind, code, scale = 1, ...rest }: ModelProps){
  const normCode = code.toUpperCase();
  const path = useMemo(()=> `/models/${kind === 'spigot' ? 'spigots' : kind + 's'}/${normCode}.glb`, [kind, normCode]);
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
    <group {...rest} dispose={null}>
      <primitive object={gltf.scene.clone()} scale={scale} />
    </group>
  );
}

// Preload a common default spigot if present (public path)
useGLTF.preload('/models/spigots/SP12.glb');
