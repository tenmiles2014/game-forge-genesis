
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  console.log("🔍 Landing calculation - Input:", { 
    gridExists: !!grid, 
    gridSize: grid?.length ?? 0,
    blockShape: currentBlock?.shape,
    position
  });
  
  // Strict validation with fallback
  if (!grid || grid.length === 0 || !currentBlock?.shape) {
    console.warn("Invalid grid or block for landing calculation");
    return { 
      x: position?.x ?? 4, 
      y: Math.floor(grid?.length ? grid.length - 1 : 9), 
      z: position?.z ?? 4 
    };
  }

  const gridSize = grid.length;
  let landingY = position.y;
  
  // Safety check: ensure position is within grid
  const safeX = Math.max(0, Math.min(position.x, gridSize - 1));
  const safeZ = Math.max(0, Math.min(position.z, gridSize - 1));
  
  // Landing position calculation with enhanced safety
  while (landingY > 0) {
    let canMoveDown = true;
    
    for (let blockY = 0; blockY < currentBlock.shape.length; blockY++) {
      for (let blockX = 0; blockX < currentBlock.shape[blockY].length; blockX++) {
        if (currentBlock.shape[blockY][blockX]) {
          const checkY = landingY - 1;
          const checkX = safeX + blockX;
          const checkZ = safeZ + blockY;
          
          // Comprehensive boundary and collision checks
          if (checkY < 0 || 
              checkX < 0 || 
              checkZ < 0 || 
              checkX >= gridSize || 
              checkY >= gridSize || 
              checkZ >= gridSize ||
              (grid[checkY] && grid[checkY][checkX] && grid[checkY][checkX][checkZ] !== 0)) {
            canMoveDown = false;
            break;
          }
        }
      }
      if (!canMoveDown) break;
    }
    
    if (!canMoveDown) break;
    landingY--;
  }

  const finalPosition = {
    x: safeX,
    y: Math.max(0, landingY),
    z: safeZ
  };
  
  console.log("🎯 Landing calculation - Result:", finalPosition);
  return finalPosition;
};

export const isValidLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): boolean => {
  try {
    if (!grid || !currentBlock?.shape || !position) {
      console.warn("❌ Invalid inputs for landing position validation");
      return false;
    }
    
    const landingPosition = calculateLandingPosition(grid, currentBlock, position);
    const isValid = landingPosition.y !== position.y && 
                   landingPosition.y >= 0 && 
                   landingPosition.y < (grid?.length || 10);
                   
    console.log("✅ Landing position valid:", isValid, { 
      originalY: position.y, 
      landingY: landingPosition.y 
    });
    
    return isValid;
  } catch (error) {
    console.error("❌ Landing position validation error:", error);
    return false;
  }
};
