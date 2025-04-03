
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
      currentBlock: currentBlock?.color
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
    setGrid(newGrid);

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
    handleLevelUp(layersCleared, level, MAX_LEVEL, setLevel);
    
    // Important: Clean timeout before spawning the next block
    if (gravityTimerRef.current) {
      clearTimeout(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Introduce a delay before spawning next block
    // This helps ensure the current block is fully placed before spawning the next one
    setTimeout(() => {
      // Spawn next block and check if it's a valid position
      console.log("⏱️ Spawning next block after delay");
      const validSpawn = spawnNextBlock();
      
      // Check if the new position is valid, if not it's game over
      if (!validSpawn) {
        console.log("🔴 Game over: no space for new blocks");
        handleGameOver(
          "No space for new blocks!", 
          setGameOver, 
          setTimerActive, 
          setControlsEnabled, 
          gravityTimerRef
        );
      } else {
        // Re-enable controls only if spawn was successful
        console.log("✅ New block spawned successfully, re-enabling controls");
        setControlsEnabled(true);
      }
    }, 100); // Slightly longer delay for more consistent behavior
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
