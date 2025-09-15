import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

type SceneCanvasProps = {
  children: React.ReactNode;
};

export default function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
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
          <Grid args={[500, 500]} cellColor="#dbe2ea" sectionColor="#94a3b8" />
          <OrbitControls makeDefault enablePan enableRotate enableZoom />
          <Environment files={"/src/assets/threejs/citrus_orchard_road_puresky_4k.hdr"} background={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}
