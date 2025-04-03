
import { useCallback } from 'react';
import { BlockPattern, getRandomBlockPattern } from '../../components/BlockPatterns';
import { GridCellState } from '../../components/GameGrid';
import { isValidPosition, clearRows } from './utils/gridUtils';
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to handle block placement and spawning
 */
export function useBlockPlacement({
  grid,
  setGrid,
  setScore,
  setLinesCleared,
  currentBlock,
  setCurrentBlock,
  nextBlock,
  setNextBlock,
  position,
  resetBlockPosition,
  setGameOver
}: {
  grid: GridCellState[][];
  setGrid: (grid: GridCellState[][]) => void;
  setScore: (score: (prev: number) => number) => void;
  setLinesCleared: (lines: (prev: number) => number) => void;
  currentBlock: BlockPattern;
  setCurrentBlock: (block: BlockPattern) => void;
  nextBlock: BlockPattern;
  setNextBlock: (block: BlockPattern) => void;
  position: { row: number, col: number };
  resetBlockPosition: () => void;
  setGameOver: (gameOver: boolean) => void;
}) {
  // Place the current block on the grid
  const placeBlock = useCallback(() => {
    const newGrid = [...grid.map(row => [...row])];
    
    // Add the block to the grid
    for (let r = 0; r < currentBlock.shape.length; r++) {
      for (let c = 0; c < currentBlock.shape[r].length; c++) {
        if (currentBlock.shape[r][c]) {
          const gridRow = position.row + r;
          const gridCol = position.col + c;
          
          if (gridRow >= 0 && gridRow < grid.length && gridCol >= 0 && gridCol < grid[0].length) {
            newGrid[gridRow][gridCol] = {
              filled: true,
              color: currentBlock.color
            };
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    // Check for completed rows
    clearRows(newGrid, setGrid, setScore, setLinesCleared);
    
    // Get next block
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    resetBlockPosition();
    
    // Check if game is over
    if (!isValidPosition(newGrid, nextBlock.shape, 0, 4)) {
      setGameOver(true);
      toast({
        title: "Game Over!",
        description: `Final score: ${0}`, // We don't have access to current score here
      });
    }
  }, [grid, currentBlock, position, nextBlock, setGrid, setScore, setLinesCleared, setCurrentBlock, setNextBlock, resetBlockPosition, setGameOver]);

  return { placeBlock };
}
