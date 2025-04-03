
import { useCallback } from 'react';
import { useResetGameAction } from './gameActions/useResetGameAction';
import { useTimeUpAction } from './gameActions/useTimeUpAction';
import { useGamePauseAction } from './gameActions/useGamePauseAction';
import { useStartGameAction } from './useStartGameAction';
import { BlockPattern } from '../components/BlockPatterns';

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
  setLinesCleared: (lines: number) => void;
  clearCompleteLayers: (gridState: number[][][]) => number;
  checkIfStackedBlocks: (gridState: number[][][]) => boolean;
  checkVerticalStackLimit: (gridState: number[][][]) => boolean;
  isValidPosition: (newPosition: { x: number; y: number; z: number }) => boolean;
  getRandomBlockPattern: () => BlockPattern;
  getColorIndex: (color: string) => number;
  INITIAL_POSITION: { x: number; y: number; z: number };
  MAX_LEVEL: number;
  gamePaused: boolean;
  gameOver: boolean; // Add the gameOver prop
  resetPosition?: () => void;
  initializeGrid?: () => number[][][];
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
  MAX_LEVEL,
  gamePaused,
  gameOver, // Add the gameOver parameter here
  resetPosition,
  initializeGrid
}: GameActionsProps) {
  // Reset game action
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
    INITIAL_POSITION,
    initializeGrid
  });
  
  // Time up action
  const { handleTimeUp } = useTimeUpAction({
    gameOver,
    setGameOver,
    setTimerActive,
    setControlsEnabled,
    gravityTimerRef,
    score, // Pass the score
    level  // Pass the level
  });
  
  // Toggle game pause
  const { toggleGamePause } = useGamePauseAction({
    gamePaused,
    gameOver,
    setGamePaused,
    gravityTimerRef,
    setTimerActive
  });
  
  // Start game
  const { startGame } = useStartGameAction({
    setGamePaused,
    setTimerActive,
    setControlsEnabled,
    resetPosition,
    setGrid,
    initializeGrid
  });
  
  return {
    resetGame,
    handleTimeUp,
    toggleGamePause,
    startGame
  };
}
