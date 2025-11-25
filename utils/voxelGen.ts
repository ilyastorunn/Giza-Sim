import { VoxelData } from '../types';

// Simple pseudo-random number generator for consistency
const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}
const rand = mulberry32(12345);

// Noise function approximation for dunes
function noise(x: number, z: number) {
    return Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 + Math.sin(x * 0.1 + z * 0.1) * 1;
}

export const generateWorld = (): VoxelData[] => {
  const voxels: VoxelData[] = [];
  const width = 140; // World width (East-West)
  const depth = 100; // World depth (North-South)
  
  // 1. Terrain & Nile
  for (let x = -width / 2; x < width / 2; x++) {
    for (let z = -depth / 2; z < depth / 2; z++) {
        let y = Math.floor(noise(x, z));
        
        // The Nile (East side of map)
        const nileEdge = 30;
        const riverWidth = 40;
        
        if (x > nileEdge && x < nileEdge + riverWidth) {
             // River Bed
             y = -2;
             // Water Surface
             voxels.push({ position: [x, -0.5, z], type: 'water' });
             // Deep water
             if (rand() > 0.5) voxels.push({ position: [x, -1.5, z], type: 'water' });
        } else if (x >= nileEdge + riverWidth) {
            // Far East Bank (Greenery)
            y = 0;
            voxels.push({ position: [x, y, z], type: 'vegetation' });
            if (rand() > 0.8) { // Trees
                generatePalmTree(x, y + 1, z, voxels);
            }
        } else {
            // West Bank & Desert
            // Vegetation belt near river
            if (x > nileEdge - 15) {
                 y = 0; // Flat fertile land
                 voxels.push({ position: [x, y, z], type: 'vegetation' });
                 
                 // Dense Palms near water
                 if (x > nileEdge - 8 && rand() > 0.6) {
                    generatePalmTree(x, y + 1, z, voxels);
                 }
                 // Worker houses
                 if (x < nileEdge - 10 && rand() > 0.97) {
                    generateHouse(x, y + 1, z, voxels);
                 }

            } else {
                // Desert rise
                y = Math.floor(noise(x, z) * 1.5 + (nileEdge - x) * 0.1); 
                voxels.push({ position: [x, y, z], type: 'sand' });
            }
        }
    }
  }

  // 2. The Great Pyramid (Khufu) - Center-ish
  generatePyramid(-20, 0, -10, 44, voxels);

  // 3. Pyramid of Khafre - South West
  generatePyramid(-50, 0, 25, 40, voxels);

  // 4. Pyramid of Menkaure - Far South West
  generatePyramid(-70, 0, 50, 26, voxels);
  
  // 5. The Sphinx - Guarding the causeway near the vegetation belt
  generateSphinx(15, 0, -5, voxels);

  // 6. Causeway (Simple)
  generateCauseway(15, -20, -5, voxels);

  return voxels;
};

const generatePyramid = (cx: number, cy: number, cz: number, baseSize: number, voxels: VoxelData[]) => {
    // Determine ground height at center to sit it on top
    const groundH = Math.max(0, Math.floor(noise(cx, cz) * 1.5 + (30 - cx) * 0.1));
    const startY = groundH;

    const height = Math.floor(baseSize / 2);

    for (let y = 0; y < height; y++) {
        const currentSize = baseSize - (y * 2);
        const half = Math.floor(currentSize / 2);
        
        // Optimization: Only draw the shell/perimeter for lower layers
        // For the top few layers, draw solid
        const isSolid = currentSize < 4;

        for (let x = -half; x <= half; x++) {
            for (let z = -half; z <= half; z++) {
                // If it's the perimeter or solid, add block
                if (isSolid || Math.abs(x) === half || Math.abs(z) === half) {
                    const isCapstone = y >= height - 2;
                    voxels.push({
                        position: [cx + x, startY + y, cz + z],
                        type: isCapstone ? 'gold' : 'limestone'
                    });
                }
            }
        }
    }
};

const generatePalmTree = (x: number, y: number, z: number, voxels: VoxelData[]) => {
    const height = 4 + Math.floor(rand() * 3);
    // Trunk
    for (let i = 0; i < height; i++) {
        voxels.push({ position: [x, y + i, z], type: 'stone' }); // Using stone color as bark approximation
    }
    // Leaves
    const top = y + height;
    const offsets = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]];
    offsets.forEach(([ox, oz]) => {
        voxels.push({ position: [x + ox, top, z + oz], type: 'vegetation' });
        voxels.push({ position: [x + ox * 2, top - 1, z + oz * 2], type: 'vegetation' });
    });
    voxels.push({ position: [x, top + 1, z], type: 'vegetation' });
};

const generateSphinx = (x: number, y: number, z: number, voxels: VoxelData[]) => {
    // Base/Paws
    for(let i=0; i<12; i++) {
        for(let j=0; j<6; j++) {
             voxels.push({ position: [x - i, y, z + j - 3], type: 'sand' });
        }
    }
    // Paws sticking out front (East is +x)
    voxels.push({ position: [x + 1, y, z - 2], type: 'sand' });
    voxels.push({ position: [x + 2, y, z - 2], type: 'sand' });
    voxels.push({ position: [x + 1, y, z + 2], type: 'sand' });
    voxels.push({ position: [x + 2, y, z + 2], type: 'sand' });

    // Body
    for(let i=0; i<10; i++) {
        for(let j=0; j<4; j++) {
             for(let k=1; k<5; k++) {
                voxels.push({ position: [x - i, y + k, z + j - 2], type: 'sand' });
             }
        }
    }
    
    // Head (Human)
    const headX = x - 1; 
    const headY = y + 5;
    for(let hx=0; hx<3; hx++) {
        for(let hz=0; hz<3; hz++) {
            for(let hy=0; hy<3; hy++) {
                 voxels.push({ position: [headX - hx, headY + hy, z + hz - 1], type: 'sand' });
            }
        }
    }
    // Nemes Headdress (Blue/Gold stripes ideally, approximating with limestone/gold mix or just stone)
    voxels.push({ position: [headX, headY + 3, z], type: 'gold' });
};

const generateHouse = (x: number, y: number, z: number, voxels: VoxelData[]) => {
    for(let dx=0; dx<3; dx++) {
        for(let dz=0; dz<3; dz++) {
            for(let dy=0; dy<2; dy++) {
                // Hollow inside
                if (dy === 0 || dx === 0 || dx === 2 || dz === 0 || dz === 2) {
                     voxels.push({ position: [x+dx, y+dy, z+dz], type: 'mudbrick' });
                }
            }
        }
    }
    // Torch at door
    voxels.push({ position: [x+3, y+1, z+1], type: 'torch' });
};

const generateCauseway = (startX: number, endX: number, z: number, voxels: VoxelData[]) => {
    // Simple line connecting sphinx area to pyramid area
    const start = Math.min(startX, endX);
    const end = Math.max(startX, endX);
    
    // Calculate slope height? Keep it flat-ish for now or stepped
    for(let x = start; x <= end; x++) {
        const y = Math.floor(noise(x, z) * 1.5 + (30 - x) * 0.1); 
        // Floor
        voxels.push({ position: [x, y, z], type: 'stone' });
        voxels.push({ position: [x, y, z+1], type: 'stone' });
        // Roof (Covered causeway)
        voxels.push({ position: [x, y+2, z], type: 'stone' });
        voxels.push({ position: [x, y+2, z+1], type: 'stone' });
        // Pillars
        if (x % 3 === 0) {
             voxels.push({ position: [x, y+1, z-1], type: 'stone' });
             voxels.push({ position: [x, y+1, z+2], type: 'stone' });
        }
    }
}
