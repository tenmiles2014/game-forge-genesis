
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  // Create a default safe position as fallback
  const defaultPosition = { ...position };
  
  // Perform thorough validation of input data
  if (!grid || grid.length === 0 || !currentBlock || !currentBlock.shape || 
      !position || position.y === undefined) {
    console.log("Invalid input data for landing position calculation", { 
      gridExists: !!grid, 
      gridLength: grid?.length || 0,
      blockExists: !!currentBlock,
      blockShapeExists: !!currentBlock?.shape,
      positionExists: !!position,
      positionYDefined: position?.y !== undefined
    });
    return defaultPosition;
  }
  
  // Start at current position and move down
  let landingY = position.y;
  
  try {
    // Check each possible position below the current one
    while (landingY > 0) {
      let canMoveDown = true;
      
      // Check if the block would collide at the next position down
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const nextY = landingY - 1;
            const gridX = position.x + x;
            const gridZ = position.z + y;
            
            // Check grid boundaries
            if (nextY < 0) {
              canMoveDown = false;
              break;
            }
            
            // Check collision with existing blocks
            if (
              gridX >= 0 && 
              gridX < grid.length && 
              nextY >= 0 && 
              nextY < grid.length && 
              gridZ >= 0 && 
              gridZ < grid.length
            ) {
              if (grid[nextY][gridX][gridZ] !== 0) {
                canMoveDown = false;
                break;
              }
            }
          }
        }
        if (!canMoveDown) break;
      }
      
      if (!canMoveDown) break;
      landingY--;
    }
    
    console.log(`Landing position calculated: x=${position.x}, y=${landingY}, z=${position.z}`);
    
    // Always return a new object to avoid reference issues
    return { 
      x: position.x, 
      y: landingY, 
      z: position.z 
    };
  } catch (error) {
    console.error("Error in landing position calculation:", error);
    return { ...defaultPosition };
  }
};
