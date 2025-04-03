
import { useCallback } from 'react';
import { usePositionValidator } from './usePositionValidator';
import { BlockPattern } from '../../components/BlockPatterns';

export function useBlockDrop(
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

  const dropBlock = useCallback(() => {
    console.log('⬇️ Attempting to drop block');
    
    // Safety checks
    if (!grid || grid.length === 0) {
      console.log('⚠️ Grid not initialized - cannot drop block');
      return;
    }
    
    if (gameOver || gamePaused || !controlsEnabled) {
      console.log('⛔ Game state prevents dropping');
      return;
    }

    try {
      let newPosition = { ...currentPosition };
      let foundBottom = false;
      
      // Find the lowest valid position
      while (!foundBottom) {
        let testPosition = { ...newPosition, y: newPosition.y - 1 };
        if (isValidPosition(testPosition)) {
          newPosition = testPosition;
        } else {
          foundBottom = true;
        }
      }
  
      setPosition(newPosition);
      console.log(`✅ Block dropped to position: ${JSON.stringify(newPosition)}`);
    } catch (error) {
      console.error('❌ Error in dropBlock:', error);
    }
  }, [
    currentPosition, 
    isValidPosition, 
    setPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled,
    grid
  ]);

  return { dropBlock };
}
