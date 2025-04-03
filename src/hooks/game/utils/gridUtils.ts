
import { GridCellState } from '../../../components/GameGrid';
import { BlockPattern } from '../../../components/BlockPatterns';
import { toast } from "@/components/ui/use-toast";

/**
 * Checks if a position is valid for the current block
 */
export const isValidPosition = (
  grid: GridCellState[][],
  pattern: number[][],
  newRow: number,
  newCol: number
): boolean => {
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      if (pattern[r][c]) {
        const gridRow = newRow + r;
        const gridCol = newCol + c;
        
        // Check boundaries
        if (
          gridRow < 0 || 
          gridRow >= grid.length || 
          gridCol < 0 || 
          gridCol >= grid[0].length
        ) {
          return false;
        }
        
        // Check collision with placed blocks
        if (gridRow >= 0 && gridRow < grid.length && 
            gridCol >= 0 && gridCol < grid[0].length && 
            grid[gridRow][gridCol].filled) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Clears completed rows and returns the number of rows cleared
 */
export const clearRows = (
  grid: GridCellState[][],
  setGrid: (grid: GridCellState[][]) => void,
  setScore: (score: (prev: number) => number) => void,
  setLinesCleared: (lines: (prev: number) => number) => void
): number => {
  let rowsCleared = 0;
  const newGrid = [...grid.map(row => [...row])];
  
  // Check each row
  for (let r = newGrid.length - 1; r >= 0; r--) {
    if (newGrid[r].every(cell => cell.filled)) {
      // Remove the row
      newGrid.splice(r, 1);
      // Add a new empty row at the top
      const newRow = Array(newGrid[0].length).fill(0).map(() => ({ filled: false, color: '' }));
      newGrid.unshift(newRow);
      rowsCleared++;
    }
  }
  
  // Update score
  if (rowsCleared > 0) {
    const pointsScored = rowsCleared * rowsCleared * 100;
    setScore(prevScore => prevScore + pointsScored);
    setLinesCleared(prev => prev + rowsCleared);
    toast({
      title: `${rowsCleared} rows cleared!`,
      description: `+${pointsScored} points`,
    });
  }
  
  setGrid(newGrid);
  return rowsCleared;
};
