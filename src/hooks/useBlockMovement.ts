
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
  const gridSize = grid.length || 10;

  const isValidPosition = useCallback((newPosition: { x: number; y: number; z: number }): boolean => {
    // Validate position based on block shape and grid boundaries
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          const gridX = newPosition.x + x;
          const gridY = newPosition.y - y;
          const gridZ = newPosition.z + y;

          // Check grid boundaries
          if (
            gridX < 0 || gridX >= gridSize ||
            gridY < 0 || gridY >= gridSize ||
            gridZ < 0 || gridZ >= gridSize
          ) {
            console.warn(`❌ Invalid Position: Out of Grid Bounds 
              Position: (${gridX}, ${gridY}, ${gridZ})
              Grid Size: ${gridSize}`);
            return false;
          }

          // Check for existing blocks in the grid
          if (grid[gridY][gridX][gridZ] !== 0) {
            console.warn(`❌ Invalid Position: Block Collision 
              Position: (${gridX}, ${gridY}, ${gridZ})`);
            return false;
          }
        }
      }
    }
    return true;
  }, [grid, currentBlock, gridSize]);

  const moveBlock = useCallback((direction: 'left' | 'right' | 'forward' | 'backward' | 'down'): boolean => {
    console.log(`🕹️ Attempting to move block: ${direction}`);
    
    // Comprehensive pre-movement checks
    if (gameOver) {
      console.warn('❌ Cannot move: Game is over');
      return false;
    }
    
    if (gamePaused) {
      console.warn('❌ Cannot move: Game is paused');
      toast({
        title: "Game Paused",
        description: "Unpause to move blocks"
      });
      return false;
    }
    
    if (!controlsEnabled) {
      console.warn('❌ Cannot move: Controls are disabled');
      toast({
        title: "Controls Disabled",
        description: "Wait for game initialization"
      });
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

    console.log(`📍 New Position: ${JSON.stringify(newPosition)}`);

    if (isValidPosition(newPosition)) {
      setPosition(newPosition);
      console.log(`✅ Block moved successfully: ${direction}`);
      return true;
    } else {
      console.warn(`❌ Invalid move: ${direction}`);
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

  const rotateBlock = useCallback((axis: 'x' | 'y' | 'z'): number[][] | null => {
    console.log(`🔄 Attempting to rotate block around ${axis} axis`);
    
    // Comprehensive pre-rotation checks
    if (gameOver || gamePaused || !controlsEnabled) {
      console.warn('❌ Cannot rotate block');
      return null;
    }

    const rotateMatrix = (matrix: number[][]): number[][] => {
      return matrix[0].map((val, index) => 
        matrix.map(row => row[index]).reverse()
      );
    };

    const rotatedShape = rotateMatrix(currentBlock.shape);
    
    // Test rotated position validity
    const testPosition = { ...currentPosition };
    const isValid = isValidPosition({ 
      ...testPosition, 
      x: testPosition.x, 
      y: testPosition.y, 
      z: testPosition.z 
    });

    if (isValid) {
      console.log('✅ Block rotation successful');
      return rotatedShape;
    } else {
      console.warn('❌ Invalid block rotation');
      return null;
    }
  }, [
    currentBlock, 
    currentPosition, 
    isValidPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled
  ]);

  const dropBlock = useCallback(() => {
    console.log('⬇️ Attempting to drop block');
    
    if (gameOver || gamePaused || !controlsEnabled) {
      console.warn('❌ Cannot drop block');
      return;
    }

    let newPosition = { ...currentPosition };
    while (isValidPosition({ ...newPosition, y: newPosition.y - 1 })) {
      newPosition.y -= 1;
    }

    setPosition(newPosition);
    console.log(`✅ Block dropped to position: ${JSON.stringify(newPosition)}`);
  }, [
    currentPosition, 
    isValidPosition, 
    setPosition, 
    gameOver, 
    gamePaused, 
    controlsEnabled
  ]);

  return {
    moveBlock,
    rotateBlock,
    dropBlock,
    isValidPosition
  };
}
