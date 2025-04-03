
import React from 'react';
import { BlockPattern } from '../components/BlockPatterns';

// Import all the modularized hooks
import { useResetGameAction } from './gameActions/useResetGameAction';
import { useTimeUpAction } from './gameActions/useTimeUpAction';
import { useGamePauseAction } from './gameActions/useGamePauseAction';
import { useStartGameAction } from './gameActions/useStartGameAction';
import { useDropBlockAction } from './gameActions/useDropBlockAction';

interface GameActionProps {
  grid: number[][][];
  setGrid: (grid: number[][][] | ((prevGrid: number[][][]) => number[][][])) => void;
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
  setLinesCleared: (linesCleared: (prev: number) => number) => void;
  clearCompleteLayers: (gridState: number[][][]) => number;
  checkIfStackedBlocks: (gridState: number[][][]) => boolean;
  checkVerticalStackLimit: (gridState: number[][][]) => boolean;
  isValidPosition: (pattern: number[][], newX: number, newY: number, newZ: number) => boolean;
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
}: GameActionProps) {
  // Import our modularized functions
  const { resetGame } = useResetGameAction({
    setGrid,
    setScore,
    setCurrentBlock,
    setNextBlock,
    setPosition,
    setGameOver,
    setControlsEnabled,
    setTimerActive,
    setGamePaused,
    setLevel,
    gravityTimerRef,
    setLinesCleared,
    getRandomBlockPattern,
    INITIAL_POSITION
  });

  const { handleTimeUp } = useTimeUpAction({
    setGameOver,
    setTimerActive,
    setControlsEnabled,
    gravityTimerRef,
    score, 
    level
  });

  const { toggleGamePause } = useGamePauseAction({
    gravityTimerRef,
    setGamePaused,
    setTimerActive,
    setControlsEnabled
  });

  const { startGame } = useStartGameAction({
    setGamePaused,
    setTimerActive,
    setControlsEnabled
  });

  const { dropBlock } = useDropBlockAction({
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
  });

  return {
    resetGame,
    handleTimeUp,
    toggleGamePause,
    startGame,
    dropBlock
  };
}
