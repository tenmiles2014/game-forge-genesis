
import React from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameActions } from '../../hooks/useGameActions';
import { useGameInitialization } from '../../hooks/game3d/useGameInitialization';
import { useGravityTimer } from '../../hooks/game3d/useGravityTimer';
import { useBlockSpawning } from '../../hooks/blockMovement/useBlockSpawning';

interface GameInitializerProps {
  children: React.ReactNode;
}

const GameInitializer: React.FC<GameInitializerProps> = ({ children }) => {
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
    initializeGrid,
    getColorIndex,
    GRID_SIZE,
    INITIAL_POSITION,
    MAX_LEVEL,
    VERTICAL_STACK_LIMIT
  } = useGameState();

  const { isValidPosition, moveBlock, rotateBlock, dropBlock } = useBlockMovement(
    grid, currentBlock, position, setPosition, gamePaused, gameOver, controlsEnabled
  );

  const { clearCompleteLayers, checkIfStackedBlocks, checkVerticalStackLimit } = useGridOperations(
    grid, 
    setGrid, 
    setScore,
    setLinesCleared,
    level, 
    GRID_SIZE, 
    VERTICAL_STACK_LIMIT
  );

  // Block spawning logic
  const { initializeBlocks } = useBlockSpawning({
    getRandomBlockPattern: () => null, // Not used, we're using the hook from useGameInitialization
    setCurrentBlock,
    setNextBlock,
    setPosition,
    INITIAL_POSITION,
    isValidPosition
  });

  // Game initialization
  const { initializeGame } = useGameInitialization({
    initializeGrid,
    setGrid,
    setCurrentBlock,
    setNextBlock,
    setPosition,
    setGameOver,
    setGamePaused,
    setScore,
    setLinesCleared,
    setControlsEnabled,
    INITIAL_POSITION
  });

  const resetPosition = () => {
    console.log("🔄 Resetting block position to initial:", INITIAL_POSITION);
    setPosition({...INITIAL_POSITION});
  };

  // Create gameActionProps object
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
    getRandomBlockPattern: () => null, // Not used directly
    getColorIndex,
    INITIAL_POSITION,
    MAX_LEVEL,
    gamePaused,
    gameOver,
    resetPosition,
    initializeGrid
  };

  const { resetGame, handleTimeUp, toggleGamePause, startGame } = useGameActions(gameActionProps);

  useKeyboardControls({
    moveBlock,
    rotateBlock,
    dropBlock,
    controlsEnabled,
    gamePaused,
    setCurrentBlock,
    currentBlock
  });
  
  // Manage gravity timer
  useGravityTimer({
    grid,
    currentBlock,
    gamePaused,
    gameOver,
    controlsEnabled,
    timerActive,
    level,
    moveBlock,
    dropBlock,
    gravityTimerRef,
    getDropSpeed,
    setControlsEnabled
  });

  // Update timeLimit based on level
  React.useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(180 - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level, setTimeLimit]);

  return <>{children}</>;
};

export default GameInitializer;
