import { useLayoutStore } from '@/store/useLayoutStore';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Model } from './Model';

// Panel geometry reused; we scale X (width) & Y (height) per panel
const basePanelGeom = new THREE.PlaneGeometry(1, 1);

// Helper: legacy direction sequence for orthogonal shapes (INLINE, L, U, BOX)
// NOTE: For now we treat every provided side length as a straight orthogonal leg turning 90° CCW.
// This matches legacy calculators for non-custom shapes without gates.
function buildSegments(lengths: number[]){
  const dirs = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,1), new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,-1)];
  const segs: { start: THREE.Vector3; end: THREE.Vector3; length: number; dir: THREE.Vector3; index: number }[] = [];
  let cursor = new THREE.Vector3();
  lengths.forEach((len,i)=>{
    const dir = dirs[i % 4];
    const end = cursor.clone().add(dir.clone().multiplyScalar(len));
    segs.push({ start: cursor.clone(), end, length: len, dir: dir.clone(), index: i });
    cursor = end;
  });
  return segs;
}

// Compute spigot positions for a panel width using legacy formula.
function computeSpigotsForPanel(panelWidth: number, internal: number, edge: number, mode: 'auto'|'2'|'3'){  
  // Determine theoretical required spigots
  let needed = Math.max(2, Math.ceil((panelWidth - 2*edge)/internal)+1);
  if(mode === '2') needed = 2; else if (mode==='3') needed = Math.min(Math.max(3, needed), 3);
  // Clamp typical upper bound (legacy often allowed up to 4 in auto)
  if(mode==='auto') needed = Math.min(needed, 4);
  // Return fractional distances from left edge (0..panelWidth)
  const span = panelWidth - 2*edge;
  const gaps = needed - 1;
  const spacing = gaps > 0 ? span / gaps : span;
  const positions: number[] = [];
  for(let i=0;i<needed;i++) positions.push(edge + spacing * i);
  return positions;
}

export function SpigotLayout(props: ComponentProps<'group'>){
  const input = useLayoutStore(s=>s.input);
  const result = useLayoutStore(s=>s.result);

  const data = useMemo(()=>{
    if(!input || !result) return null;
  const { sideLengths, glassHeight = 1100 } = input;
    if(!sideLengths || !sideLengths.length) return null;
    const ps1 = result.ps1;
    const segments = buildSegments(sideLengths);
    const internal = ps1?.internal ?? 800;
    const edge = ps1?.edge ?? 250;
    const mode: 'auto'|'2'|'3' = input.spigotsPerPanel || 'auto';

    // Multi-panel: use stored sidePanelLayouts if present
    const layouts = result.sidePanelLayouts;
    type PanelMesh = { mid: THREE.Vector3; dir: THREE.Vector3; width: number; height: number; seg: any; spigotOffsets: number[] };
    const panelMeshes: PanelMesh[] = [];
    if(layouts && layouts.length){
      layouts.forEach((layout, i)=>{
        const seg = segments[i];
        if(!seg) return; // safety
        const { panelWidths, gap } = layout;
        let cursor = gap; // start gap from segment start
        panelWidths.forEach(w => {
          const startOff = cursor;
          const midLocal = seg.dir.clone().multiplyScalar(startOff + w/2);
          const mid = seg.start.clone().add(midLocal);
          const spigotOffsets = computeSpigotsForPanel(w, internal, edge, mode).map(off => startOff + off);
          panelMeshes.push({ mid, dir: seg.dir.clone(), width: w, height: glassHeight, seg, spigotOffsets });
          cursor += w + gap; // panel width + gap after
        });
      });
    } else {
      // Fallback single panel per segment (previous behavior)
      segments.forEach(seg => {
        let width = seg.length;
        if(width <= 0) width = 500;
        const midLocal = seg.dir.clone().multiplyScalar(width/2);
        const mid = seg.start.clone().add(midLocal);
        const spigotOffsets = computeSpigotsForPanel(width, internal, edge, mode);
        panelMeshes.push({ mid, dir: seg.dir.clone(), width, height: glassHeight, seg, spigotOffsets });
      });
    }

    const spigots = panelMeshes.flatMap(panel => {
      return panel.spigotOffsets.map(off => ({
        position: panel.seg.start.clone().add(panel.dir.clone().multiplyScalar(off)),
        segIndex: panel.seg.index
      }));
    });

    return { panelMeshes, spigots };
  }, [input, result]);

  if(!data) return null;
  const { panelMeshes, spigots } = data;

  return (
    <group {...props}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-0.001,0]}>
        <planeGeometry args={[500,500]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
  {/* Panels (one per side for now – extend to multi-panel once per-side solver data is stored) */}
      {panelMeshes.map((p,i)=>{
        // Convert mm->m for positions & size
        const scale = 0.001;
        const mid = p.mid.clone().multiplyScalar(scale);
        const widthM = p.width * scale;
        const heightM = p.height * scale;
        // Build quaternion to align plane so its local +X matches segment direction horizontally
        const dirUnit = p.dir.clone().normalize();
        // We start with plane (1x1) facing +Z? In PlaneGeometry(1,1) default normal +Z, we want panel normal perpendicular to dir, so create basis.
        const normal = new THREE.Vector3(dirUnit.z, 0, -dirUnit.x).normalize(); // rotate dir 90° CCW around Y
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), normal);
        return (
          <mesh key={i} position={[mid.x, heightM/2, mid.z]} geometry={basePanelGeom} quaternion={quat} scale={[widthM, heightM, 1]} castShadow>
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
  {/* Spigots (derived from panel widths & ps1 spacing) */}
      {spigots.map((s,i)=>{
        const scale = 0.001; // mm->m
        return <Model key={i} kind="spigot" code={(input?.calcKey||'sp12')} position={[s.position.x*scale, 0, s.position.z*scale]} scale={0.65} />;
      })}
    </group>
  );
}
