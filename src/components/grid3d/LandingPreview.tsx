
import React, { useMemo } from 'react';
import { BlockPattern } from '../BlockPatterns';

interface LandingPreviewProps {
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  landingY: number;
}

const LandingPreview: React.FC<LandingPreviewProps> = React.memo(({ 
  currentBlock, 
  position, 
  landingY 
}) => {
  // Generate preview elements
  const previewElements = useMemo(() => {
    if (!currentBlock?.shape || position === undefined || landingY === undefined) {
      return [];
    }

    console.log(`Generating landing preview: current Y=${position.y}, landing Y=${landingY}`);
    
    // Don't show preview if landing position is the same as current position
    if (position.y >= landingY) {
      return [];
    }

    const elements = [];
    
    // Create ghost blocks at landing position
    for (let row = 0; row < currentBlock.shape.length; row++) {
      for (let col = 0; col < currentBlock.shape[row].length; col++) {
        if (currentBlock.shape[row][col]) {
          // Ghost block at landing position
          elements.push(
            <mesh 
              key={`landing-${col}-${row}`}
              position={[position.x + col, landingY - row, position.z]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial 
                color={currentBlock.color}
                transparent={true}
                opacity={0.4}
                wireframe={false}
              />
            </mesh>
          );

          // Add drop line between current position and landing position
          const heightDiff = position.y - landingY;
          if (heightDiff > 1) {
            elements.push(
              <mesh
                key={`line-${col}-${row}`}
                position={[
                  position.x + col,
                  position.y - (row + heightDiff / 2),
                  position.z
                ]}
                rotation={[0, 0, Math.PI / 2]} // Rotate to make cylinder vertical
              >
                <cylinderGeometry 
                  args={[0.05, 0.05, heightDiff, 6]} 
                />
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

    return elements;
  }, [currentBlock, position, landingY]);

  return <>{previewElements}</>;
});

LandingPreview.displayName = 'LandingPreview';
export default LandingPreview;
