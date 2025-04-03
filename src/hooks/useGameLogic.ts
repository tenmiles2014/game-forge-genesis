
import { useState, useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern, getRandomBlockPattern, rotateBlockPattern } from '../components/BlockPatterns';
import { GridCellState } from '../components/GameGrid';

// Constants
const GRID_ROWS = 10;
const GRID_COLS = 10;
const INITIAL_BLOCK_POSITION = { row: 0, col: Math.floor(GRID_COLS / 2) - 1 };

export const useGameLogic = () => {
  // Game state
  const [grid, setGrid] = useState<GridCellState[][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_BLOCK_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [linesCleared, setLinesCleared] = useState(0);

  // Initialize game grid
  const initializeGrid = useCallback(() => {
    const newGrid: GridCellState[][] = [];
    for (let i = 0; i < GRID_ROWS; i++) {
      const row: GridCellState[] = [];
      for (let j = 0; j < GRID_COLS; j++) {
        row.push({ filled: false, color: '' });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGrid(initializeGrid());
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_BLOCK_POSITION);
    setGameOver(false);
    setGamePaused(true);
  }, [initializeGrid]);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Check if the position is valid
  const isValidPosition = useCallback((pattern: number[][], newRow: number, newCol: number) => {
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        if (pattern[r][c]) {
          const gridRow = newRow + r;
          const gridCol = newCol + c;
          
          // Check boundaries
          if (
            gridRow < 0 || 
            gridRow >= GRID_ROWS || 
            gridCol < 0 || 
            gridCol >= GRID_COLS
          ) {
            return false;
          }
          
          // Check collision with placed blocks
          if (gridRow >= 0 && gridRow < grid.length && 
              gridCol >= 0 && gridCol < grid[0].length && 
              grid[gridRow][gridCol].filled) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid]);

  // Place the current block on the grid
  const placeBlock = useCallback(() => {
    const newGrid = [...grid.map(row => [...row])];
    
    // Add the block to the grid
    for (let r = 0; r < currentBlock.shape.length; r++) {
      for (let c = 0; c < currentBlock.shape[r].length; c++) {
        if (currentBlock.shape[r][c]) {
          const gridRow = position.row + r;
          const gridCol = position.col + c;
          
          if (gridRow >= 0 && gridRow < GRID_ROWS && gridCol >= 0 && gridCol < GRID_COLS) {
            newGrid[gridRow][gridCol] = {
              filled: true,
              color: currentBlock.color
            };
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    // Check for completed rows
    clearRows(newGrid);
    
    // Get next block
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_BLOCK_POSITION);
    
    // Check if game is over
    if (!isValidPosition(nextBlock.shape, INITIAL_BLOCK_POSITION.row, INITIAL_BLOCK_POSITION.col)) {
      setGameOver(true);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
      });
    }
  }, [grid, currentBlock, position, nextBlock, score, isValidPosition]);

  // Clear completed rows
  const clearRows = useCallback((newGrid: GridCellState[][]) => {
    let rowsCleared = 0;
    
    // Check each row
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every(cell => cell.filled)) {
        // Remove the row
        newGrid.splice(r, 1);
        // Add a new empty row at the top
        const newRow = Array(GRID_COLS).fill(0).map(() => ({ filled: false, color: '' }));
        newGrid.unshift(newRow);
        rowsCleared++;
      }
    }
    
    // Update score
    if (rowsCleared > 0) {
      const pointsScored = rowsCleared * rowsCleared * 100;
      setScore(prevScore => prevScore + pointsScored);
      setLinesCleared(prev => prev + rowsCleared);
      toast({
        title: `${rowsCleared} rows cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid(newGrid);
  }, []);

  // Game controls
  const moveBlock = useCallback((direction: 'left' | 'right' | 'down') => {
    if (gameOver || gamePaused) return;
    
    let newRow = position.row;
    let newCol = position.col;
    
    if (direction === 'left') newCol -= 1;
    if (direction === 'right') newCol += 1;
    if (direction === 'down') newRow += 1;
    
    if (isValidPosition(currentBlock.shape, newRow, newCol)) {
      setPosition({ row: newRow, col: newCol });
      return true;
    } else if (direction === 'down') {
      // If we can't move down, place the block
      placeBlock();
    }
    return false;
  }, [gameOver, gamePaused, position, currentBlock.shape, isValidPosition, placeBlock]);
  
  const rotateBlock = useCallback(() => {
    if (gameOver || gamePaused) return;
    
    const rotatedShape = rotateBlockPattern(currentBlock.shape);
    
    if (isValidPosition(rotatedShape, position.row, position.col)) {
      setCurrentBlock({
        ...currentBlock,
        shape: rotatedShape
      });
    }
  }, [gameOver, gamePaused, currentBlock, position, isValidPosition]);
  
  const dropBlock = useCallback(() => {
    if (gameOver || gamePaused) return;
    
    let newRow = position.row;
    
    // Find the lowest valid position
    while (isValidPosition(currentBlock.shape, newRow + 1, position.col)) {
      newRow++;
    }
    
    setPosition({ row: newRow, col: position.col });
    placeBlock();
  }, [gameOver, gamePaused, position, currentBlock.shape, isValidPosition, placeBlock]);
  
  // Toggle pause/resume game
  const togglePause = useCallback(() => {
    if (gameOver) return;
    setGamePaused(!gamePaused);
  }, [gameOver, gamePaused]);

  // Render the current block on top of the grid
  const renderGridWithCurrentBlock = useCallback(() => {
    // Make sure grid is initialized
    if (!grid || grid.length === 0) {
      return initializeGrid();
    }
    
    // Create a deep copy of the grid
    const displayGrid = grid.map(row => [...row]);
    
    // Add current block to the display grid at its current position
    for (let r = 0; r < currentBlock.shape.length; r++) {
      for (let c = 0; c < currentBlock.shape[r].length; c++) {
        if (currentBlock.shape[r][c]) {
          const gridRow = position.row + r;
          const gridCol = position.col + c;
          
          // Check if the position is within grid bounds before setting
          if (
            gridRow >= 0 && 
            gridRow < GRID_ROWS && 
            gridCol >= 0 && 
            gridCol < GRID_COLS
          ) {
            displayGrid[gridRow][gridCol] = {
              filled: true,
              color: currentBlock.color
            };
          }
        }
      }
    }
    
    return displayGrid;
  }, [grid, currentBlock, position, initializeGrid]);

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
    rotateBlock,
    dropBlock,
    togglePause,
    resetGame,
    renderGridWithCurrentBlock,
  };
};
