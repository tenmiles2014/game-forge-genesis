import React, { useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameActions } from '../../hooks/useGameActions';
import { getRandomBlockPattern } from '../BlockPatterns';
import { toast } from "@/components/ui/use-toast";

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

  const resetPosition = () => {
    console.log("🔄 Resetting block position to initial:", INITIAL_POSITION);
    setPosition({...INITIAL_POSITION});
  };

  const { resetGame, handleTimeUp, toggleGamePause, startGame } = useGameActions({
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
    console.log("🚀 Game initializing...");
    
    const newGrid = initializeGrid();
    console.log("📊 Grid initialized:", newGrid.length);
    
    setGrid(newGrid);
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    
    console.log("✅ Game initialization complete");
    
    toast({
      title: "Game Ready",
      description: "Press Start to begin playing!",
    });
  }, []);
  
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

    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    if (!grid || grid.length === 0) {
      console.log("Grid not initialized yet, delaying gravity timer setup");
      return;
    }

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
  }, [gamePaused, gameOver, level, position, moveBlock, getDropSpeed, gravityTimerRef, controlsEnabled, setControlsEnabled, dropBlock, timerActive, grid]);

  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(180 - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level, setTimeLimit]);

  return <>{children}</>;
};

export default GameInitializer;
