
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface SpawnPointIndicatorProps {
  gridSize: number;
}

const SpawnPointIndicator: React.FC<SpawnPointIndicatorProps> = ({ gridSize }) => {
  const [radius, setRadius] = useState(gridSize * 1.5);
  const [shrinking, setShrinking] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const animationRef = useRef<number | null>(null);
  
  // Animation parameters
  const minRadius = gridSize * 0.7; // Smallest circle size
  const maxRadius = gridSize * 1.5; // Largest circle size
  const shrinkSpeed = 0.03; // Speed of circle shrinking
  const pulseSpeed = 0.02; // Speed of opacity pulsing
  
  useEffect(() => {
    const animate = () => {
      setRadius(prevRadius => {
        let newRadius = prevRadius;
        
        // Handle shrinking/expanding logic
        if (shrinking) {
          newRadius -= shrinkSpeed;
          if (newRadius <= minRadius) {
            setShrinking(false);
            // When the circle reaches the grid corners (minRadius), 
            // simulate level up logic here
            console.log("Circle reached grid corners - Level up would trigger here");
          }
        } else {
          newRadius += shrinkSpeed;
          if (newRadius >= maxRadius) {
            setShrinking(true);
          }
        }
        
        return newRadius;
      });
      
      // Create pulsing opacity effect
      setOpacity(prevOpacity => {
        return 0.3 + Math.abs(Math.sin(Date.now() * 0.001) * 0.4);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shrinking, gridSize, minRadius, maxRadius]);
  
  return (
    <group>
      {/* Circular indicator ring */}
      <mesh position={[gridSize/2 - 0.5, -0.5, gridSize/2 - 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.2, radius, 64]} />
        <meshBasicMaterial 
          color="#4A9BF7" 
          transparent={true} 
          opacity={opacity} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default SpawnPointIndicator;
