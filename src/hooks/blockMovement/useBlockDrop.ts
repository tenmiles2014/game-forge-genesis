
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { usePositionValidator } from './usePositionValidator';

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
    console.log("⬇️ Attempting to drop block");
    
    if (gameOver || gamePaused || !controlsEnabled) {
      console.log("❌ Cannot drop block - game state prevents it");
      return;
    }
    
    let newY = currentPosition.y;
    
    // Find the lowest valid position
    while (isValidPosition({ x: currentPosition.x, y: newY - 1, z: currentPosition.z })) {
      newY--;
    }
    
    console.log(`✅ Block dropped to position: ${JSON.stringify({ ...currentPosition, y: newY })}`);
    setPosition({ ...currentPosition, y: newY });
  }, [
    currentPosition, 
    isValidPosition, 
    setPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled
  ]);

  return { dropBlock };
}
