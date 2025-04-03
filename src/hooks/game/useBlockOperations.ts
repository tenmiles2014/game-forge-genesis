
import { useCallback } from 'react';
import { BlockPattern, rotateBlockPattern } from '../../components/BlockPatterns';
import { GridCellState } from '../../components/GameGrid';
import { isValidPosition } from './utils/gridUtils';

/**
 * Hook for block movement and manipulation
 */
export function useBlockOperations(
  grid: GridCellState[][],
  currentBlock: BlockPattern,
  position: { row: number, col: number },
  setPosition: (position: { row: number, col: number }) => void,
  placeBlock: () => void,
  gameOver: boolean,
  gamePaused: boolean
) {
  // Move the block in a specified direction
  const moveBlock = useCallback((direction: 'left' | 'right' | 'down') => {
    if (gameOver || gamePaused) return false;
    
    let newRow = position.row;
    let newCol = position.col;
    
    if (direction === 'left') newCol -= 1;
    if (direction === 'right') newCol += 1;
    if (direction === 'down') newRow += 1;
    
    if (isValidPosition(grid, currentBlock.shape, newRow, newCol)) {
      setPosition({ row: newRow, col: newCol });
      return true;
    } else if (direction === 'down') {
      // If we can't move down, place the block
      placeBlock();
    }
    return false;
  }, [gameOver, gamePaused, position, currentBlock.shape, grid, setPosition, placeBlock]);
  
  // Rotate the current block
  const rotateBlock = useCallback(() => {
    if (gameOver || gamePaused) return;
    
    const rotatedShape = rotateBlockPattern(currentBlock.shape);
    
    if (isValidPosition(grid, rotatedShape, position.row, position.col)) {
      const updatedBlock = {
        ...currentBlock,
        shape: rotatedShape
      };
      return updatedBlock;
    }
    return null;
  }, [gameOver, gamePaused, currentBlock, position, grid]);
  
  // Drop the block to the lowest valid position
  const dropBlock = useCallback(() => {
    if (gameOver || gamePaused) return;
    
    let newRow = position.row;
    
    // Find the lowest valid position
    while (isValidPosition(grid, currentBlock.shape, newRow + 1, position.col)) {
      newRow++;
    }
    
    setPosition({ row: newRow, col: position.col });
    placeBlock();
  }, [gameOver, gamePaused, position, currentBlock.shape, grid, setPosition, placeBlock]);

  return {
    moveBlock,
    rotateBlock,
    dropBlock
  };
}
