
import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GyroscopeProps {
  size?: number;
  className?: string;
}

// Arrow component for the gyroscope
const Arrow = ({ direction, color }: { direction: [number, number, number], color: string }) => {
  // Normalize direction vector
  const normalizedDir = new THREE.Vector3(...direction).normalize();
  
  // Arrow length based on the normalized direction
  const length = 1;
  
  // Create position and target for the arrow
  const position = new THREE.Vector3(0, 0, 0);
  const target = new THREE.Vector3().copy(normalizedDir).multiplyScalar(length);
  
  // Calculate rotation to align with the target direction
  const arrowHelper = new THREE.ArrowHelper(normalizedDir, position, length);
  const rotation = new THREE.Euler().setFromQuaternion(arrowHelper.quaternion);
  
  return (
    <group rotation={rotation}>
      {/* Arrow shaft */}
      <mesh position={[0, length/2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, length, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Arrow head */}
      <mesh position={[0, length, 0]} rotation={[Math.PI/2, 0, 0]}>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Label */}
      <mesh position={[0, length + 0.2, 0]}>
        <sprite>
          <spriteMaterial>
            <canvasTexture attach="map">
              {(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 32;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = color;
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const label = direction[0] === 1 ? 'X' : direction[1] === 1 ? 'Y' : 'Z';
                ctx.fillText(label, 32, 16);
                return canvas;
              })()}
            </canvasTexture>
          </spriteMaterial>
        </sprite>
      </mesh>
    </group>
  );
};

// Rotating gyroscope that syncs with the main scene's camera
const RotatingGyroscope = () => {
  const groupRef = React.useRef<THREE.Group>(null);
  
  // Sync rotation with the main scene camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      // Use the inverse of the camera rotation for the gyroscope
      // This makes the gyroscope appear fixed relative to the world space
      const quaternion = camera.quaternion.clone().invert();
      groupRef.current.quaternion.copy(quaternion);
    }
  });
  
  return (
    <group ref={groupRef}>
      <Arrow direction={[1, 0, 0]} color="#ff3333" />
      <Arrow direction={[0, 1, 0]} color="#33ff33" />
      <Arrow direction={[0, 0, 1]} color="#3333ff" />
    </group>
  );
};

const Gyroscope: React.FC<GyroscopeProps> = ({ size = 80, className = "" }) => {
  return (
    <div
      className={`gyroscope-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <RotatingGyroscope />
      </Canvas>
    </div>
  );
};

export default Gyroscope;
