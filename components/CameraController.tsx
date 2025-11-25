import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  tourMode: boolean;
}

const CameraController: React.FC<Props> = ({ tourMode }) => {
  const controlsRef = useRef<any>(null);
  const vec = new THREE.Vector3();
  const lookAtVec = new THREE.Vector3();

  useFrame((state) => {
    if (tourMode) {
      // Tour Path Logic
      const t = state.clock.getElapsedTime() * 0.1; // Slow speed
      
      // Path definition:
      // Starts at River (East, +X)
      // Flies over Sphinx
      // Goes up causeway to Great Pyramid (West, -X)
      
      // Parametric path approximation
      // t=0 -> x=50 (River)
      // t=end -> x=-30 (Pyramid)
      
      const x = 50 - (t * 10) % 100; // Loop or just linear? Let's make it a sine loop for endless demo
      const clampedX = Math.max(-50, 50 - (state.clock.elapsedTime % 30) * 3.5); 
      
      // Dynamic Height
      const y = 10 + Math.sin(t) * 2; 
      
      // Z wobble
      const z = Math.sin(t * 0.5) * 10;

      // Position Camera
      state.camera.position.lerp(vec.set(clampedX, y + 10, z + 20), 0.05);
      
      // Look at logic
      if (clampedX > 10) {
          // Look at Sphinx
          state.camera.lookAt(lookAtVec.set(15, 5, 0));
      } else {
          // Look at Great Pyramid peak
          state.camera.lookAt(lookAtVec.set(-20, 25, -10));
      }
      
      // Force update controls to sync (though we disable them effectively by overriding cam)
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtVec, 0.1);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls 
        ref={controlsRef}
        enabled={!tourMode}
        maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
        minDistance={5}
        maxDistance={150}
        dampingFactor={0.05}
    />
  );
};

export default CameraController;