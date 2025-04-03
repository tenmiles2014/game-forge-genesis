import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { placeBlockInGrid } from './utils/placeBlockInGrid';
import { handleGameOver } from './utils/handleGameOver';
import { handleLevelUp } from './utils/handleLevelUp';

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
  checkVerticalStackLimit,
  isValidPosition,
  getRandomBlockPattern,
  getColorIndex,
  INITIAL_POSITION,
  MAX_LEVEL
}: DropBlockActionProps) {
  const dropBlock = useCallback(() => {
    console.log("🎮 Executing drop block action", { 
      currentPosition: JSON.stringify(position),
      currentBlock: currentBlock?.name
    });
    
    // Safety check for grid initialization
    if (!grid || grid.length === 0) {
      console.error("Grid not initialized in dropBlock action");
      return;
    }
    
    // Find the lowest valid position
    let y = position.y;
    
    // Keep moving down until we hit the bottom or another block
    while (isValidPosition({ x: position.x, y: y - 1, z: position.z })) {
      y--;
    }
    
    console.log(`Found landing at y=${y} (original y=${position.y})`);
    
    // Place the block in the grid
    const colorIndex = getColorIndex(currentBlock.color);
    const newGrid = placeBlockInGrid(grid, { ...position, y }, currentBlock, colorIndex);
    setGrid(newGrid);

    // Clear any completed layers
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Check for game over conditions
    // Check if there are any stacked blocks - this is now our only game over condition
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
    
    // Prepare the next block
    const newNextBlock = getRandomBlockPattern();
    console.log("Setting next blocks:", {
      currentWillBe: nextBlock.name,
      nextWillBe: newNextBlock.name
    });
    
    setCurrentBlock(nextBlock);
    setNextBlock(newNextBlock);
    
    // Reset position for the new block to start at spawn point
    const newPosition = {
      x: INITIAL_POSITION.x,
      y: INITIAL_POSITION.y,
      z: INITIAL_POSITION.z
    };
    
    console.log(`New block set, position reset to ${JSON.stringify(newPosition)}`);
    setPosition(newPosition);
    
    // Check if the new position is valid, if not it's game over
    if (!isValidPosition({ x: newPosition.x, y: newPosition.y, z: newPosition.z })) {
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
    checkVerticalStackLimit,
    isValidPosition,
    setCurrentBlock,
    nextBlock,
    setNextBlock,
    setPosition,
    INITIAL_POSITION,
    getColorIndex,
    level,
    MAX_LEVEL,
    setLevel,
    gravityTimerRef,
    setGameOver,
    setTimerActive,
    setControlsEnabled,
    getRandomBlockPattern
  ]);

  return { dropBlock };
}
