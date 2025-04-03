
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { placeBlockInGrid } from './utils/placeBlockInGrid';
import { handleGameOver } from './utils/handleGameOver';
import { handleLevelUp } from './utils/handleLevelUp';
import { useBlockSpawning } from '../blockMovement/useBlockSpawning';

interface DropBlockActionProps {
  grid: number[][][];
  setGrid: (grid: number[][][]) => void;
  currentBlock: BlockPattern;
  setCurrentBlock: (block: BlockPattern) => void;
  nextBlock: BlockPattern;
  setNextBlock: (block: BlockPattern) => void;
  position: { x: number; y: number; z: number };
  setPosition: (position: { x: number; y: number; z: number }) => void;
  setGameOver: (gameOver: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setTimerActive: (active: boolean) => void;
  level: number;
  setLevel: (level: number) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  clearCompleteLayers: (gridState: number[][][]) => number;
  checkIfStackedBlocks: (gridState: number[][][]) => boolean;
  checkVerticalStackLimit: (gridState: number[][][]) => boolean;
  isValidPosition: (newPosition: { x: number; y: number; z: number }) => boolean;
  getRandomBlockPattern: () => BlockPattern;
  getColorIndex: (color: string) => number;
  INITIAL_POSITION: { x: number; y: number; z: number };
  MAX_LEVEL: number;
}

export function useDropBlockAction({
  grid,
  setGrid,
  currentBlock,
  setCurrentBlock,
  nextBlock,
  setNextBlock,
  position,
  setPosition,
  setGameOver,
  setControlsEnabled,
  setTimerActive,
  level,
  setLevel,
  gravityTimerRef,
  clearCompleteLayers,
  checkIfStackedBlocks,
  isValidPosition,
  getRandomBlockPattern,
  getColorIndex,
  INITIAL_POSITION,
  MAX_LEVEL
}: DropBlockActionProps) {
  
  // Use our new block spawning hook
  const { spawnNextBlock } = useBlockSpawning({
    getRandomBlockPattern,
    setCurrentBlock,
    setNextBlock,
    setPosition,
    INITIAL_POSITION,
    isValidPosition
  });

  const dropBlock = useCallback(() => {
    console.log("🎮 Executing drop block action", { 
      currentPosition: JSON.stringify(position),
      currentBlock: currentBlock?.color
    });
    
    // Safety check for grid initialization
    if (!grid || grid.length === 0) {
      console.error("Grid not initialized in dropBlock action");
      return;
    }
    
    // Place the block in the grid
    const colorIndex = getColorIndex(currentBlock.color);
    const newGrid = placeBlockInGrid(grid, position, currentBlock, colorIndex);
    setGrid(newGrid);

    // Clear any completed layers
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Check if there are any stacked blocks - this is our game over condition
    const hasStacked = checkIfStackedBlocks(newGrid);
    
    if (hasStacked) {
      handleGameOver(
        "Blocks have stacked!", 
        setGameOver, 
        setTimerActive, 
        setControlsEnabled, 
        gravityTimerRef
      );
      return;
    }
    
    // Handle level up if layers were cleared
    handleLevelUp(layersCleared, level, MAX_LEVEL, setLevel);
    
    // Spawn next block and check if it's a valid position
    const validSpawn = spawnNextBlock();
    
    // Check if the new position is valid, if not it's game over
    if (!validSpawn) {
      handleGameOver(
        "No space for new blocks!", 
        setGameOver, 
        setTimerActive, 
        setControlsEnabled, 
        gravityTimerRef
      );
    } else {
      console.log("✅ New block placed successfully at starting position");
    }
  }, [
    grid,
    currentBlock,
    position,
    setGrid,
    clearCompleteLayers,
    checkIfStackedBlocks,
    spawnNextBlock,
    getColorIndex,
    level,
    MAX_LEVEL,
    setLevel,
    gravityTimerRef,
    setGameOver,
    setTimerActive,
    setControlsEnabled
  ]);

  return { dropBlock };
}
