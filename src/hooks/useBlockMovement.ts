
import { useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern } from '../components/BlockPatterns';

export function useBlockMovement(
  grid: number[][][], 
  currentBlock: BlockPattern, 
  currentPosition: { x: number; y: number; z: number },
  setPosition: (pos: { x: number; y: number; z: number }) => void,
  gamePaused: boolean,
  gameOver: boolean,
  controlsEnabled: boolean
) {
  const gridSize = grid?.length || 10;

  // Check if position is valid based on grid and block shape
  const isValidPosition = useCallback((newPosition: { x: number; y: number; z: number }): boolean => {
    // Check if block or grid is missing - fail safely
    if (!currentBlock?.shape || !grid || grid.length === 0) {
      console.log('⚠️ Missing data for position check - grid or currentBlock not ready');
      return false;
    }
    
    try {
      // Validate position based on block shape and grid boundaries
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const gridX = newPosition.x + x;
            const gridY = newPosition.y;
            const gridZ = newPosition.z + y;
  
            // Check grid boundaries
            if (
              gridX < 0 || gridX >= gridSize ||
              gridY < 0 || gridY >= gridSize ||
              gridZ < 0 || gridZ >= gridSize
            ) {
              return false;
            }
  
            // Check for existing blocks in the grid
            if (grid[gridY][gridX][gridZ] !== 0) {
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Error in position validation:', error);
      return false;
    }
  }, [grid, currentBlock, gridSize]);

  const moveBlock = useCallback((direction: 'left' | 'right' | 'forward' | 'backward' | 'down'): boolean => {
    console.log(`🕹️ Attempting to move block: ${direction}`);
    
    // Safety checks
    if (!grid || grid.length === 0) {
      console.log('⚠️ Grid not initialized - cannot move block');
      return false;
    }
    
    if (!currentBlock || !currentBlock.shape) {
      console.log('⚠️ Current block not initialized - cannot move block');
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
  
      console.log(`📍 Testing position: ${JSON.stringify(newPosition)}`);
  
      if (isValidPosition(newPosition)) {
        setPosition(newPosition);
        console.log(`✅ Block moved successfully: ${direction}`);
        return true;
      } else {
        console.log(`❌ Invalid move: ${direction}`);
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

  return {
    moveBlock,
    rotateBlock,
    dropBlock,
    isValidPosition
  };
}
