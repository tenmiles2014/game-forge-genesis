
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface SpawnPointIndicatorProps {
  gridSize: number;
  isGameActive?: boolean;
  level?: number;
  maxLevel?: number;
}

const SpawnPointIndicator: React.FC<SpawnPointIndicatorProps> = ({ 
  gridSize, 
  isGameActive = false,
  level = 1,
  maxLevel = 99
}) => {
  const [radius, setRadius] = useState(gridSize * 1.2);
  const [shrinking, setShrinking] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const animationRef = useRef<number | null>(null);
  
  // Animation parameters
  const minRadius = gridSize * 0.9; // Smallest circle size
  const maxRadius = gridSize * 1.2; // Largest circle size
  const shrinkSpeed = 0.02; // Speed of circle shrinking
  
  useEffect(() => {
    // Only animate if the game is active
    if (!isGameActive) {
      // Reset to static state when game is paused/not started
      setRadius(gridSize * 1.0);
      setOpacity(0.5);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      setRadius(prevRadius => {
        let newRadius = prevRadius;
        
        // Handle shrinking/expanding logic
        if (shrinking) {
          newRadius -= shrinkSpeed;
          if (newRadius <= minRadius) {
            setShrinking(false);
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
        return 0.4 + Math.abs(Math.sin(Date.now() * 0.001) * 0.4);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [shrinking, gridSize, minRadius, maxRadius, isGameActive]);
  
  // Calculate color based on level
  const getColorForLevel = () => {
    // Start with blue for low levels, transition to purple for high levels
    const levelProgress = Math.min(level / maxLevel, 1);
    const r = Math.round(74 + (levelProgress * 80)); // 4A -> 9B
    const g = Math.round(155 - (levelProgress * 70)); // 9B -> 5F
    const b = Math.round(247 - (levelProgress * 30)); // F7 -> D0
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  return (
    <group>
      {/* Circular indicator ring at the ground level */}
      <mesh position={[gridSize/2 - 0.5, 0, gridSize/2 - 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.4, radius, 64]} />
        <meshBasicMaterial 
          color={getColorForLevel()}
          transparent={true} 
          opacity={opacity} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default SpawnPointIndicator;
