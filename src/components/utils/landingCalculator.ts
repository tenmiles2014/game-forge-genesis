
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  // Return current position if grid or block is invalid
  if (!grid || grid.length === 0 || !currentBlock) {
    console.log("Invalid grid or block data for landing position calculation");
    return { ...position };
  }
  
  let landingY = position.y;
  
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
  
  return { x: position.x, y: landingY, z: position.z };
};
