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
  isValidPosition: (pattern: number[][], newX: number, newY: number, newZ: number) => boolean;
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
    // Find the lowest valid position
    let y = position.y;
    
    // Keep moving down until we hit the bottom or another block
    while (isValidPosition(currentBlock.shape, position.x, y - 1, position.z)) {
      y--;
    }
    
    // Place the block in the grid
    const newGrid = [...grid];
    const colorIndex = getColorIndex(currentBlock.color);
    
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
    
    // Check for game over conditions
    const hasStacked = checkIfStackedBlocks(newGrid);
    const isStackTooHigh = checkVerticalStackLimit(newGrid);
    
    if (isStackTooHigh) {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      
      setGameOver(true);
      setTimerActive(false);
      setControlsEnabled(false);
      
      toast({
        title: "Game Over",
        description: "Blocks stacked too high!",
        variant: "destructive"
      });
      
      return;
    }
    
    // Check if we need to level up
    if (layersCleared > 0) {
      if (level < MAX_LEVEL) {
        const newLevel = Math.min(MAX_LEVEL, Math.floor(1 + (level + (layersCleared / 10))));
        
        if (newLevel > level) {
          setLevel(newLevel);
          
          toast({
            title: "Level Up!",
            description: `Now at Level ${newLevel}`,
          });
        }
      }
    }
    
    // Generate a new block and update position
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    
    // Check if the new position is valid, if not it's game over
    if (!isValidPosition(nextBlock.shape, INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z)) {
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
    setControlsEnabled
  ]);

  return { dropBlock };
}
