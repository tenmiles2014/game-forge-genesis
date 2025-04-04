
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
const HIGHLIGHT_DURATION = 500; // ms to show highlights
const CLEAR_DURATION = 300; // ms to clear rows after highlighting

// Game states enum
enum GameState {
  PLAYING,      // Normal gameplay
  HIGHLIGHTING, // Showing highlighted rows
  CLEARING,     // Removing rows
  GAME_OVER,    // Game ended
  PAUSED        // Game paused
}

const Game: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<GridCellState[][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_BLOCK_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [gameState, setGameState] = useState<GameState>(GameState.PAUSED);
  const [rowsToHighlight, setRowsToHighlight] = useState<number[]>([]);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  
  // Animation timers
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
    // Clear any existing timers
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    
    setGrid(initializeGrid());
    setScore(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_BLOCK_POSITION);
    setGameOver(false);
    setGamePaused(true);
    setGameState(GameState.PAUSED);
    setRowsToHighlight([]);
    setPointsToAdd(0);
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

  // Place the current block on the grid and start the animation sequence
  const placeBlock = () => {
    // Make a deep copy of the grid
    const newGrid: GridCellState[][] = grid.map(row => [...row]);
    
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
    
    // Update the grid first
    setGrid(newGrid);
    
    // Find rows to clear
    const rowsToCheck: number[] = [];
    
    // Collect rows affected by the current block
    for (let r = 0; r < currentBlock.shape.length; r++) {
      const gridRow = position.row + r;
      if (gridRow >= 0 && gridRow < GRID_ROWS) {
        rowsToCheck.push(gridRow);
      }
    }
    
    // Check if any complete rows
    const completedRows = rowsToCheck.filter(rowIndex => 
      newGrid[rowIndex].every(cell => cell.filled)
    );
    
    if (completedRows.length > 0) {
      // Start animation sequence
      setGameState(GameState.HIGHLIGHTING);
      setRowsToHighlight(completedRows);
      
      // Calculate score
      const points = completedRows.length * completedRows.length * 100;
      setPointsToAdd(points);
      
      // Step 1: Highlight rows
      highlightRows(newGrid, completedRows);
    } else {
      // No rows to clear, proceed to next block
      moveToNextBlock();
    }
  };

  // Set rows to highlight state
  const highlightRows = (currentGrid: GridCellState[][], rowIndices: number[]) => {
    const highlightedGrid = currentGrid.map((row, rowIndex) => {
      if (rowIndices.includes(rowIndex)) {
        return row.map(cell => ({
          ...cell,
          color: cell.filled ? 'highlight' : '',
          isClearing: true
        }));
      }
      return [...row];
    });
    
    setGrid(highlightedGrid);
    
    // Schedule clearing after highlight duration
    highlightTimerRef.current = setTimeout(() => {
      setGameState(GameState.CLEARING);
      clearRows(highlightedGrid, rowIndices);
    }, HIGHLIGHT_DURATION);
  };
  
  // Clear highlighted rows and shift down
  const clearRows = (currentGrid: GridCellState[][], rowIndices: number[]) => {
    // Sort row indices in descending order to remove from bottom to top
    const sortedIndices = [...rowIndices].sort((a, b) => b - a);
    
    // Create new grid with rows removed
    const clearedGrid = [...currentGrid];
    
    // Remove completed rows
    for (const rowIndex of sortedIndices) {
      clearedGrid.splice(rowIndex, 1);
      // Add new empty row at top
      const newRow: GridCellState[] = Array(GRID_COLS).fill({ filled: false, color: '' });
      clearedGrid.unshift(newRow);
    }
    
    // Update grid
    setGrid(clearedGrid);
    
    // Update score
    setScore(prevScore => prevScore + pointsToAdd);
    
    // Display toast for points
    toast({
      title: `${rowIndices.length} rows cleared!`,
      description: `+${pointsToAdd} points`,
    });
    
    // Schedule next block after clear animation
    clearTimerRef.current = setTimeout(() => {
      setGameState(GameState.PLAYING);
      moveToNextBlock();
    }, CLEAR_DURATION);
  };
  
  // Move to the next block
  const moveToNextBlock = () => {
    // Reset rows being cleared
    setRowsToHighlight([]);
    
    // Set next block
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_BLOCK_POSITION);
    
    // Check if game is over
    if (!isValidPosition(nextBlock.shape, INITIAL_BLOCK_POSITION.row, INITIAL_BLOCK_POSITION.col)) {
      setGameOver(true);
      setGamePaused(true);
      setGameState(GameState.GAME_OVER);
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
      });
    }
  };

  // Game controls
  const moveBlock = (direction: 'left' | 'right' | 'down') => {
    // Prevent movement during animations or game pause
    if (gameState !== GameState.PLAYING || gamePaused) return;
    
    let newRow = position.row;
    let newCol = position.col;
    
    if (direction === 'left') newCol -= 1;
    if (direction === 'right') newCol += 1;
    if (direction === 'down') newRow += 1;
    
    if (isValidPosition(currentBlock.shape, newRow, newCol)) {
      setPosition({ row: newRow, col: newCol });
    } else if (direction === 'down') {
      placeBlock();
    }
  };
  
  const rotateBlock = () => {
    // Prevent rotation during animations or game pause
    if (gameState !== GameState.PLAYING || gamePaused) return;
    
    const rotatedShape = rotateBlockPattern(currentBlock.shape);
    
    if (isValidPosition(rotatedShape, position.row, position.col)) {
      setCurrentBlock({
        ...currentBlock,
        shape: rotatedShape
      });
    }
  };
  
  const dropBlock = () => {
    // Prevent dropping during animations or game pause
    if (gameState !== GameState.PLAYING || gamePaused) return;
    
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
    
    if (gamePaused) {
      setGamePaused(false);
      setGameState(GameState.PLAYING);
    } else {
      setGamePaused(true);
      setGameState(GameState.PAUSED);
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only allow controls during active gameplay
      if (gameState !== GameState.PLAYING || gamePaused) return;
      
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
  }, [position, currentBlock, grid, gameState, gamePaused]);

  // Ensure timers are cleaned up on unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  // Render the current block on top of the grid
  const renderGridWithCurrentBlock = () => {
    // Make sure grid is initialized
    if (!grid || grid.length === 0) {
      return initializeGrid();
    }
    
    // Create a deep copy of the grid
    const displayGrid = grid.map(row => [...row]);
    
    // Only add current block to display grid if not in clearing animation
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
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
