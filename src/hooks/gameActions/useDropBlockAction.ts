import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern } from '../../components/BlockPatterns';

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
    const newGrid = JSON.parse(JSON.stringify(grid)); // Deep clone to avoid mutation
    const colorIndex = getColorIndex(currentBlock.color);
    
    console.log(`Placing block at position [x:${position.x}, y:${y}, z:${position.z}]`, {
      blockShape: JSON.stringify(currentBlock.shape),
      color: currentBlock.color,
      colorIndex
    });
    
    for (let yy = 0; yy < currentBlock.shape.length; yy++) {
      for (let xx = 0; xx < currentBlock.shape[yy].length; xx++) {
        if (currentBlock.shape[yy][xx]) {
          const gridX = position.x + xx;
          const gridY = y;
          const gridZ = position.z + yy;
          
          if (
            gridX >= 0 && gridX < grid.length &&
            gridY >= 0 && gridY < grid.length &&
            gridZ >= 0 && gridZ < grid.length
          ) {
            newGrid[gridY][gridX][gridZ] = colorIndex;
          }
        }
      }
    }
    
    setGrid(newGrid);

    // Clear any completed layers
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Check for game over conditions - NEW LOGIC HERE
    // Check if there are any stacked blocks - this is now our only game over condition
    const hasStacked = checkIfStackedBlocks(newGrid);
    
    if (hasStacked) {
      console.log("🎮 Game over: blocks are stacked");
      
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      
      setGameOver(true);
      setTimerActive(false);
      setControlsEnabled(false);
      
      toast({
        title: "Game Over",
        description: "Blocks have stacked!",
        variant: "destructive"
      });
      
      return;
    }
    
    // Check if we need to level up
    if (layersCleared > 0) {
      if (level < MAX_LEVEL) {
        const newLevel = Math.min(MAX_LEVEL, Math.floor(1 + (level + (layersCleared / 10))));
        
        if (newLevel > level) {
          console.log(`🎮 Level up! Now at level ${newLevel}`);
          setLevel(newLevel);
          
          toast({
            title: "Level Up!",
            description: `Now at Level ${newLevel}`,
          });
        }
      }
    }
    
    // Prepare the next block - IMPORTANT: Set next block before position
    // This ensures the new block is ready when we check position validity
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
      console.log("🎮 Game over: no space for new blocks");
      
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      
      setGameOver(true);
      setTimerActive(false);
      setControlsEnabled(false);
      
      toast({
        title: "Game Over",
        description: "No space for new blocks!",
        variant: "destructive"
      });
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
