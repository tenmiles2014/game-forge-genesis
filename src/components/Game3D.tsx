import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from "@/components/ui/use-toast";
import GameControls3D from './GameControls3D';
import { BlockPattern, getRandomBlockPattern } from './BlockPatterns';
import ScoreDisplay from './ScoreDisplay';
import Grid3D from './Grid3D';
import BlockPreview from './BlockPreview';
import GameTimer from './GameTimer';
import LevelDisplay from './LevelDisplay';
import ViewControls, { ViewPoint } from './ViewControls';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

// Constants
const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 4, y: 0, z: 4 };
const MAX_LEVEL = 99;
const BASE_TIME_LIMIT = 180; // 3 minutes in seconds for level 1

// Predefined camera viewpoints
const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

const Game3D: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<number[][][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [level, setLevel] = useState(1);
  const [timeLimit, setTimeLimit] = useState(BASE_TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(true); // Game starts paused
  const orbitControlsRef = useRef(null);
  const [currentView, setCurrentView] = useState<ViewPoint>(VIEW_POINTS[0]);

  // Calculate time limit based on level
  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(BASE_TIME_LIMIT - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level]);

  // Initialize game grid
  const initializeGrid = () => {
    const newGrid: number[][][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const layer: number[][] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const row: number[] = [];
        for (let z = 0; z < GRID_SIZE; z++) {
          row.push(0); // 0 means empty
        }
        layer.push(row);
      }
      newGrid.push(layer);
    }
    return newGrid;
  };

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION, y: 0}); // Ensure starting at y=0
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setTimerActive(false);
    setGamePaused(true);
  };

  // Convert 2D pattern to 3D (place in xz plane)
  const get3DPattern = (pattern: number[][]) => {
    const pattern3D: number[][][] = [];
    const height = pattern.length;
    const width = pattern[0].length;
    
    for (let y = 0; y < 1; y++) {
      const layer: number[][] = [];
      for (let x = 0; x < height; x++) {
        const row: number[] = [];
        for (let z = 0; z < width; z++) {
          row.push(pattern[x][z]);
        }
        layer.push(row);
      }
      pattern3D.push(layer);
    }
    
    return pattern3D;
  };

  // Check if the block would exceed boundaries
  const wouldExceedBoundary = (pattern: number[][], newX: number, newY: number, newZ: number) => {
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          const gridX = newX + x;
          const gridY = newY;
          const gridZ = newZ + y;
          
          if (
            gridX < 0 || gridX >= GRID_SIZE ||
            gridY < 0 || gridY >= GRID_SIZE ||
            gridZ < 0 || gridZ >= GRID_SIZE
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check if the position is valid
  const isValidPosition = (pattern: number[][], newX: number, newY: number, newZ: number) => {
    // First check boundaries
    if (wouldExceedBoundary(pattern, newX, newY, newZ)) {
      return false;
    }
    
    // Ensure y is never negative
    if (newY < 0) {
      return false;
    }
    
    const pattern3D = get3DPattern(pattern);
    
    for (let y = 0; y < pattern3D.length; y++) {
      for (let x = 0; x < pattern3D[y].length; x++) {
        for (let z = 0; z < pattern3D[y][x].length; z++) {
          if (pattern3D[y][x][z]) {
            const gridX = newX + x;
            const gridY = newY + y;
            const gridZ = newZ + z;
            
            // Check collision
            if (grid[gridY] && grid[gridY][gridX] && grid[gridY][gridX][gridZ] !== 0) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  // Place the current block on the grid
  const placeBlock = () => {
    const newGrid = JSON.parse(JSON.stringify(grid)); // Deep copy
    const pattern3D = get3DPattern(currentBlock.shape);
    
    // Add the block to the grid
    for (let y = 0; y < pattern3D.length; y++) {
      for (let x = 0; x < pattern3D[y].length; x++) {
        for (let z = 0; z < pattern3D[y][x].length; z++) {
          if (pattern3D[y][x][z]) {
            const gridX = position.x + x;
            const gridY = position.y + y;
            const gridZ = position.z + z;
            
            if (
              gridX >= 0 && gridX < GRID_SIZE &&
              gridY >= 0 && gridY < GRID_SIZE &&
              gridZ >= 0 && gridZ < GRID_SIZE
            ) {
              // Store color information in the grid (as an integer representing the color index)
              newGrid[gridY][gridX][gridZ] = getColorIndex(currentBlock.color);
            }
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    // Check for completed layers
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Get next block
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    
    // Reset position to the top of the grid, not below it
    setPosition({...INITIAL_POSITION, y: 0});
    
    // Check if game is over
    if (!isValidPosition(nextBlock.shape, INITIAL_POSITION.x, 0, INITIAL_POSITION.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      toast({
        title: "Game Over!",
        description: `Final score: ${score} | Level: ${level}`,
      });
    }
    
    // Check for level up
    if (layersCleared > 0 && level < MAX_LEVEL) {
      const layerThreshold = Math.ceil(level / 5) + 1; // More layers needed for level up as you progress
      if (layersCleared >= layerThreshold) {
        const newLevel = Math.min(MAX_LEVEL, level + 1);
        setLevel(newLevel);
        toast({
          title: `Level Up!`,
          description: `You are now on level ${newLevel}`,
        });
      }
    }
  };

  // Map color names to integer indices
  const getColorIndex = (color: string): number => {
    const colorMap: Record<string, number> = {
      'blue': 1,
      'red': 2,
      'green': 3,
      'purple': 4,
      'yellow': 5
    };
    return colorMap[color] || 0;
  };

  // Clear completed layers
  const clearCompleteLayers = (grid: number[][][]) => {
    let layersCleared = 0;
    
    // Check each Y layer
    for (let y = GRID_SIZE - 1; y >= 0; y--) {
      let layerFull = true;
      
      // Check if the layer is full
      for (let x = 0; x < GRID_SIZE && layerFull; x++) {
        for (let z = 0; z < GRID_SIZE && layerFull; z++) {
          if (grid[y][x][z] === 0) {
            layerFull = false;
          }
        }
      }
      
      if (layerFull) {
        // Remove the layer by shifting down all layers above it
        for (let moveY = y; moveY > 0; moveY--) {
          grid[moveY] = JSON.parse(JSON.stringify(grid[moveY - 1]));
        }
        
        // Create an empty layer at the top
        grid[0] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
        
        layersCleared++;
        y++; // Check this level again
      }
    }
    
    // Calculate bonus points based on level
    if (layersCleared > 0) {
      const levelMultiplier = 1 + (level * 0.1); // Higher levels give more points
      const pointsScored = Math.floor(layersCleared * layersCleared * 100 * levelMultiplier);
      setScore(prevScore => prevScore + pointsScored);
      toast({
        title: `${layersCleared} layers cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid([...grid]);
    return layersCleared;
  };

  // Handle time up
  const handleTimeUp = () => {
    if (!gameOver) {
      setGameOver(true);
      setControlsEnabled(false);
      setGamePaused(true);
      toast({
        title: "Time's Up!",
        description: `Final score: ${score} | Level: ${level}`,
      });
    }
  };

  // Game controls
  const moveBlock = (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    let newX = position.x;
    let newY = position.y;
    let newZ = position.z;
    
    if (direction === 'left') newX -= 1;
    if (direction === 'right') newX += 1;
    if (direction === 'forward') newZ -= 1;
    if (direction === 'backward') newZ += 1;
    if (direction === 'down') newY += 1;
    
    // Ensure y is never negative
    newY = Math.max(0, newY);
    
    // Ensure new position is within bounds
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
    } else if (direction === 'down') {
      // If we can't move down, place the block
      placeBlock();
    }
  };
  
  const rotateBlock = (axis: 'x' | 'y' | 'z') => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    const rotatedPattern = [...currentBlock.shape];
    
    // Rotate the 2D pattern
    if (axis === 'x' || axis === 'z') {
      const numRows = rotatedPattern.length;
      const numCols = rotatedPattern[0].length;
      
      // Create a new 2D array with swapped dimensions
      const newPattern: number[][] = Array(numCols).fill(0).map(() => Array(numRows).fill(0));
      
      // Perform rotation
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (axis === 'z') {
            newPattern[c][numRows - 1 - r] = rotatedPattern[r][c];
          } else {
            newPattern[numCols - 1 - c][r] = rotatedPattern[r][c];
          }
        }
      }
      
      // Check if the rotated position is valid
      if (isValidPosition(newPattern, position.x, position.y, position.z)) {
        setCurrentBlock({
          ...currentBlock,
          shape: newPattern
        });
      } else {
        // Try adjusting position to make rotation valid (wall kick)
        // Try shifting left/right/forward/backward and up to ensure piece is inside grid
        const offsets = [
          { x: -1, y: 0, z: 0 },  // left
          { x: 1, y: 0, z: 0 },   // right
          { x: 0, y: 0, z: -1 },  // forward
          { x: 0, y: 0, z: 1 },   // backward
          { x: -1, y: 0, z: -1 }, // left-forward
          { x: 1, y: 0, z: -1 },  // right-forward
          { x: -1, y: 0, z: 1 },  // left-backward
          { x: 1, y: 0, z: 1 },   // right-backward
        ];
        
        let validPositionFound = false;
        
        for (const offset of offsets) {
          const newX = position.x + offset.x;
          const newY = Math.max(0, position.y + offset.y); // Ensure y is never negative
          const newZ = position.z + offset.z;
          
          if (isValidPosition(newPattern, newX, newY, newZ)) {
            setCurrentBlock({
              ...currentBlock,
              shape: newPattern
            });
            setPosition({ x: newX, y: newY, z: newZ });
            validPositionFound = true;
            break;
          }
        }
        
        // If no valid position found, don't rotate
        if (!validPositionFound) {
          // Toast to indicate rotation not possible
          toast({
            title: "Can't rotate",
            description: "Not enough space to rotate block",
          });
        }
      }
    }
  };
  
  // Fix the dropBlock function to ensure it doesn't rotate blocks
  const dropBlock = () => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    let newY = position.y;
    
    // Find the lowest valid position while maintaining the current block shape
    while (isValidPosition(currentBlock.shape, position.x, newY + 1, position.z)) {
      newY++;
    }
    
    // Update position without changing the block orientation
    setPosition({ ...position, y: newY });
    
    // Place the block without any rotation
    setTimeout(() => {
      placeBlock();
    }, 0);
  };

  // Toggle game pause state
  const toggleGamePause = () => {
    if (gameOver) return;
    
    const newPausedState = !gamePaused;
    setGamePaused(newPausedState);
    setTimerActive(!newPausedState);
    setControlsEnabled(!newPausedState);
    
    if (newPausedState) {
      toast({
        title: "Game Paused",
        description: "Take a breather!",
      });
    } else {
      toast({
        title: "Game Resumed",
        description: "Let's go!",
      });
    }
  };

  // Start the game
  const startGame = () => {
    if (!gamePaused) return; // Already running
    
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
    
    toast({
      title: "Game Started",
      description: "Good luck!",
    });
  };

  // Fix for blocks appearing under the grid surface
  useEffect(() => {
    // Ensure blocks never start below the grid surface
    if (position.y < 0) {
      setPosition({ ...position, y: 0 });
    }
  }, [position]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!controlsEnabled || gamePaused) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          moveBlock('left');
          break;
        case 'ArrowRight':
          moveBlock('right');
          break;
        case 'ArrowUp':
          moveBlock('forward');
          break;
        case 'ArrowDown':
          moveBlock('backward');
          break;
        case ' ':  // Space key - only drop, don't rotate
          dropBlock();
          break;
        case 'z':  // Rotate around z-axis
          rotateBlock('z');
          break;
        case 'x':  // Rotate around x-axis
          rotateBlock('x');
          break;
        case 's':  // Move down
          moveBlock('down');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, currentBlock, grid, gameOver, controlsEnabled, gamePaused]);

  // Handle view change
  const handleViewChange = (viewPoint: ViewPoint) => {
    setCurrentView(viewPoint);
    
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current as any;
      
      // Reset camera position
      if (controls.object) {
        controls.object.position.set(...viewPoint.position);
        
        // Set target if provided, otherwise use default center
        if (viewPoint.target) {
          controls.target.set(...viewPoint.target);
        } else {
          controls.target.set(4.5, 4.5, 4.5);  // Center of the grid
        }
        
        controls.update();
      }
    }
    
    toast({
      title: `View Changed`,
      description: `Now viewing from ${viewPoint.name}`,
    });
  };

  // Render game
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        3D Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden max-w-5xl w-full flex flex-col md:flex-row gap-6 p-6 bg-black bg-opacity-30">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <ViewControls 
              viewPoints={VIEW_POINTS} 
              onSelectView={handleViewChange}
            />
          </div>
          
          <div className="game-board rounded-lg overflow-hidden h-[500px]">
            <Canvas camera={{ position: currentView.position, fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Grid3D 
                grid={grid} 
                currentBlock={currentBlock} 
                position={position}
              />
              <OrbitControls 
                ref={orbitControlsRef} 
                enabled={controlsEnabled}
                minDistance={10}
                maxDistance={30}
                target={currentView.target || [4.5, 4.5, 4.5]}
              />
            </Canvas>
          </div>
          
          {/* Start/Stop Button */}
          <div className="flex justify-center mt-4">
            <Button 
              onClick={toggleGamePause} 
              variant="outline" 
              size="lg"
              className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 w-32"
              disabled={gameOver}
            >
              {gamePaused ? (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-4 w-full md:w-60">
          <div className="space-y-4">
            <ScoreDisplay score={score} />
            
            <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
            
            <GameTimer 
              isActive={timerActive} 
              onTimeUp={handleTimeUp} 
              timeLimit={timeLimit} 
            />
            
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
              <div className="flex justify-center">
                <BlockPreview block={nextBlock} className="w-24 h-24" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Controls</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Arrow Keys: Move X/Z</p>
                <p>S: Move Down</p>
                <p>Z/X: Rotate</p>
                <p>Space: Drop</p>
              </div>
            </div>
          </div>
          
          <GameControls3D 
            onRotate={rotateBlock}
            onMove={moveBlock}
            onDrop={dropBlock}
            onReset={resetGame}
          />
        </div>
      </div>
      
      {gameOver && (
        <div className="mt-6 animate-scale-in">
          <p className="text-xl text-white mb-3">Game Over! Final Score: {score} | Level: {level}</p>
        </div>
      )}
    </div>
  );
};

export default Game3D;
