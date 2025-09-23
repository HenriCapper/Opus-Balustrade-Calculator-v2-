import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';
import { GROUND_Y_OFFSETS_MM, getModelCodeUpper, mmToMeters } from './config/offsets';
import * as THREE from 'three';

type SceneCanvasProps = {
  children: React.ReactNode;
};

export default function SceneCanvas({ children }: SceneCanvasProps) {
  const input = useLayoutStore((s) => s.input);
  const gridY = useMemo(() => {
    const code = getModelCodeUpper(input?.calcKey);
    return mmToMeters(GROUND_Y_OFFSETS_MM[code] ?? -1);
  }, [input?.calcKey]);
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          // Use softer shadow filtering for better realism
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#f3f6fa"]} />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />
          {children}
          <Grid args={[500, 500]} cellColor="#dbe2ea" sectionColor="#94a3b8" position={[0, gridY + 0.005, 0]} />
          <OrbitControls
            makeDefault
            enablePan
            enableRotate
            enableZoom
            // Prevent camera from rotating below the ground plane
            minPolarAngle={0.01}
            maxPolarAngle={Math.PI / 2 - 0.05}
            maxDistance={50}
            // Keep the orbit target on the ground plane for the active model
            target={[0, gridY, 0]}
          />
          <Environment files={"/citrus_orchard_road_puresky_4k.hdr"} background={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}
