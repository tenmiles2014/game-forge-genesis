
import { useState, useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';

/**
 * Hook to validate block positions against the game grid
 */
export function usePositionValidator(
  grid: number[][][],
  currentBlock: BlockPattern
) {
  const gridSize = grid?.length || 10;

  // Check if position is valid based on grid and block shape
  const isValidPosition = useCallback((newPosition: { x: number; y: number; z: number }): boolean => {
    // Check if block or grid is missing - fail safely
    if (!currentBlock?.shape || !grid || grid.length === 0) {
      console.log('⚠️ Missing data for position check - grid or currentBlock not ready');
      return false;
    }
    
    try {
      // Validate position based on block shape and grid boundaries
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const gridX = newPosition.x + x;
            const gridY = newPosition.y;
            const gridZ = newPosition.z + y;
  
            // Check grid boundaries
            if (
              gridX < 0 || gridX >= gridSize ||
              gridY < 0 || gridY >= gridSize ||
              gridZ < 0 || gridZ >= gridSize
            ) {
              return false;
            }
  
            // Check for existing blocks in the grid
            if (grid[gridY][gridX][gridZ] !== 0) {
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
