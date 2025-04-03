
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
  let tempY = position.y;
  let hitObstacle = false;
  
  while (tempY > 0 && !hitObstacle) {
    tempY -= 1; // Try one position lower
    
    // Check if this new position would collide with anything
    for (let z = 0; z < currentBlock.shape.length && !hitObstacle; z++) {
      for (let x = 0; x < currentBlock.shape[z].length && !hitObstacle; x++) {
        if (currentBlock.shape[z][x]) {
          const gridX = position.x + x;
          const gridZ = position.z + z;
          const gridY = tempY;
          
          // Check boundaries
          if (gridX < 0 || gridX >= gridSize || 
              gridY < 0 || 
              gridZ < 0 || gridZ >= gridSize) {
            hitObstacle = true;
            break;
          }
          
          // Check collision with placed blocks
          if (grid[gridY] && grid[gridY][gridX] && grid[gridY][gridX][gridZ] !== 0) {
            hitObstacle = true;
            break;
          }
        }
      }
    }
  }
  
  // If we hit something, set the landing position to one level above
  if (hitObstacle) {
    landingPosition.y = tempY + 1;
  } else {
    // We reached the bottom without hitting anything
    landingPosition.y = 0;
  }

  console.log(`Landing calculator - From Y=${position.y} to landing Y=${landingPosition.y}`);
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
