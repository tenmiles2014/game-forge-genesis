
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  position: { x: number; y: number; z: number },
  currentBlock: BlockPattern,
  grid: number[][][]
): number => {
  let landingY = position.y;
  
  // Clone the current grid to check collisions
  const gridCopy = JSON.parse(JSON.stringify(grid));
  
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
            if (gridCopy[nextY][gridX][gridZ] !== 0) {
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
  
  return landingY;
};
