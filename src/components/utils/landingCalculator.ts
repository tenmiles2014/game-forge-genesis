
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  // Safety check for inputs
  if (!grid || grid.length === 0 || !currentBlock?.shape || !position) {
    return { ...position };
  }

  const gridSize = grid.length;
  
  // Create a copy of the position to avoid modifying the original
  const landingPosition = { ...position };
  
  // Start from current position and move down until we hit something
  let hitObstacle = false;
  
  while (landingPosition.y > 0 && !hitObstacle) {
    landingPosition.y -= 1; // Try one position lower
    
    // Check if this new position would collide with anything
    for (let z = 0; z < currentBlock.shape.length; z++) {
      for (let x = 0; x < currentBlock.shape[z].length; x++) {
        if (currentBlock.shape[z][x]) {
          const gridX = position.x + x;
          const gridZ = position.z + z;
          const gridY = landingPosition.y;
          
          // Check boundaries
          if (gridX < 0 || gridX >= gridSize || 
              gridY < 0 || 
              gridZ < 0 || gridZ >= gridSize) {
            hitObstacle = true;
            break;
          }
          
          // Check collision with placed blocks
          if (grid[gridY][gridX][gridZ] !== 0) {
            hitObstacle = true;
            break;
          }
        }
      }
      if (hitObstacle) break;
    }
  }
  
  // If we hit something, move back up one position
  if (hitObstacle) {
    landingPosition.y += 1;
  }

  return landingPosition;
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
  return landingPosition.y !== position.y && landingPosition.y >= 0;
};
