
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
  // Comprehensive preview validation
  const previewBlocks = useMemo(() => {
    // Extensive logging for debugging
    console.group("🎯 Landing Preview Calculation");
    console.log("Input Conditions:", {
      blockExists: !!currentBlock,
      blockShapeValid: currentBlock?.shape?.length > 0,
      positionValid: position && Object.keys(position).length === 3,
      landingYValid: landingY !== undefined && landingY >= 0
    });

    // Immediate return if any condition is invalid
    if (!currentBlock?.shape || 
        !position || 
        landingY === undefined || 
        landingY < 0) {
      console.warn("❌ Landing preview conditions not met");
      console.groupEnd();
      return [];
    }

    const blocks: React.ReactNode[] = [];

    try {
      // Iterate through block shape
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            // Landing preview block with enhanced visibility
            blocks.push(
              <mesh 
                key={`landing-${x}-${y}`} 
                position={[
                  position.x + x, 
                  landingY, 
                  position.z + y
                ]}
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

            // Drop line visualization
            if (Math.abs(position.y - landingY) > 1) {
              const height = Math.abs(position.y - landingY);
              const midY = (position.y + landingY) / 2;

              blocks.push(
                <mesh 
                  key={`drop-line-${x}-${y}`} 
                  position={[
                    position.x + x, 
                    midY, 
                    position.z + y
                  ]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.05, 0.05, height, 8]} />
                  <meshBasicMaterial 
                    color={currentBlock.color} 
                    transparent={true} 
                    opacity={0.2} 
                  />
                </mesh>
              );
            }
          }
        }
      }

      console.log(`✅ Generated ${blocks.length} preview elements`);
    } catch (error) {
      console.error("❌ Landing preview generation error:", error);
    } finally {
      console.groupEnd();
    }

    return blocks;
  }, [currentBlock, position, landingY]);

  // Render preview blocks
  return <>{previewBlocks}</>;
});

LandingPreview.displayName = 'LandingPreview';
export default LandingPreview;
