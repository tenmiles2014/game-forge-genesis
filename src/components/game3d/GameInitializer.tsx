
import React, { useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameActions } from '../../hooks/useGameActions';
import { getRandomBlockPattern } from '../BlockPatterns';
import { useGameInitialization } from '../../hooks/useGameInitialization';
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
    getRandomBlockPattern,
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
    setGameOver,
    setGamePaused,
    setScore,
    setLinesCleared,
    setControlsEnabled,
    initializeBlocks
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
    getRandomBlockPattern,
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
  
  useEffect(() => {
    console.log(`Game state changed - gamePaused: ${gamePaused}, gameOver: ${gameOver}, controlsEnabled: ${controlsEnabled}, timerActive: ${timerActive}`);
    
    if (gamePaused || gameOver) {
      console.log("Game paused or over - clearing gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    if (!controlsEnabled && !gamePaused && !gameOver) {
      console.log("Game active but controls disabled - enabling controls");
      setControlsEnabled(true);
    }

    // Always clear the existing timer before setting a new one
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Don't set up the timer if the grid isn't initialized
    if (!grid || grid.length === 0) {
      console.log("Grid not initialized yet, delaying gravity timer setup");
      return;
    }

    // Setup the gravity timer to automatically move blocks down
    const dropSpeed = getDropSpeed();
    console.log(`Setting up gravity timer with dropSpeed: ${dropSpeed}ms, controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
    
    gravityTimerRef.current = window.setInterval(() => {
      console.log("Gravity timer triggered - moving block down");
      if (!gamePaused && !gameOver) {
        const moved = moveBlock('down');
        if (!moved) {
          console.log("Block can't move down further, dropping it");
          dropBlock();
        }
      }
    }, dropSpeed);

    return () => {
      console.log("Cleaning up gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [gamePaused, gameOver, level, moveBlock, dropBlock, getDropSpeed, controlsEnabled, setControlsEnabled, timerActive, grid]);

  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(180 - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level, setTimeLimit]);

  return <>{children}</>;
};

export default GameInitializer;
