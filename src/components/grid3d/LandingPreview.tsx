
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
    console.log("🎯 Rendering landing preview:", {
      blockExists: !!currentBlock,
      positionValid: !!position,
      landingY,
      yDiff: position?.y - landingY
    });

    // Validation checks
    if (!currentBlock?.shape || 
        !position || 
        landingY === undefined || 
        landingY < 0 ||
        landingY >= position.y) {
      console.warn("❌ Cannot render landing preview - invalid inputs");
      return [];
    }

    const elements = [];
    const heightDiff = position.y - landingY;
    
    // Only show preview if there's a meaningful distance
    if (heightDiff <= 0) {
      return [];
    }

    try {
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
                  wireframe={true}
                />
              </mesh>
            );

            // Add drop line between current position and landing
            if (heightDiff > 1) {
              elements.push(
                <mesh
                  key={`line-${x}-${z}`}
                  position={[
                    position.x + x,
                    (position.y + landingY) / 2,
                    position.z + z
                  ]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry 
                    args={[0.05, 0.05, heightDiff, 8]} 
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
    } catch (error) {
      console.error("❌ Error rendering landing preview:", error);
    }

    console.log(`✅ Generated ${elements.length} preview elements`);
    return elements;
  }, [currentBlock, position, landingY]);

  // Return preview elements
  return <>{previewElements}</>;
});

LandingPreview.displayName = 'LandingPreview';
export default LandingPreview;
