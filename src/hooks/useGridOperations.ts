
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getRandomBlockPattern } from '../components/BlockPatterns';

export function useGridOperations(
  grid: number[][][],
  setGrid: (grid: number[][][]) => void,
  setScore: (score: (prev: number) => number) => void,
  setLinesCleared: (lines: (prev: number) => number) => void,
  level: number,
  GRID_SIZE: number,
  VERTICAL_STACK_LIMIT: number
) {
  const clearCompleteLayers = (gridState: number[][][]) => {
    let layersCleared = 0;
    const gridCopy = JSON.parse(JSON.stringify(gridState));
    const gridSize = GRID_SIZE;
    
    // Check and clear complete layers
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        let blockCount = 0;
        for (let x = 0; x < gridSize; x++) {
          if (gridCopy[y][x][z] !== 0) {
            blockCount++;
          }
        }
        
        if (blockCount === 10) {
          for (let x = 0; x < gridSize; x++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
    }
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        let blockCount = 0;
        for (let z = 0; z < gridSize; z++) {
          if (gridCopy[y][x][z] !== 0) {
            blockCount++;
          }
        }
        
        if (blockCount === 10) {
          for (let z = 0; z < gridSize; z++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
    }
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        let blockCount = 0;
        for (let y = 0; y < gridSize; y++) {
          if (gridCopy[y][x][z] !== 0) {
            blockCount++;
          }
        }
        
        if (blockCount === 10) {
          for (let y = 0; y < gridSize; y++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
    }
    
    for (let y = 0; y < gridSize; y++) {
      let blockCount = 0;
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          if (gridCopy[y][x][z] !== 0) {
            blockCount++;
          }
        }
      }
      
      if (blockCount === 100) {
        for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
            gridCopy[y][x][z] = 0;
          }
        }
        layersCleared++;
      }
    }
    
    // Apply gravity to make blocks fall after clearing layers
    if (layersCleared > 0) {
      applyGravity(gridCopy);
      
      // Update score and notify
      const levelMultiplier = 1 + (level * 0.1);
      const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
      setScore((prev) => prev + pointsScored);
      setLinesCleared((prev) => prev + layersCleared);
      toast({
        title: `${layersCleared} lines cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid(gridCopy);
    return layersCleared;
  };

  // New function to apply gravity after clearing layers
  const applyGravity = (gridState: number[][][]) => {
    const gridSize = gridState.length;
    
    // Process each column (x,z coordinate)
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Start from the bottom and move blocks down if there's empty space
        let emptyY = -1;
        
        // Find blocks and empty spaces, moving from bottom to top
        for (let y = gridSize - 1; y >= 0; y--) {
          if (gridState[y][x][z] === 0) {
            // Found an empty space
            if (emptyY === -1) emptyY = y;
          } else if (emptyY !== -1) {
            // Found a block above an empty space, move it down
            gridState[emptyY][x][z] = gridState[y][x][z];
            gridState[y][x][z] = 0;
            
            // Start looking for the next empty space from the current position
            y = emptyY;
            emptyY = -1;
          }
        }
      }
    }
  };

  const checkIfStackedBlocks = (gridState: number[][][]) => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let blockCount = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
          if (gridState[y][x][z] !== 0) {
            blockCount++;
          }
          if (blockCount > 1) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const checkVerticalStackLimit = (gridState: number[][][]) => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let highestBlock = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
          if (gridState[y][x][z] !== 0) {
            highestBlock = y;
            break;
          }
        }
        
        if (highestBlock >= VERTICAL_STACK_LIMIT) {
          return true;
        }
      }
    }
    return false;
  };

  return {
    clearCompleteLayers,
    checkIfStackedBlocks,
    checkVerticalStackLimit
  };
}
