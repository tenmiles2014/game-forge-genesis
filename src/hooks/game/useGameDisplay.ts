
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { GridCellState } from '../../components/GameGrid';

/**
 * Hook to handle grid rendering with current block
 */
export function useGameDisplay(
  grid: GridCellState[][],
  currentBlock: BlockPattern,
  position: { row: number, col: number },
  initializeGrid: () => GridCellState[][]
) {
  // Render the current block on top of the grid
  const renderGridWithCurrentBlock = useCallback(() => {
    // Make sure grid is initialized
    if (!grid || grid.length === 0) {
      return initializeGrid();
    }
    
    // Create a deep copy of the grid
    const displayGrid = grid.map(row => [...row]);
    
    // Add current block to the display grid at its current position
    for (let r = 0; r < currentBlock.shape.length; r++) {
      for (let c = 0; c < currentBlock.shape[r].length; c++) {
        if (currentBlock.shape[r][c]) {
          const gridRow = position.row + r;
          const gridCol = position.col + c;
          
          // Check if the position is within grid bounds before setting
          if (
            gridRow >= 0 && 
            gridRow < grid.length && 
            gridCol >= 0 && 
            gridCol < grid[0].length
          ) {
            displayGrid[gridRow][gridCol] = {
              filled: true,
              color: currentBlock.color
            };
          }
        }
      }
    }
    
    return displayGrid;
  }, [grid, currentBlock, position, initializeGrid]);

  return { renderGridWithCurrentBlock };
}
