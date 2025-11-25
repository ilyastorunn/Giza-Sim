import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { TimeOfDay } from '../types';
import * as THREE from 'three';

interface Props {
  timeOfDay: TimeOfDay;
}

const EnvironmentManager: React.FC<Props> = ({ timeOfDay }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  // Config for each time state
  const config = {
    [TimeOfDay.DAWN]: {
      sunPos: [100, 10, 20] as [number, number, number],
      lightColor: '#ff9966',
      ambientColor: '#664444',
      intensity: 1.5,
      ambientIntensity: 0.5,
      fogColor: '#ffccaa',
      fogDensity: 0.015,
      stars: false
    },
    [TimeOfDay.NOON]: {
      sunPos: [10, 100, 10] as [number, number, number],
      lightColor: '#ffffff',
      ambientColor: '#ffffff',
      intensity: 2.5,
      ambientIntensity: 0.8,
      fogColor: '#ccf0ff',
      fogDensity: 0.008,
      stars: false
    },
    [TimeOfDay.GOLDEN_HOUR]: {
      sunPos: [-100, 15, 20] as [number, number, number],
      lightColor: '#ffaa00',
      ambientColor: '#996633',
      intensity: 2,
      ambientIntensity: 0.5,
      fogColor: '#aa5588',
      fogDensity: 0.012,
      stars: false
    },
    [TimeOfDay.NIGHT]: {
      sunPos: [0, -50, 0] as [number, number, number], // Sun below horizon
      lightColor: '#001133', // Moonlight
      ambientColor: '#000022',
      intensity: 0.5,
      ambientIntensity: 0.2,
      fogColor: '#000011',
      fogDensity: 0.02,
      stars: true
    }
  };

  const current = config[timeOfDay];

  // Smooth transition (lerp) logic could go here, but strict state switch is cleaner for now
  
  return (
    <>
      <fog attach="fog" args={[current.fogColor, 10, 120]} />
      <ambientLight ref={ambientRef} color={current.ambientColor} intensity={current.ambientIntensity} />
      
      {timeOfDay !== TimeOfDay.NIGHT && (
         <Sky 
            sunPosition={current.sunPos} 
            turbidity={8} 
            rayleigh={timeOfDay === TimeOfDay.GOLDEN_HOUR ? 4 : 2} 
            mieCoefficient={0.005} 
            mieDirectionalG={0.8} 
         />
      )}
      
      {current.stars && (
          <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}

      {/* Main Sun/Moon Light */}
      <directionalLight
        ref={lightRef}
        position={timeOfDay === TimeOfDay.NIGHT ? [20, 50, 20] : current.sunPos} // Fake moon pos for shadows
        castShadow
        intensity={current.intensity}
        color={current.lightColor}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} far={300} />
      </directionalLight>

      {/* Rim light for definition */}
      <pointLight position={[-50, 20, -50]} intensity={0.2} color="#4444ff" />
    </>
  );
};

export default EnvironmentManager;