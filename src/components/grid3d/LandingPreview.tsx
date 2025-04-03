
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
    if (position.y <= landingY) {
      return [];
    }

    const elements = [];
    
    // Create ghost blocks at landing position
    for (let z = 0; z < currentBlock.shape.length; z++) {
      for (let x = 0; x < currentBlock.shape[z].length; x++) {
        if (currentBlock.shape[z][x]) {
          // Ghost block at landing position
          elements.push(
            <mesh 
              key={`landing-${x}-${z}`}
              position={[position.x + x, landingY, position.z + z]}
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
                key={`line-${x}-${z}`}
                position={[
                  position.x + x,
                  position.y - (heightDiff / 2),
                  position.z + z
                ]}
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
