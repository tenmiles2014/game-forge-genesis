
import { useBlockMove } from './blockMovement/useBlockMove';
import { useBlockRotation } from './blockMovement/useBlockRotation';
import { useBlockDrop } from './blockMovement/useBlockDrop';
import { usePositionValidator } from './blockMovement/usePositionValidator';
import { BlockPattern } from '../components/BlockPatterns';

/**
 * Main hook for block movement that combines move, rotate and drop functionality
 */
export function useBlockMovement(
  grid: number[][][], 
  currentBlock: BlockPattern, 
  currentPosition: { x: number; y: number; z: number },
  setPosition: (pos: { x: number; y: number; z: number }) => void,
  gamePaused: boolean,
  gameOver: boolean,
  controlsEnabled: boolean
) {
  const gameState = { gamePaused, gameOver, controlsEnabled };
  
  // Get position validator
  const { isValidPosition } = usePositionValidator(grid, currentBlock);
  
  // Get block movement functionality
  const { moveBlock } = useBlockMove(
    grid, 
    currentBlock, 
    currentPosition, 
    setPosition, 
    gameState
  );
  
  // Get block rotation functionality
  const { rotateBlock } = useBlockRotation(
    grid, 
    currentBlock, 
    currentPosition, 
    gameState
  );
  
  // Get block drop functionality
  const { dropBlock } = useBlockDrop(
    grid, 
    currentBlock, 
    currentPosition, 
    setPosition, 
    gameState
  );

  return {
    moveBlock,
    rotateBlock,
    dropBlock,
    isValidPosition
  };
}
