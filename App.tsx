import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { TimeOfDay, SceneState } from './types';
import { generateWorld } from './utils/voxelGen';
import VoxelRenderer from './components/VoxelRenderer';
import EnvironmentManager from './components/EnvironmentManager';
import CameraController from './components/CameraController';
import { 
  SunIcon, 
  MoonIcon, 
  VideoCameraIcon, 
  HandRaisedIcon 
} from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [sceneState, setSceneState] = useState<SceneState>({
    timeOfDay: TimeOfDay.NOON,
    tourMode: false,
  });

  // Generate world once on mount
  const voxels = useMemo(() => generateWorld(), []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        cycleTime();
      }
      if (e.key.toLowerCase() === 't') {
        toggleTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cycleTime = () => {
    setSceneState(prev => {
      const order = [TimeOfDay.DAWN, TimeOfDay.NOON, TimeOfDay.GOLDEN_HOUR, TimeOfDay.NIGHT];
      const idx = order.indexOf(prev.timeOfDay);
      return { ...prev, timeOfDay: order[(idx + 1) % order.length] };
    });
  };

  const toggleTour = () => {
    setSceneState(prev => ({ ...prev, tourMode: !prev.tourMode }));
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [60, 40, 60], fov: 45 }}>
        <EnvironmentManager timeOfDay={sceneState.timeOfDay} />
        <VoxelRenderer voxels={voxels} />
        <CameraController tourMode={sceneState.tourMode} />
        
        {/* Simple reflective plane for water reflection approximation (optional, heavy on perf) */}
        {/* We skip a real planar reflection for voxel style consistency and stick to shiny blocks */}
      </Canvas>

      <Loader />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 p-6 pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-widest drop-shadow-md" style={{ fontFamily: 'serif' }}>
          GIZA <span className="text-amber-400">ETERNAL</span>
        </h1>
        <p className="text-white/80 text-sm mt-2 max-w-xs">
          Old Kingdom Simulation • Dynasty IV
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-2xl">
        <button 
          onClick={cycleTime}
          className="p-3 rounded-full bg-white/10 hover:bg-amber-500/20 text-white transition-all group relative"
          title="[L] Cycle Time"
        >
            {sceneState.timeOfDay === TimeOfDay.NIGHT ? <MoonIcon className="w-6 h-6 text-blue-200" /> : <SunIcon className={`w-6 h-6 ${sceneState.timeOfDay === TimeOfDay.NOON ? 'text-yellow-200' : 'text-orange-400'}`} />}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white">
                {sceneState.timeOfDay}
            </span>
        </button>

        <div className="w-px bg-white/20 mx-1"></div>

        <button 
          onClick={toggleTour}
          className={`p-3 rounded-full transition-all group relative ${sceneState.tourMode ? 'bg-amber-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          title="[T] Toggle Tour"
        >
           {sceneState.tourMode ? <VideoCameraIcon className="w-6 h-6" /> : <HandRaisedIcon className="w-6 h-6" />}
           <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white">
                {sceneState.tourMode ? 'Stop Tour' : 'Start Tour'}
            </span>
        </button>
      </div>

      <div className="absolute top-6 right-6 text-white/50 text-xs text-right pointer-events-none">
        <p>CAM: Orbit / Scroll</p>
        <p>KEYS: [L] Light • [T] Tour</p>
      </div>
    </div>
  );
};

export default App;