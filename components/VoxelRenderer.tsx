import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { VoxelData } from '../types';

interface Props {
  voxels: VoxelData[];
}

// Separate instances by material type to optimize draw calls
const VoxelRenderer: React.FC<Props> = ({ voxels }) => {
  
  // Refs for each InstancedMesh
  const sandRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const vegRef = useRef<THREE.InstancedMesh>(null);
  const limestoneRef = useRef<THREE.InstancedMesh>(null);
  const goldRef = useRef<THREE.InstancedMesh>(null);
  const stoneRef = useRef<THREE.InstancedMesh>(null);
  const mudbrickRef = useRef<THREE.InstancedMesh>(null);
  const torchRef = useRef<THREE.InstancedMesh>(null);

  // Group voxels by type
  const grouped = useMemo(() => {
    const groups: Record<string, VoxelData[]> = {
      sand: [], water: [], vegetation: [], limestone: [], gold: [], stone: [], mudbrick: [], torch: []
    };
    voxels.forEach(v => {
      if (groups[v.type]) groups[v.type].push(v);
    });
    return groups;
  }, [voxels]);

  // Helper to update matrices
  const updateInstance = (ref: React.RefObject<THREE.InstancedMesh>, data: VoxelData[]) => {
    if (!ref.current) return;
    const tempObj = new THREE.Object3D();
    
    data.forEach((voxel, i) => {
      tempObj.position.set(...voxel.position);
      tempObj.updateMatrix();
      ref.current!.setMatrixAt(i, tempObj.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    updateInstance(sandRef, grouped.sand);
    updateInstance(waterRef, grouped.water);
    updateInstance(vegRef, grouped.vegetation);
    updateInstance(limestoneRef, grouped.limestone);
    updateInstance(goldRef, grouped.gold);
    updateInstance(stoneRef, grouped.stone);
    updateInstance(mudbrickRef, grouped.mudbrick);
    updateInstance(torchRef, grouped.torch);
  }, [grouped]);

  return (
    <group>
      {/* Sand - Matte, rough */}
      <instancedMesh ref={sandRef} args={[undefined, undefined, grouped.sand.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#eebb66" roughness={0.9} />
      </instancedMesh>

      {/* Water - Translucent, shiny */}
      <instancedMesh ref={waterRef} args={[undefined, undefined, grouped.water.length]} receiveShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshPhysicalMaterial 
            color="#2288aa" 
            transmission={0.6} 
            opacity={0.8} 
            transparent 
            roughness={0.1} 
            reflectivity={0.9} 
        />
      </instancedMesh>

      {/* Vegetation - Green, slight variation */}
      <instancedMesh ref={vegRef} args={[undefined, undefined, grouped.vegetation.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#448822" roughness={0.8} />
      </instancedMesh>

      {/* Limestone (Pyramids) - White, polished */}
      <instancedMesh ref={limestoneRef} args={[undefined, undefined, grouped.limestone.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.1} />
      </instancedMesh>

      {/* Gold (Capstones) - Metallic, emissive in sun */}
      <instancedMesh ref={goldRef} args={[undefined, undefined, grouped.gold.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffcc00" metalness={1} roughness={0.1} emissive="#ffaa00" emissiveIntensity={0.2} />
      </instancedMesh>

      {/* Stone (Temples/Sphinx details) */}
      <instancedMesh ref={stoneRef} args={[undefined, undefined, grouped.stone.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#998877" roughness={0.8} />
      </instancedMesh>
      
      {/* Mudbrick (Houses) */}
      <instancedMesh ref={mudbrickRef} args={[undefined, undefined, grouped.mudbrick.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#885533" roughness={0.9} />
      </instancedMesh>
      
      {/* Torches - Emissive */}
      <instancedMesh ref={torchRef} args={[undefined, undefined, grouped.torch.length]}>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff5500" emissiveIntensity={2} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

export default VoxelRenderer;