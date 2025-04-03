
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
  
  // Use block spawning hook
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
      currentBlock: currentBlock?.color,
      hasGrid: !!grid && grid.length > 0
    });
    
    // Safety check for grid initialization
    if (!grid || grid.length === 0) {
      console.error("Grid not initialized in dropBlock action");
      return;
    }
    
    // Safety check for current block and position
    if (!currentBlock || !position || position.y === undefined) {
      console.error("Invalid currentBlock or position in dropBlock action", {
        hasCurrentBlock: !!currentBlock,
        hasPosition: !!position,
        positionY: position?.y
      });
      return;
    }
    
    // First, disable controls to prevent any input during block placement and spawning
    setControlsEnabled(false);
    
    // Place the block in the grid
    const colorIndex = getColorIndex(currentBlock.color);
    const newGrid = placeBlockInGrid(grid, position, currentBlock, colorIndex);
    
    console.log("📥 Placed block in grid at:", JSON.stringify(position));
    setGrid([...newGrid]); // Create a new array to ensure state update

    // Clear any completed layers
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Check if there are any stacked blocks - this is our game over condition
    const hasStacked = checkIfStackedBlocks(newGrid);
    
    if (hasStacked) {
      console.log("🔴 Game over condition detected: blocks have stacked");
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
    if (layersCleared > 0) {
      handleLevelUp(layersCleared, level, MAX_LEVEL, setLevel);
    }
    
    // Important: Clean timeout before spawning the next block
    if (gravityTimerRef.current) {
      clearTimeout(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Use a short delay before spawning the next block to ensure state updates
    // have completed and to give visual feedback between block placement and spawn
    console.log("🔄 Scheduling next block spawn after placement");
    setTimeout(() => {
      try {
        // Spawn next block and check if it's a valid position
        console.log("🔄 Attempting to spawn next block after successful placement");
        spawnNextBlock();
        
        // Re-enable controls after spawning a new block
        console.log("✅ New block spawned successfully, re-enabling controls");
        setControlsEnabled(true);
      } catch (error) {
        console.error("Error in block spawning process:", error);
        // Fallback to ensure game doesn't get stuck
        setControlsEnabled(true);
      }
    }, 200); // Slightly longer delay to ensure state updates have processed
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
