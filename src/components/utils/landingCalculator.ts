
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  // Validate inputs
  if (!grid || grid.length === 0 || !currentBlock?.shape || !position) {
    return { ...position };
  }

  const gridSize = grid.length;
  let landingY = position.y;
  
  // Check if the block is completely out of bounds, if so return original position
  if (position.x < 0 || position.z < 0 || 
      position.x + currentBlock.shape[0].length > gridSize || 
      position.z + currentBlock.shape.length > gridSize) {
    return { ...position };
  }
  
  // Start from current position and move down until we hit something
  let hitGround = false;
  
  // Only check positions that are equal to or below the current position
  while (landingY > 0 && !hitGround) {
    const nextY = landingY - 1;  // Try one position down
    
    // Check each block in the shape
    outerLoop: for (let blockZ = 0; blockZ < currentBlock.shape.length; blockZ++) {
      for (let blockX = 0; blockX < currentBlock.shape[blockZ].length; blockX++) {
        // Only check cells where the block has a cube
        if (currentBlock.shape[blockZ][blockX]) {
          const gridX = position.x + blockX;
          const gridZ = position.z + blockZ;
          
          // Skip checks for out-of-bounds positions
          if (gridX < 0 || gridZ < 0 || gridX >= gridSize || gridZ >= gridSize) {
            continue;
          }
          
          // Check if we hit the bottom of the grid
          if (nextY < 0) {
            hitGround = true;
            break outerLoop;
          }
          
          // Check if position is already occupied by another block
          try {
            if (grid[nextY][gridX][gridZ] !== 0) {
              hitGround = true;
              break outerLoop;
            }
          } catch (error) {
            // If there's an error accessing the grid, assume we hit something
            hitGround = true;
            break outerLoop;
          }
        }
      }
    }
    
    // If we didn't hit anything, continue moving down
    if (!hitGround) {
      landingY = nextY;
    }
  }

  return {
    x: position.x,
    y: landingY,
    z: position.z
  };
};

export const isValidLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): boolean => {
  if (!grid || !currentBlock?.shape || !position) {
    return false;
  }
  
  const landingPosition = calculateLandingPosition(grid, currentBlock, position);
  
  // Valid landing position is one that's different from the current position
  // (means we can actually move down) and within the grid bounds
  return landingPosition.y !== position.y && landingPosition.y >= 0;
};
