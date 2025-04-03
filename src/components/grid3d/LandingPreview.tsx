
import React, { useEffect } from 'react';
import { BlockPattern } from '../BlockPatterns';

interface LandingPreviewProps {
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  landingY: number;
}

const LandingPreview: React.FC<LandingPreviewProps> = ({ currentBlock, position, landingY }) => {
  // Log when the component renders for debugging
  useEffect(() => {
    console.log("LandingPreview rendering with:", { 
      blockColor: currentBlock?.color,
      position: position ? `x:${position.x}, y:${position.y}, z:${position.z}` : 'undefined',
      landingY 
    });
  }, [currentBlock, position, landingY]);

  // Enhanced safety checks
  if (!currentBlock?.shape || 
      !position?.x !== undefined || 
      position?.y === undefined || 
      position?.z === undefined || 
      landingY === undefined || 
      landingY === position.y || 
      landingY < 0) {
    console.log("Skipping landing preview due to invalid props", {
      hasCurrentBlock: !!currentBlock,
      hasShape: !!currentBlock?.shape,
      hasPosition: !!position,
      positionX: position?.x,
      positionY: position?.y,
      positionZ: position?.z,
      landingY,
      isSamePosition: position && landingY === position.y
    });
    return null;
  }
  
  const blocks = [];
  
  try {
    // Draw blocks at landing position
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          // Landing preview block
          blocks.push(
            <mesh 
              key={`landing-${x}-${y}`} 
              position={[position.x + x, landingY, position.z + y]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial 
                color={currentBlock.color} 
                transparent={true} 
                opacity={0.5}
                wireframe={false}
              />
            </mesh>
          );
          
          // Add drop line visualization using cylindrical meshes
          if (Math.abs(position.y - landingY) > 1) {
            const height = Math.abs(position.y - landingY);
            const midY = (position.y + landingY) / 2;
            
            blocks.push(
              <mesh 
                key={`drop-line-${x}-${y}`} 
                position={[position.x + x, midY, position.z + y]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[0.03, 0.03, height, 4]} />
                <meshBasicMaterial 
                  color={currentBlock.color} 
                  transparent={true} 
                  opacity={0.3} 
                />
              </mesh>
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error rendering landing preview:", error);
    return null;
  }
  
  return <>{blocks}</>;
};

export default LandingPreview;
