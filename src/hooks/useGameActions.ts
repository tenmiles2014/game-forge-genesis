
import { BlockPattern } from "../components/BlockPatterns";
import { toast } from "@/components/ui/use-toast";
import { useCallback } from "react";

interface GameActionsProps {
  grid: number[][][];
  setGrid: (grid: number[][][]) => void;
  score: number;
  setScore: (score: number) => void;
  currentBlock: BlockPattern;
  setCurrentBlock: (block: BlockPattern) => void;
  nextBlock: BlockPattern;
  setNextBlock: (block: BlockPattern) => void;
  position: { x: number; y: number; z: number };
  setPosition: (position: { x: number; y: number; z: number }) => void;
  setGameOver: (gameOver: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  level: number;
  setLevel: (level: number) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  setLinesCleared: (fn: (prev: number) => number) => void;
  clearCompleteLayers: (grid: number[][][]) => number;
  checkIfStackedBlocks: (grid: number[][][]) => boolean;
  checkVerticalStackLimit: (grid: number[][][]) => boolean;
  isValidPosition: (pattern: number[][], x: number, y: number, z: number) => boolean;
  getRandomBlockPattern: () => BlockPattern;
  getColorIndex: (color: string) => number;
  INITIAL_POSITION: { x: number; y: number; z: number };
  MAX_LEVEL: number;
}

export function useGameActions({
  grid,
  setGrid,
  score,
  setScore,
  currentBlock,
  setCurrentBlock,
  nextBlock,
  setNextBlock,
  position,
  setPosition,
  setGameOver,
  setControlsEnabled,
  setTimerActive,
  setGamePaused,
  level,
  setLevel,
  gravityTimerRef,
  setLinesCleared,
  clearCompleteLayers,
  checkIfStackedBlocks,
  checkVerticalStackLimit,
  isValidPosition,
  getRandomBlockPattern,
  getColorIndex,
  INITIAL_POSITION,
  MAX_LEVEL
}: GameActionsProps) {
  
  const resetGame = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setTimerActive(false);
    setGamePaused(true);
    
    toast({
      title: "Game Rules",
      description: "Blocks drop from top to bottom. Game ends if blocks stack too high!",
    });
  }, [
    gravityTimerRef,
    setGameOver,
    setControlsEnabled,
    setLevel,
    setTimerActive,
    setGamePaused
  ]);

  const placeBlock = useCallback(() => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          const gridX = position.x + x;
          const gridY = position.y;
          const gridZ = position.z + y;
          
          if (
            gridX >= 0 && gridX < grid.length &&
            gridY >= 0 && gridY < grid.length &&
            gridZ >= 0 && gridZ < grid.length
          ) {
            newGrid[gridY][gridX][gridZ] = getColorIndex(currentBlock.color);
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    const layersCleared = clearCompleteLayers(newGrid);
    
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    if (checkIfStackedBlocks(newGrid) || checkVerticalStackLimit(newGrid) || !isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `Blocks stacked too high. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
    setPosition(newPosition);
    
    if (layersCleared > 0 && level < MAX_LEVEL) {
      const layerThreshold = Math.ceil(level / 5) + 1;
      if (layersCleared >= layerThreshold) {
        const newLevel = Math.min(MAX_LEVEL, level + 1);
        setLevel(newLevel);
        toast({
          title: `Level Up!`,
          description: `You are now on level ${newLevel}`,
        });
      }
    }
  }, [
    grid, currentBlock, position, nextBlock, score, level,
    setGrid, setCurrentBlock, setNextBlock, setPosition,
    setGameOver, setControlsEnabled, setTimerActive, setGamePaused, setLevel,
    clearCompleteLayers, checkIfStackedBlocks, checkVerticalStackLimit, isValidPosition,
    getRandomBlockPattern, getColorIndex, INITIAL_POSITION, MAX_LEVEL
  ]);

  const dropBlock = useCallback(() => {
    placeBlock();
  }, [placeBlock]);

  const handleTimeUp = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    setGameOver(true);
    setControlsEnabled(false);
    setGamePaused(true);
    toast({
      title: "Time's Up!",
      description: `Final score: ${score} | Level: ${level}`,
    });
  }, [
    gravityTimerRef, score, level,
    setGameOver, setControlsEnabled, setGamePaused
  ]);

  const toggleGamePause = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    const newPausedState = !setGamePaused;
    setGamePaused(newPausedState);
    setTimerActive(!newPausedState);
    setControlsEnabled(!newPausedState);
    
    if (newPausedState) {
      toast({
        title: "Game Paused",
        description: "Take a breather!",
      });
    } else {
      toast({
        title: "Game Resumed",
        description: "Let's go!",
      });
    }
  }, [
    gravityTimerRef, setGamePaused, setTimerActive, setControlsEnabled
  ]);

  const startGame = useCallback(() => {
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
    
    toast({
      title: "Game Started",
      description: "Good luck! Remember: No stacking allowed!",
    });
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return {
    resetGame,
    placeBlock,
    dropBlock,
    handleTimeUp,
    toggleGamePause,
    startGame
  };
}
