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
const ROW_CLEAR_DELAY = 600; // Reduced delay for quicker feedback
const HIGHLIGHT_DELAY = 400; // Time to show highlighted rows

const Game: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<GridCellState[][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_BLOCK_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [isClearing, setIsClearing] = useState(false); 
  const [rowsBeingCleared, setRowsBeingCleared] = useState<number[]>([]);
  const [pendingClearedGrid, setPendingClearedGrid] = useState<GridCellState[][] | null>(null);
  const [scoredPoints, setScoredPoints] = useState(0);
  
  // Refs to manage animation timing
  const animationStageRef = useRef<'idle' | 'highlighting' | 'clearing'>('idle');
  
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
    setRowsBeingCleared([]);
    setPendingClearedGrid(null);
    setScoredPoints(0);
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

  // Manage animation states with useEffect
  useEffect(() => {
    // Skip if not in highlighting stage or no rows are marked for clearing
    if (!isClearing || rowsBeingCleared.length === 0 || animationStageRef.current !== 'highlighting') {
      return;
    }

    // After highlighting time, apply clearing
    const highlightTimer = setTimeout(() => {
      if (pendingClearedGrid) {
        animationStageRef.current = 'clearing';
        setGrid(pendingClearedGrid);
        
        // Show toast for points
        if (scoredPoints > 0) {
          toast({
            title: `${rowsBeingCleared.length} rows cleared!`,
            description: `+${scoredPoints} points`,
          });
        }
        
        // After clearing animation, proceed to next block
        const clearingTimer = setTimeout(() => {
          animationStageRef.current = 'idle';
          setIsClearing(false);
          setRowsBeingCleared([]);
          
          // Set the next block
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
        }, ROW_CLEAR_DELAY - HIGHLIGHT_DELAY);
        
        return () => clearTimeout(clearingTimer);
      }
    }, HIGHLIGHT_DELAY);
    
    return () => clearTimeout(highlightTimer);
  }, [isClearing, rowsBeingCleared, pendingClearedGrid, scoredPoints]);

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
    
    // Always update the grid with the placed block first
    setGrid(newGrid);
    
    // Find which rows need to be cleared
    const { rowsToClear, updatedGrid } = findRowsToClear(newGrid);
    
    // If rows were cleared, start the animation sequence
    if (rowsToClear.length > 0) {
      // Calculate score first
      const rowsCleared = rowsToClear.length;
      const pointsScored = rowsCleared * rowsCleared * 100;
      
      // Update score immediately
      setScore(prevScore => prevScore + pointsScored);
      setScoredPoints(pointsScored);
      
      // Highlight the rows to be cleared
      setIsClearing(true);
      setRowsBeingCleared(rowsToClear);
      animationStageRef.current = 'highlighting';
      
      // Store the cleared grid for later application
      setPendingClearedGrid(updatedGrid);
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

  // Find rows to clear and return both the row indices and the updated grid
  const findRowsToClear = (grid: GridCellState[][]) => {
    const rowsToClear: number[] = [];
    
    // Check each row
    for (let r = 0; r < GRID_ROWS; r++) {
      if (grid[r].every(cell => cell.filled)) {
        rowsToClear.push(r);
      }
    }
    
    // Make a copy of the grid to update
    const updatedGrid = [...grid.map(row => [...row])];
    
    // Remove the rows and add new ones at the top
    rowsToClear.sort((a, b) => b - a);
    for (const rowIndex of rowsToClear) {
      updatedGrid.splice(rowIndex, 1);
      const newRow = Array(GRID_COLS).fill({ filled: false, color: '' });
      updatedGrid.unshift(newRow);
    }
    
    return { rowsToClear, updatedGrid };
  };

  // Game controls
  const moveBlock = (direction: 'left' | 'right' | 'down') => {
    if (gameOver || gamePaused || isClearing) return;
    
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
    if (gameOver || gamePaused || isClearing) return;
    
    const rotatedShape = rotateBlockPattern(currentBlock.shape);
    
    if (isValidPosition(rotatedShape, position.row, position.col)) {
      setCurrentBlock({
        ...currentBlock,
        shape: rotatedShape
      });
    }
  };
  
  const dropBlock = () => {
    if (gameOver || gamePaused || isClearing) return;
    
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
      if (gameOver || gamePaused || isClearing) return;
      
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
  }, [position, currentBlock, grid, gameOver, gamePaused, isClearing]);

  // Render the current block on top of the grid
  const renderGridWithCurrentBlock = () => {
    // Make sure grid is initialized
    if (!grid || grid.length === 0) {
      return initializeGrid();
    }
    
    // Create a deep copy of the grid
    const displayGrid = grid.map((row, rowIndex) => {
      // If this row is being cleared, highlight it
      if (rowsBeingCleared.includes(rowIndex)) {
        return row.map(cell => ({
          ...cell,
          color: cell.filled ? 'highlight' : '' // Special color for highlighted rows
        }));
      }
      return [...row];
    });
    
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
