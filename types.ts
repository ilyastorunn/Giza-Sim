export enum TimeOfDay {
  DAWN = 'DAWN',
  NOON = 'NOON',
  GOLDEN_HOUR = 'GOLDEN_HOUR',
  NIGHT = 'NIGHT'
}

export type VoxelData = {
  position: [number, number, number];
  color?: string; // Hex string
  type: 'sand' | 'water' | 'vegetation' | 'limestone' | 'gold' | 'stone' | 'mudbrick' | 'torch';
};

export interface SceneState {
  timeOfDay: TimeOfDay;
  tourMode: boolean;
}