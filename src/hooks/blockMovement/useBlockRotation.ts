
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { usePositionValidator } from './usePositionValidator';

export function useBlockRotation(
  grid: number[][][], 
  currentBlock: BlockPattern, 
  currentPosition: { x: number; y: number; z: number },
  gameState: { 
    gamePaused: boolean; 
    gameOver: boolean; 
    controlsEnabled: boolean;
  }
) {
  const { isValidPosition } = usePositionValidator(grid, currentBlock);
  const { gamePaused, gameOver, controlsEnabled } = gameState;
  
  const rotateBlock = useCallback((axis: 'x' | 'y' | 'z'): number[][] | null => {
    console.log(`🔄 Attempting to rotate block around ${axis} axis`);
    
    // Safety checks
    if (!grid || grid.length === 0) {
      console.log('⚠️ Grid not initialized - cannot rotate block');
      return null;
    }
    
    if (!currentBlock || !currentBlock.shape) {
      console.log('⚠️ Current block not initialized - cannot rotate block');
      return null;
    }
    
    if (gameOver || gamePaused || !controlsEnabled) {
      console.log('⛔ Game state prevents rotation');
      return null;
    }

    try {
      const rotateMatrix = (matrix: number[][]): number[][] => {
        return matrix[0].map((val, index) => 
          matrix.map(row => row[index]).reverse()
        );
      };
  
      const rotatedShape = rotateMatrix(currentBlock.shape);
      
      // Test rotated position validity
      const isValid = isValidPosition({ 
        ...currentPosition
      });
  
      if (isValid) {
        console.log('✅ Block rotation successful');
        return rotatedShape;
      } else {
        console.log('❌ Invalid block rotation');
        return null;
      }
    } catch (error) {
      console.error('❌ Error in rotateBlock:', error);
      return null;
    }
  }, [
    currentBlock, 
    currentPosition, 
    isValidPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled,
    grid
  ]);

  return { rotateBlock };
}
