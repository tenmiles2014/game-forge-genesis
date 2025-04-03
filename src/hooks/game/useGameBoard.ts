
import { useState, useCallback } from 'react';
import { GridCellState } from '../../components/GameGrid';

// Constants
const GRID_ROWS = 10;
const GRID_COLS = 10;

/**
 * Hook for managing the game board state and operations
 */
export function useGameBoard() {
  // Game board state
  const [grid, setGrid] = useState<GridCellState[][]>([]);
  
  // Initialize game grid
  const initializeGrid = useCallback(() => {
    const newGrid: GridCellState[][] = [];
    for (let i = 0; i < GRID_ROWS; i++) {
      const row: GridCellState[] = [];
      for (let j = 0; j < GRID_COLS; j++) {
        row.push({ filled: false, color: '' });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  return {
    grid,
    setGrid,
    initializeGrid,
    GRID_ROWS,
    GRID_COLS
  };
}
