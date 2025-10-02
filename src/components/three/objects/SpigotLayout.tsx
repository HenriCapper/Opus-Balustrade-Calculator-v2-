import { useLayoutStore } from "@/store/useLayoutStore";
import type { LayoutCalculationResult } from "@/store/useLayoutStore";
import type { ComponentProps } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Model } from "./Model";
import { Text, useTexture } from "@react-three/drei";
import { LightGlassMaterial } from "../materials/LightGlassMaterial";
import { useFrame, useThree } from "@react-three/fiber";
import { GROUND_Y_OFFSETS_MM, MODEL_Y_OFFSETS_MM, getModelCodeUpper, mmToMeters } from "../config/offsets";

// Preload wall texture set to minimize pop-in when switching to SP13
useTexture.preload('/textures/Wall/BaseColor.png');
useTexture.preload('/textures/Wall/Normal.png');
useTexture.preload('/textures/Wall/Roughness.png');

// Billboard text component
function FacingText({
  children,
  position,
  fontSize,
  anchorX = "center",
  anchorY = "middle",
  outlineWidth = 0,
  outlineColor = "#ffffff",
  color = "#0f172a",
}: {
  children: React.ReactNode;
  position: [number, number, number] | THREE.Vector3;
  fontSize: number;
  anchorX?: "left" | "center" | "right" | number;
  anchorY?: "top" | "middle" | "bottom" | number;
  outlineWidth?: number;
  outlineColor?: string | number;
  color?: string | number;
}) {
  const ref = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  useFrame(() => {
    if (ref.current) ref.current.quaternion.copy(camera.quaternion);
  });
  return (
    <group ref={ref} position={position}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        outlineWidth={outlineWidth}
        outlineColor={outlineColor}
      >
        {children}
      </Text>
    </group>
  );
}

// Base panel geometry (box to show thickness)
const basePanelGeom = new THREE.BoxGeometry(1, 1, 1);

// Types used within this module
interface Segment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  length: number;
  dir: THREE.Vector3;
  index: number;
}

interface PanelMesh {
  mid: THREE.Vector3;
  dir: THREE.Vector3;
  width: number;
  height: number;
  seg: Segment;
  spigotOffsets: number[];
}

interface GateMesh {
  mid: THREE.Vector3;
  dir: THREE.Vector3;
  width: number; // leaf width in mm
  height: number; // height mm
  seg: Segment;
  hingeOnLeft: boolean;
}

type GateRenderMeta = NonNullable<LayoutCalculationResult["sideGatesRender"]>[number] & {
  leafWidth?: number;
};

type SpigotItem = { position: THREE.Vector3; segIndex: number; quat: THREE.Quaternion };

function buildSegments(lengths: number[], customVectors?: { dx: number; dy: number; length: number }[]): Segment[] {
  const segs: Segment[] = [];
  let cursor = new THREE.Vector3();
  if (customVectors && customVectors.length === lengths.length) {
    customVectors.forEach((v, i) => {
      // dx, dy are in mm: map dx -> X, dy -> Z for plan view
      const dir = new THREE.Vector3(v.dx, 0, v.dy);
      const len = v.length; // already mm
      // Normalize direction then scale by length to get end point
      const dNorm = dir.clone();
      if (dNorm.lengthSq() === 0) dNorm.set(1,0,0); else dNorm.normalize();
      const end = cursor.clone().add(dNorm.clone().multiplyScalar(len));
      segs.push({ start: cursor.clone(), end, length: len, dir: dNorm.clone(), index: i });
      cursor = end;
    });
    return segs;
  }
  // Fallback legacy orthogonal pattern
  const dirs = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ];
  lengths.forEach((len, i) => {
    const dir = dirs[i % 4];
    const end = cursor.clone().add(dir.clone().multiplyScalar(len));
    segs.push({ start: cursor.clone(), end, length: len, dir: dir.clone(), index: i });
    cursor = end;
  });
  return segs;
}

function computeSpigotsForPanel(
  panelWidth: number,
  internal: number,
  edge: number,
  mode: "auto" | "2" | "3"
) {
  let needed = Math.max(2, Math.ceil((panelWidth - 2 * edge) / internal) + 1);
  if (mode === "2") needed = 2;
  else if (mode === "3") needed = Math.min(Math.max(3, needed), 3);
  if (mode === "auto") needed = Math.min(needed, 4);
  const span = panelWidth - 2 * edge;
  const gaps = needed - 1;
  const spacing = gaps > 0 ? span / gaps : span;
  const positions: number[] = [];
  for (let i = 0; i < needed; i++) positions.push(edge + spacing * i);
  return positions;
}

export function SpigotLayout(props: ComponentProps<"group">) {
  const input = useLayoutStore((s) => s.input);
  const result = useLayoutStore((s) => s.result);
  const codeUpper = getModelCodeUpper(input?.calcKey);

  // Preload wall texture set (used for SP13 wall rendering)
  const wallMaps = useTexture({
    map: "/textures/Wall/BaseColor.png",
    normalMap: "/textures/Wall/Normal.png",
    roughnessMap: "/textures/Wall/Roughness.png",
  }) as {
    map?: THREE.Texture;
    normalMap?: THREE.Texture;
    roughnessMap?: THREE.Texture;
  };
  // Configure base sampling only once
  if (wallMaps?.map) {
    wallMaps.map.colorSpace = THREE.SRGBColorSpace;
    wallMaps.map.wrapS = wallMaps.map.wrapT = THREE.RepeatWrapping;
    wallMaps.map.anisotropy = Math.max(wallMaps.map.anisotropy || 0, 8);
  }
  if (wallMaps?.normalMap) {
    wallMaps.normalMap.wrapS = wallMaps.normalMap.wrapT = THREE.RepeatWrapping;
    wallMaps.normalMap.anisotropy = Math.max(wallMaps.normalMap.anisotropy || 0, 8);
  }
  if (wallMaps?.roughnessMap) {
    wallMaps.roughnessMap.wrapS = wallMaps.roughnessMap.wrapT = THREE.RepeatWrapping;
    wallMaps.roughnessMap.anisotropy = Math.max(wallMaps.roughnessMap.anisotropy || 0, 8);
  }

  const data = useMemo<{
    panelMeshes: PanelMesh[];
    gateMeshes: GateMesh[];
    spigots: SpigotItem[];
    segments: Segment[];
    glassHeight: number;
  } | null>(() => {
    if (!input || !result) return null;
  const { sideLengths, glassHeight = 1100, customVectors } = input;
    if (!sideLengths || !sideLengths.length) return null;
    const ps1 = result.ps1;
    const segments = buildSegments(sideLengths, customVectors);
    const internal = ps1?.internal ?? 800;
    const edge = ps1?.edge ?? 250;
    const mode: "auto" | "2" | "3" = input.spigotsPerPanel || "auto";

  const layouts = result.sidePanelLayouts;
  const gates = (result.sideGatesRender || []) as GateRenderMeta[];
  const GATE_TOTAL_WIDTH = 905; // keep fixed in 3D; visuals controller only adjusts displayed width
  const defaultGateLeaf = result.gateLeafWidth ?? input?.gateLeafWidth ?? 890;
    const panelMeshes: PanelMesh[] = [];
    const gateMeshes: GateMesh[] = [];
    if (layouts && layouts.length) {
      layouts.forEach((layout, i) => {
        const seg = segments[i];
        if (!seg) return;
        const { panelWidths, gap } = layout;
        const gate = gates[i];
        let cursor = gap;
        let gateInserted = false;
        panelWidths.forEach((w, j) => {
          if (gate && gate.enabled && !gateInserted && j === gate.panelIndex) {
            const defaultSlotStart = cursor;
            const hasExplicitStart = typeof gate.gateStartMm === 'number';
            const rawSlotStart = hasExplicitStart ? gate.gateStartMm! : defaultSlotStart;
            const gateStart = (() => {
              if (!hasExplicitStart) return Math.max(0, defaultSlotStart - gap);
              return Math.max(
                0,
                Math.abs(rawSlotStart - defaultSlotStart) < 0.5
                  ? rawSlotStart - gap
                  : rawSlotStart
              );
            })();
            const hingeOnLeft = !!gate.hingeOnLeft;
            const isWallToGlassHinge = hingeOnLeft && gate.panelIndex === 0;
            const hingeGapMm = isWallToGlassHinge ? 7 : 5;
            const maxLeafWidth = Math.max(200, GATE_TOTAL_WIDTH - hingeGapMm);
            const leafWidthMm = Math.max(
              350,
              Math.min(maxLeafWidth - 5, gate.leafWidth ?? defaultGateLeaf ?? 890)
            );
            const leafStart = gateStart + hingeGapMm;
            const midLocal = seg.dir.clone().multiplyScalar(leafStart + leafWidthMm / 2);
            const mid = seg.start.clone().add(midLocal);
            gateMeshes.push({
              mid,
              dir: seg.dir.clone(),
              width: leafWidthMm,
              height: glassHeight,
              seg,
              hingeOnLeft,
            });
            cursor = gateStart + GATE_TOTAL_WIDTH;
            gateInserted = true;
          }
          const startOff = cursor;
          const midLocal = seg.dir.clone().multiplyScalar(startOff + w / 2);
          const mid = seg.start.clone().add(midLocal);
          const spigotOffsets = computeSpigotsForPanel(
            w,
            internal,
            edge,
            mode
          ).map((off) => startOff + off);
          panelMeshes.push({
            mid,
            dir: seg.dir.clone(),
            width: w,
            height: glassHeight,
            seg,
            spigotOffsets,
          });
          cursor += w + gap;
        });
      });
    } else {
      segments.forEach((seg) => {
        let width = seg.length;
        if (width <= 0) width = 500;
        const midLocal = seg.dir.clone().multiplyScalar(width / 2);
        const mid = seg.start.clone().add(midLocal);
        const spigotOffsets = computeSpigotsForPanel(
          width,
          internal,
          edge,
          mode
        );
        panelMeshes.push({
          mid,
          dir: seg.dir.clone(),
          width,
          height: glassHeight,
          seg,
          spigotOffsets,
        });
      });
    }

    const spigots: SpigotItem[] = panelMeshes.flatMap((panel) =>
      panel.spigotOffsets.map((off): SpigotItem => {
        const position = panel.seg.start
          .clone()
          .add(panel.dir.clone().multiplyScalar(off));
        // Outward normal (right-hand turn pattern like legacy calculators): rotate dir 90° CCW on XZ plane
        const dirUnit = panel.dir.clone().normalize();
        const outward = new THREE.Vector3(dirUnit.z, 0, -dirUnit.x).normalize();
        // We want model +Z axis to face outward. Assume GLB authored with +Z forward, +Y up.
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          outward
        );
        return { position, segIndex: panel.seg.index, quat };
      })
    );

    return { panelMeshes, gateMeshes, spigots, segments, glassHeight };
  }, [input, result]);

  if (!data) return null;
  const glassThicknessMm = (() => {
    const raw = input?.glassThickness || "12";
    const n = parseFloat(raw);
    return isNaN(n) ? 12 : n;
  })();
  const thicknessM = glassThicknessMm * 0.001;
  const { panelMeshes, gateMeshes, spigots, segments } = data;

  // Compute dynamic ground plane size (optional visual aid for custom shapes)
  const bounds = new THREE.Box3();
  panelMeshes.forEach((p: PanelMesh) => {
    bounds.expandByPoint(p.mid.clone());
  });
  const size = new THREE.Vector3();
  bounds.getSize(size);
  // const planeW = Math.max(500, size.x + 400);
  // const planeH = Math.max(500, size.z + 400);
  const center = new THREE.Vector3();
  bounds.getCenter(center);

  return (
    <group {...props}>
      {codeUpper === 'SP13' && segments && segments.length > 0 && (
        // For SP13 (wall-fixed), draw a vertical wall plane behind each side with width equal to the side length
        <group>
          {segments.map((seg: Segment, i: number) => {
            const scale = 0.001;
            const mid = seg.start.clone().add(seg.end).multiplyScalar(0.5 * scale);
            const dirUnit = seg.dir.clone().normalize();
            const normal = new THREE.Vector3(dirUnit.z, 0, -dirUnit.x).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              normal
            );
            const widthM = Math.max(0.001, seg.length * scale);
            const wallThicknessM = 0.1; // ~100mm wall thickness; tweak as needed
            const wallOffsetM = 0.058; // place slightly behind spigots (~40mm)
            // Offset the wall backwards so spigots appear in front of it
            const pos = mid.clone().add(normal.clone().multiplyScalar(-wallOffsetM));

            // Prepare per-segment texture tiling (clone to avoid sharing repeat across segments)
            const tileSizeM = 0.5; // physical tile size for texture repeat (0.5m square)
            const repeatX = Math.max(1, Math.round(widthM / tileSizeM));
            const repeatY = Math.max(1, Math.round(0.5 / tileSizeM));
            const map = wallMaps?.map?.clone?.() ?? null;
            const nrm = wallMaps?.normalMap?.clone?.() ?? null;
            const rough = wallMaps?.roughnessMap?.clone?.() ?? null;
            if (map) {
              map.wrapS = map.wrapT = THREE.RepeatWrapping;
              map.repeat.set(repeatX, repeatY);
              map.anisotropy = Math.max(map.anisotropy || 0, 8);
              // keep SRGB for baseColor
            }
            if (nrm) {
              nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
              nrm.repeat.set(repeatX, repeatY);
              nrm.anisotropy = Math.max(nrm.anisotropy || 0, 8);
            }
            if (rough) {
              rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
              rough.repeat.set(repeatX, repeatY);
              rough.anisotropy = Math.max(rough.anisotropy || 0, 8);
            }
            return (
              <mesh
                key={`wall-${i}`}
                position={[pos.x, -0.2865, pos.z]}
                quaternion={quat}
                receiveShadow
              >
                <boxGeometry args={[widthM, 0.5, wallThicknessM]} />
                {/* wall texture here */}
                <meshStandardMaterial
                  side={THREE.DoubleSide}
                  // Non-metallic painted/plastered wall
                  metalness={0.0}
                  roughness={0.9}
                  envMapIntensity={0.15}
                  map={map}
                  normalMap={nrm}
                  roughnessMap={rough}
                  normalScale={new THREE.Vector2(0.6, 0.6)}
                />
              </mesh>
            );
          })}
        </group>
      )}
       {(() => {
        const planeY = mmToMeters(GROUND_Y_OFFSETS_MM[codeUpper] ?? -1);
        return (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            position={[0, planeY, 0]}
          >
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })()}
      {panelMeshes.map((p: PanelMesh, i: number) => {
        const scale = 0.001;
        const mid = p.mid.clone().multiplyScalar(scale);
        const widthM = p.width * scale;
        const heightM = p.height * scale;
        const dirUnit = p.dir.clone().normalize();
        const normal = new THREE.Vector3(dirUnit.z, 0, -dirUnit.x).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        );
        return (
          <group key={i}>
            <mesh
              position={[mid.x, heightM / 2, mid.z]}
              geometry={basePanelGeom}
              quaternion={quat}
              scale={[widthM, heightM, thicknessM]}
              castShadow
            >
              {/* Lightweight custom GLSL glass (memory-friendly vs MeshTransmissionMaterial) */}
              <LightGlassMaterial
                color="#93c5fd"
                opacity={0.08}
                ior={1.5}
                fresnelPower={4.0}
              />
            </mesh>
            <FacingText
              position={[mid.x, heightM + 0.03, mid.z]}
              fontSize={Math.min(0.045, Math.max(0.025, widthM * 0.15))}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.0015}
              outlineColor="#ffffff"
            >{`${p.width.toFixed(0)} mm`}</FacingText>
          </group>
        );
      })}
      {/* Gate leaves (visuals) */}
      {gateMeshes.map((g: GateMesh, i: number) => {
        const scale = 0.001;
        const mid = g.mid.clone().multiplyScalar(scale);
        const widthM = g.width * scale;
        const heightM = g.height * scale;
        const dirUnit = g.dir.clone().normalize();
        const normal = new THREE.Vector3(dirUnit.z, 0, -dirUnit.x).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        );
  // Larger hinge blocks for visibility
  const hingeBlockWidthM = 0.02;  // 20mm along the width (local X)
  const hingeBlockHeightM = 0.06; // 60mm tall
  const hingeBlockDepthM = Math.max(0.016, thicknessM + 0.004); // slightly thicker than glass to protrude
  const hingeInsetM = 0.003; // small inset from the edge
  const hingeX = (g.hingeOnLeft ? 1 : -1) * (widthM / 2 - hingeBlockWidthM / 2 - hingeInsetM);
  const hingeYPositions = [0.25, 0.5, 0.75];
        return (
          <group key={`gate-${i}`}>
            <mesh
              position={[mid.x, heightM / 2, mid.z]}
              geometry={basePanelGeom}
              quaternion={quat}
              scale={[widthM, heightM, thicknessM]}
              castShadow
            >
              {/* Match default panel glass material */}
              <LightGlassMaterial
                color="#93c5fd"
                opacity={0.08}
                ior={1.5}
                fresnelPower={4.0}
              />
            </mesh>
            {/* Hinge markers along hinge side */}
            <group position={[mid.x, 0, mid.z]} quaternion={quat}>
                {hingeYPositions.map((t, idx) => {
                // Middle hinge (idx === 1) goes on the opposite side
                const x = idx === 1 ? -hingeX : hingeX;
                return (
                  <mesh key={idx} position={[x, heightM * t, 0]}>
                    <boxGeometry args={[hingeBlockWidthM, hingeBlockHeightM, hingeBlockDepthM]} />
                    <meshStandardMaterial color="#000000" metalness={0.2} roughness={0.5} />
                  </mesh>
                );
              })}
            </group>
          </group>
        );
      })}
      {panelMeshes[0] &&
        (() => {
          const scale = 0.001;
          const p = panelMeshes[0];
          const mid = p.mid.clone().multiplyScalar(scale);
          const heightM = p.height * scale;
          return (
            <FacingText
              position={[mid.x -0.8, heightM - 0.5, mid.z -0.05]}
              fontSize={0.04}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.002}
              outlineColor="#ffffff"
            >{`${p.height} mm glass height`}</FacingText>
          );
        })()}
      {spigots.map((s: SpigotItem, i: number) => {
        const scale = 0.001;
        const y = mmToMeters(MODEL_Y_OFFSETS_MM[codeUpper] ?? 0);
        return (
          <Model
            key={i}
            kind="spigot"
            code={codeUpper}
            position={[s.position.x * scale, y, s.position.z * scale]}
            scale={0.65}
            quaternion={s.quat}
          />
        );
      })}
    </group>
  );
}
