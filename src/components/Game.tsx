import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import GameGrid, { GridCellState } from './GameGrid';
import { BlockPattern, getRandomBlockPattern, rotateBlockPattern } from './BlockPatterns';
import BlockPreview from './BlockPreview';
import ScoreDisplay from './ScoreDisplay';
import GameControls from './GameControls';

// Constants
const GRID_ROWS = 10;
const GRID_COLS = 10;
const INITIAL_BLOCK_POSITION = { row: 0, col: Math.floor(GRID_COLS / 2) - 1 };
const ROW_CLEAR_DELAY = 3000; // 3 seconds delay

const Game: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<GridCellState[][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_BLOCK_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [isClearing, setIsClearing] = useState(false); // New state to track clearing animation
  
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

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_BLOCK_POSITION);
    setGameOver(false);
    setGamePaused(true);
    setIsClearing(false);
  };

  // Check if the position is valid
  const isValidPosition = (pattern: number[][], newRow: number, newCol: number) => {
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
          if (grid[gridRow][gridCol].filled) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place the current block on the grid
  const placeBlock = () => {
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
    const rowsCleared = clearRows(newGrid);
    
    // If rows were cleared, add a delay before setting the next block
    if (rowsCleared > 0) {
      setIsClearing(true);
      
      setTimeout(() => {
        // After delay, set the next block
        setCurrentBlock(nextBlock);
        setNextBlock(getRandomBlockPattern());
        setPosition(INITIAL_BLOCK_POSITION);
        setIsClearing(false);
        
        // Check if game is over
        if (!isValidPosition(nextBlock.shape, INITIAL_BLOCK_POSITION.row, INITIAL_BLOCK_POSITION.col)) {
          setGameOver(true);
          setGamePaused(true);
          toast({
            title: "Game Over!",
            description: `Final score: ${score}`,
          });
        }
      }, ROW_CLEAR_DELAY);
    } else {
      // If no rows were cleared, set the next block immediately
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
    }
  };

  // Clear completed rows and return number of rows cleared
  const clearRows = (newGrid: GridCellState[][]) => {
    let rowsCleared = 0;
    
    // Check each row
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every(cell => cell.filled)) {
        // Remove the row
        newGrid.splice(r, 1);
        // Add a new empty row at the top
        const newRow = Array(GRID_COLS).fill({ filled: false, color: '' });
        newGrid.unshift(newRow);
        rowsCleared++;
      }
    }
    
    // Update score
    if (rowsCleared > 0) {
      const pointsScored = rowsCleared * rowsCleared * 100;
      setScore(prevScore => prevScore + pointsScored);
      toast({
        title: `${rowsCleared} rows cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid(newGrid);
    return rowsCleared;
  };

  // Game controls
  const moveBlock = (direction: 'left' | 'right' | 'down') => {
    if (gameOver || gamePaused) return;
    
    let newRow = position.row;
    let newCol = position.col;
    
    if (direction === 'left') newCol -= 1;
    if (direction === 'right') newCol += 1;
    if (direction === 'down') newRow += 1;
    
    if (isValidPosition(currentBlock.shape, newRow, newCol)) {
      setPosition({ row: newRow, col: newCol });
    } else if (direction === 'down') {
      // If we can't move down, place the block
      placeBlock();
    }
  };
  
  const rotateBlock = () => {
    if (gameOver || gamePaused) return;
    
    const rotatedShape = rotateBlockPattern(currentBlock.shape);
    
    if (isValidPosition(rotatedShape, position.row, position.col)) {
      setCurrentBlock({
        ...currentBlock,
        shape: rotatedShape
      });
    }
  };
  
  const dropBlock = () => {
    if (gameOver || gamePaused) return;
    
    let newRow = position.row;
    
    // Find the lowest valid position
    while (isValidPosition(currentBlock.shape, newRow + 1, position.col)) {
      newRow++;
    }
    
    setPosition({ row: newRow, col: position.col });
    placeBlock();
  };
  
  // Toggle pause/resume game
  const togglePause = () => {
    if (gameOver) return;
    setGamePaused(!gamePaused);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver || gamePaused) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          moveBlock('left');
          break;
        case 'ArrowRight':
          moveBlock('right');
          break;
        case 'ArrowDown':
          moveBlock('down');
          break;
        case 'ArrowUp':
          rotateBlock();
          break;
        case ' ':  // Space key
          dropBlock();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, currentBlock, grid, gameOver, gamePaused]);

  // Render the current block on top of the grid
  const renderGridWithCurrentBlock = () => {
    // Make sure grid is initialized
    if (!grid || grid.length === 0) {
      return initializeGrid();
    }
    
    // Create a deep copy of the grid
    const displayGrid = grid.map(row => [...row]);
    
    // Only add current block to display grid if not in clearing animation
    if (!isClearing) {
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
    }
    
    return displayGrid;
  };

  // Render game
  return (
    <div className="game-circle flex flex-col justify-center items-center min-h-screen p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row gap-6 p-6 bg-black bg-opacity-30">
        <div className="flex-1">
          <div className="game-board rounded-lg overflow-hidden aspect-square">
            <GameGrid 
              grid={renderGridWithCurrentBlock()} 
              className="h-full w-full p-1"
            />
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-4 w-full md:w-60">
          <div className="space-y-6">
            <ScoreDisplay score={score} />
            
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
              <div className="flex justify-center">
                <BlockPreview block={nextBlock} className="w-24 h-24" />
              </div>
            </div>
          </div>
          
          <GameControls 
            onReset={resetGame}
            onStartPause={togglePause}
            isPaused={gamePaused}
            gameOver={gameOver}
          />
        </div>
      </div>
      
      {gameOver && (
        <div className="mt-6 animate-scale-in">
          <p className="text-xl text-white mb-3">Game Over! Final score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default Game;
