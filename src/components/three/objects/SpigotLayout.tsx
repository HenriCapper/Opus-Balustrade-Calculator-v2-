import { useLayoutStore } from "@/store/useLayoutStore";
import type { ComponentProps } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Model } from "./Model";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { GROUND_Y_OFFSETS_MM, MODEL_Y_OFFSETS_MM, getModelCodeUpper, mmToMeters } from "../config/offsets";

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
}: any) {
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

function buildSegments(lengths: number[], customVectors?: { dx: number; dy: number; length: number }[]) {
  const segs: { start: THREE.Vector3; end: THREE.Vector3; length: number; dir: THREE.Vector3; index: number; }[] = [];
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

  const data = useMemo(() => {
    if (!input || !result) return null;
  const { sideLengths, glassHeight = 1100, customVectors } = input as any;
    if (!sideLengths || !sideLengths.length) return null;
    const ps1 = result.ps1;
  const segments = buildSegments(sideLengths, customVectors);
    const internal = ps1?.internal ?? 800;
    const edge = ps1?.edge ?? 250;
    const mode: "auto" | "2" | "3" = input.spigotsPerPanel || "auto";

    const layouts = result.sidePanelLayouts;
    type PanelMesh = {
      mid: THREE.Vector3;
      dir: THREE.Vector3;
      width: number;
      height: number;
      seg: any;
      spigotOffsets: number[];
    };
    const panelMeshes: PanelMesh[] = [];
    if (layouts && layouts.length) {
      layouts.forEach((layout, i) => {
        const seg = segments[i];
        if (!seg) return;
        const { panelWidths, gap } = layout;
        let cursor = gap;
        panelWidths.forEach((w) => {
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

    const spigots = panelMeshes.flatMap((panel) =>
      panel.spigotOffsets.map((off) => {
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

    return { panelMeshes, spigots };
  }, [input, result]);

  if (!data) return null;
  const glassThicknessMm = (() => {
    const raw = input?.glassThickness || "12";
    const n = parseFloat(raw);
    return isNaN(n) ? 12 : n;
  })();
  const thicknessM = glassThicknessMm * 0.001;
  const { panelMeshes, spigots } = data;

  // Compute dynamic ground plane size (optional visual aid for custom shapes)
  const bounds = new THREE.Box3();
  panelMeshes.forEach(p => {
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
      {panelMeshes.map((p, i) => {
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
              <meshStandardMaterial
                color="#93c5fd"
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
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
      {spigots.map((s, i) => {
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
