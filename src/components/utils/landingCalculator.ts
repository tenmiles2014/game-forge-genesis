
import { BlockPattern } from '../BlockPatterns';

export const calculateLandingPosition = (
  grid: number[][][],
  currentBlock: BlockPattern,
  position: { x: number; y: number; z: number }
): { x: number; y: number; z: number } => {
  console.log("🔍 Landing calculation - Input:", { 
    gridExists: !!grid, 
    gridSize: grid?.length ?? 0,
    blockShape: currentBlock?.shape?.length,
    position
  });
  
  // Strict validation
  if (!grid || grid.length === 0 || !currentBlock?.shape) {
    console.warn("Invalid grid or block for landing calculation");
    return { ...position };
  }

  const gridSize = grid.length;
  let landingY = position.y;
  
  // Safety check: ensure position is within grid
  const safeX = Math.max(0, Math.min(position.x, gridSize - 1));
  const safeZ = Math.max(0, Math.min(position.z, gridSize - 1));
  
  // Start from current position and move down until we hit something
  while (landingY > 0) {
    let canMoveDown = true;
    
    for (let blockZ = 0; blockZ < currentBlock.shape.length && canMoveDown; blockZ++) {
      for (let blockX = 0; blockX < currentBlock.shape[blockZ].length && canMoveDown; blockX++) {
        // Only check cells where the block has a cube
        if (currentBlock.shape[blockZ][blockX]) {
          const checkY = landingY - 1; // Position below current Y
          const checkX = safeX + blockX;
          const checkZ = safeZ + blockZ;
          
          // Check if position is out of bounds or occupied by another block
          if (checkY < 0) {
            // Hit bottom of grid
            canMoveDown = false;
            break;
          }
          
          if (checkX < 0 || checkZ < 0 || checkX >= gridSize || checkZ >= gridSize) {
            // Out of horizontal bounds
            canMoveDown = false;
            break;
          }
          
          // Check if position is already occupied by another block
          try {
            if (grid[checkY][checkX][checkZ] !== 0) {
              canMoveDown = false;
              break;
            }
          } catch (error) {
            console.error("Grid access error:", error, { checkY, checkX, checkZ, gridSize });
            canMoveDown = false;
            break;
          }
        }
      }
    }
    
    if (!canMoveDown) {
      break;
    }
    
    landingY--;
  }

  const finalPosition = {
    x: safeX,
    y: Math.max(0, landingY),
    z: safeZ
  };
  
  console.log("🎯 Landing calculation - Result:", finalPosition, "Original:", position);
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
    
    // Valid landing position is one that's different from the current position
    // and within the grid bounds
    const isValid = landingPosition.y !== position.y && 
                   landingPosition.y >= 0 && 
                   landingPosition.y < (grid?.length || 10);
                   
    console.log("✅ Landing position validation:", {
      original: position,
      landing: landingPosition,
      valid: isValid
    });
    
    return isValid;
  } catch (error) {
    console.error("❌ Landing position validation error:", error);
    return false;
  }
};
