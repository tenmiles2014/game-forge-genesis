
import React, { useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameActions } from '../../hooks/useGameActions';
import { getRandomBlockPattern } from '../BlockPatterns';

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

  const { isValidPosition, moveBlock, rotateBlock } = useBlockMovement(
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

  const { resetGame, handleTimeUp, toggleGamePause, startGame, dropBlock } = useGameActions({
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
    gamePaused
  });

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
    resetGame();
    // Log the initial state
    console.log("Game initialized - controlsEnabled:", controlsEnabled, "gamePaused:", gamePaused);
  }, [resetGame]);

  // This effect handles the gravity timer and updates the game state
  useEffect(() => {
    console.log(`Game state changed - gamePaused: ${gamePaused}, gameOver: ${gameOver}, controlsEnabled: ${controlsEnabled}, timerActive: ${timerActive}`);
    
    // Skip setup if game is paused or over
    if (gamePaused || gameOver) {
      console.log("Game paused or over - clearing gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    // Update controls state for active game
    if (!controlsEnabled && !gamePaused && !gameOver) {
      console.log("Game active but controls disabled - enabling controls");
      setControlsEnabled(true);
    }

    // Clear any existing gravity timer before setting a new one
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }

    // Calculate drop speed based on level and set up gravity timer
    const dropSpeed = getDropSpeed();
    console.log(`Setting up gravity timer with dropSpeed: ${dropSpeed}ms, controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
    
    gravityTimerRef.current = window.setInterval(() => {
      console.log("Gravity timer triggered - moving block down");
      const moved = moveBlock('down');
      if (!moved) {
        // If block can't move down further, drop it
        console.log("Block can't move down further, dropping it");
        dropBlock();
      }
    }, dropSpeed);

    return () => {
      console.log("Cleaning up gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [gamePaused, gameOver, level, position, moveBlock, getDropSpeed, gravityTimerRef, controlsEnabled, setControlsEnabled, dropBlock, timerActive]);

  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(180 - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level, setTimeLimit]);
  
  useEffect(() => {
    setGrid(initializeGrid());
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
  }, []);

  return <>{children}</>;
};

export default GameInitializer;
