
import { useEffect } from 'react';
import { useGameBoard } from './game/useGameBoard';
import { useBlockState } from './game/useBlockState';
import { useGameStatus } from './game/useGameStatus';
import { useBlockOperations } from './game/useBlockOperations';
import { useBlockPlacement } from './game/useBlockPlacement';
import { useGameDisplay } from './game/useGameDisplay';
import { useGameActions } from './game/useGameActions';

/**
 * Main game logic hook that combines all game functionality
 */
export const useGameLogic = () => {
  // Get game board state
  const { grid, setGrid, initializeGrid } = useGameBoard();
  
  // Get block state
  const { 
    currentBlock, setCurrentBlock, 
    nextBlock, setNextBlock, 
    position, setPosition, 
    resetBlockPosition 
  } = useBlockState();
  
  // Get game status
  const { 
    score, setScore, 
    gameOver, setGameOver, 
    gamePaused, setGamePaused, 
    linesCleared, setLinesCleared 
  } = useGameStatus();
  
  // Get block placement functionality
  const { placeBlock } = useBlockPlacement({
    grid,
    setGrid,
    setScore,
    setLinesCleared,
    currentBlock,
    setCurrentBlock,
    nextBlock,
    setNextBlock,
    position,
    resetBlockPosition,
    setGameOver
  });
  
  // Get block operations
  const { moveBlock, rotateBlock, dropBlock } = useBlockOperations(
    grid, 
    currentBlock, 
    position, 
    setPosition, 
    placeBlock,
    gameOver,
    gamePaused
  );
  
  // Get game actions
  const { resetGame, togglePause } = useGameActions({
    setGrid,
    setScore,
    setCurrentBlock,
    setNextBlock,
    resetBlockPosition,
    setGameOver,
    setGamePaused,
    setLinesCleared,
    initializeGrid,
    score
  });
  
  // Get game display utilities
  const { renderGridWithCurrentBlock } = useGameDisplay(
    grid, 
    currentBlock, 
    position, 
    initializeGrid
  );
  
  // Initialize game on first render
  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  // Handle block rotation with state update
  const handleRotateBlock = () => {
    const rotated = rotateBlock();
    if (rotated) {
      setCurrentBlock(rotated);
    }
  };
  
  return {
    grid,
    score,
    currentBlock,
    nextBlock,
    position,
    gameOver,
    gamePaused,
    linesCleared,
    moveBlock,
    rotateBlock: handleRotateBlock,
    dropBlock,
    togglePause,
    resetGame,
    renderGridWithCurrentBlock,
  };
};
