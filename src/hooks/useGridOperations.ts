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
    
    if (layersCleared > 0) {
      const levelMultiplier = 1 + (level * 0.1);
      const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
      setScore((prev) => prev + pointsScored);
      setLinesCleared((prev) => prev + layersCleared);
      toast({
        title: `${layersCleared} lines cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid([...gridCopy]);
    return layersCleared;
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
