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
  }, [resetGame]);

  useEffect(() => {
    if (gamePaused || gameOver) {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    const dropSpeed = getDropSpeed();
    
    gravityTimerRef.current = window.setInterval(() => {
      moveBlock('down');
    }, dropSpeed);

    return () => {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [gamePaused, gameOver, level, position, moveBlock, getDropSpeed, gravityTimerRef]);

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
