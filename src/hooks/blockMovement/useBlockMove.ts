
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
    
    // Safety checks
    if (!Array.isArray(grid) || grid.length === 0) {
      console.log('⚠️ Grid not initialized - cannot move block', grid);
      return false;
    }
    
    if (!currentBlock || !currentBlock.shape) {
      console.log('⚠️ Current block not initialized - cannot move block', currentBlock);
      return false;
    }
    
    if (gameOver) {
      console.log('🛑 Game is over - cannot move block');
      return false;
    }
    
    if (gamePaused) {
      console.log('⏸️ Game is paused - cannot move block');
      return false;
    }
    
    if (!controlsEnabled) {
      console.log('🔒 Controls disabled - cannot move block');
      return false;
    }

    try {
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
  
      console.log(`📍 Current position: ${JSON.stringify(currentPosition)}`);
      console.log(`📍 Testing new position: ${JSON.stringify(newPosition)}`);
  
      if (isValidPosition(newPosition)) {
        setPosition(newPosition);
        console.log(`✅ Block moved successfully: ${direction}`);
        return true;
      } else {
        console.log(`❌ Invalid move: ${direction} - Position would be invalid`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in moveBlock:', error);
      return false;
    }
  }, [
    currentPosition, 
    isValidPosition, 
    setPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled,
    grid,
    currentBlock
  ]);

  return { moveBlock };
}
