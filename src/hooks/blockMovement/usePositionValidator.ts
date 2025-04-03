
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';

/**
 * Hook to validate block positions against the game grid
 */
export function usePositionValidator(
  grid: number[][][],
  currentBlock: BlockPattern
) {
  // Default to a reasonable grid size if grid isn't initialized yet
  const gridSize = Array.isArray(grid) && grid.length > 0 ? grid.length : 10;

  // Check if position is valid based on grid and block shape
  const isValidPosition = useCallback((newPosition: { x: number; y: number; z: number }): boolean => {
    // Check if block or grid is missing - fail safely
    if (!currentBlock?.shape || !Array.isArray(grid) || grid.length === 0) {
      console.log('⚠️ Missing data for position check - grid or currentBlock not ready', {
        gridExists: Array.isArray(grid),
        gridLength: Array.isArray(grid) ? grid.length : 0,
        blockExists: !!currentBlock,
        blockShapeExists: currentBlock && !!currentBlock.shape
      });
      return false;
    }
    
    // Make a clean copy of the position to avoid reference issues
    const positionToCheck = { 
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z
    };
    
    try {
      // Validate position based on block shape and grid boundaries
      for (let z = 0; z < currentBlock.shape.length; z++) {
        for (let x = 0; x < currentBlock.shape[z].length; x++) {
          if (currentBlock.shape[z][x]) {
            const gridX = positionToCheck.x + x;
            const gridY = positionToCheck.y;
            const gridZ = positionToCheck.z + z;
            
            // Check grid boundaries
            if (
              gridX < 0 || gridX >= gridSize ||
              gridY < 0 || gridY >= gridSize ||
              gridZ < 0 || gridZ >= gridSize
            ) {
              console.log(`📍 Out of bounds at [${gridX}, ${gridY}, ${gridZ}]`);
              return false;
            }
  
            // Check for existing blocks in the grid
            try {
              // Ensure the grid has this position before checking
              if (grid[gridY] && grid[gridY][gridX] && grid[gridY][gridX][gridZ] !== 0) {
                console.log(`📍 Collision at [${gridX}, ${gridY}, ${gridZ}]`);
                return false;
              }
            } catch (error) {
              console.error(`Grid access error at [${gridY}][${gridX}][${gridZ}]`, error);
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Error in position validation:', error);
      return false;
    }
  }, [grid, currentBlock, gridSize]);

  return { isValidPosition };
}
