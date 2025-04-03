
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { usePositionValidator } from './usePositionValidator';

export function useBlockMove(
  grid: number[][][], 
  currentBlock: BlockPattern, 
  currentPosition: { x: number; y: number; z: number },
  setPosition: (pos: { x: number; y: number; z: number }) => void,
  gameState: { 
    gamePaused: boolean; 
    gameOver: boolean; 
    controlsEnabled: boolean;
  }
) {
  const { isValidPosition } = usePositionValidator(grid, currentBlock);
  const { gamePaused, gameOver, controlsEnabled } = gameState;

  const moveBlock = useCallback((direction: 'left' | 'right' | 'forward' | 'backward' | 'down'): boolean => {
    console.log(`🕹️ Attempting to move block: ${direction}`);
    
    if (gameOver || gamePaused || !controlsEnabled) {
      console.log('❌ Cannot move block - game state prevents it');
      return false;
    }

    let newPosition = { ...currentPosition };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'forward':
        newPosition.z -= 1;
        break;
      case 'backward':
        newPosition.z += 1;
        break;
      case 'down':
        newPosition.y -= 1;
        break;
    }

    if (isValidPosition(newPosition)) {
      setPosition(newPosition);
      console.log(`✅ Block moved successfully: ${direction}`);
      return true;
    } else {
      console.log(`❌ Invalid move: ${direction} - Position would be invalid`);
      
      // Special case: if we can't move down, we've hit bottom or another block
      if (direction === 'down') {
        console.log('Block has landed - ready for placement');
      }
      
      return false;
    }
  }, [
    currentPosition, 
    isValidPosition, 
    setPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled
  ]);

  return { moveBlock };
}
