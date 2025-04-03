
import { useRef } from 'react';
import { useGameState } from '../useGameState';
import { useBlockMovement } from '../useBlockMovement';
import { useGridOperations } from '../useGridOperations';
import { useGameActions } from '../useGameActions';

export function useGameController() {
  // Reference for orbit controls to update camera position
  const orbitControlsRef = useRef(null);
  
  const {
    grid, setGrid,
    score, setScore,
    currentBlock, setCurrentBlock,
    nextBlock, setNextBlock,
    position, setPosition,
    gameOver, setGameOver,
    controlsEnabled, setControlsEnabled,
    level, setLevel,
    timeLimit, setTimeLimit,
    timerActive, setTimerActive,
    gamePaused, setGamePaused,
    linesCleared, setLinesCleared,
    gravityTimerRef,
    getDropSpeed,
    getColorIndex,
    INITIAL_POSITION,
    MAX_LEVEL,
    GRID_SIZE,
    VERTICAL_STACK_LIMIT,
    initializeGrid
  } = useGameState();

  // Get block movement utilities
  const { isValidPosition, moveBlock, rotateBlock, dropBlock } = useBlockMovement(
    grid, currentBlock, position, setPosition, gamePaused, gameOver, controlsEnabled
  );

  // Get grid operation utilities
  const { clearCompleteLayers, checkIfStackedBlocks, checkVerticalStackLimit } = useGridOperations(
    grid, 
    setGrid, 
    setScore,
    setLinesCleared,
    level, 
    GRID_SIZE, 
    VERTICAL_STACK_LIMIT
  );

  // Create reset position function
  const resetPosition = () => {
    console.log("🔄 Resetting block position to initial position");
    setPosition({...INITIAL_POSITION});
  };

  // Create game action props
  const gameActionProps = {
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
    getRandomBlockPattern: require('../../components/BlockPatterns').getRandomBlockPattern,
    getColorIndex,
    INITIAL_POSITION,
    MAX_LEVEL,
    gamePaused,
    gameOver,
    resetPosition,
    initializeGrid
  };

  // Get game actions
  const {
    resetGame,
    handleTimeUp,
    toggleGamePause,
    startGame
  } = useGameActions(gameActionProps);

  return {
    grid,
    currentBlock,
    nextBlock,
    position,
    linesCleared,
    score,
    level,
    MAX_LEVEL,
    timerActive,
    timeLimit,
    gamePaused,
    gameOver,
    controlsEnabled,
    orbitControlsRef,
    handleTimeUp,
    resetGame,
    startGame,
    toggleGamePause
  };
}
