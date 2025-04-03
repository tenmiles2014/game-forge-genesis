
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
      landingYValid: landingY !== undefined && landingY >= 0,
      positionY: position?.y,
      landingY: landingY
    });

    // Immediate return if any condition is invalid
    if (!currentBlock?.shape || 
        !position || 
        landingY === undefined || 
        landingY < 0 ||
        landingY === position.y) { // Don't show preview if landing at the same spot
      console.warn("❌ Landing preview conditions not met");
      console.groupEnd();
      return [];
    }

    const blocks: React.ReactNode[] = [];
    const heightDiff = Math.abs(position.y - landingY);

    try {
      // Iterate through block shape
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            // Only show landing preview if it's significantly different from current position
            if (heightDiff > 0) {
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
            }

            // Drop line visualization - only if block is significantly above landing
            if (heightDiff > 1) {
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
                  <cylinderGeometry args={[0.05, 0.05, heightDiff, 8]} />
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

      console.log(`✅ Generated ${blocks.length} preview elements`, { heightDiff });
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
