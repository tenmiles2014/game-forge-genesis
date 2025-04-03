
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Grid3D from './Grid3D';
import { BlockPattern, getRandomBlockPattern } from './BlockPatterns';
import GameControls3D from './GameControls3D';
import { useToast } from '@/hooks/use-toast';
import ScoreDisplay from './ScoreDisplay';
import LevelDisplay from './LevelDisplay';
import GameTimer from './GameTimer';

// Constants
const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 3, y: 9, z: 0 };
const MAX_LEVEL = 10;
const SPEEDS = [800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80];

// Helper function to convert color string to number index for the grid
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

const Game3D: React.FC = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState({ ...INITIAL_POSITION });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [autoDropSpeed, setAutoDropSpeed] = useState(SPEEDS[0]);
  const { toast } = useToast();

  // Create an empty 3D grid
  function createEmptyGrid(): number[][][] {
    const newGrid: number[][][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      newGrid[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        newGrid[y][x] = [];
        for (let z = 0; z < GRID_SIZE; z++) {
          newGrid[y][x][z] = 0;
        }
      }
    }
    return newGrid;
  }

  // Clear any complete layers in the grid
  const clearCompleteLayers = useCallback((grid: number[][][]): number => {
    let layersCleared = 0;
    
    // Check for complete horizontal layers (y-axis)
    for (let y = 0; y < GRID_SIZE; y++) {
      let layerComplete = true;
      
      for (let x = 0; x < GRID_SIZE && layerComplete; x++) {
        for (let z = 0; z < GRID_SIZE && layerComplete; z++) {
          if (grid[y][x][z] === 0) {
            layerComplete = false;
          }
        }
      }
      
      if (layerComplete) {
        // Clear the layer
        for (let x = 0; x < GRID_SIZE; x++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            grid[y][x][z] = 0;
          }
        }
        
        // Shift all layers above down
        for (let shiftY = y; shiftY < GRID_SIZE - 1; shiftY++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
              grid[shiftY][x][z] = grid[shiftY + 1][x][z];
              grid[shiftY + 1][x][z] = 0;
            }
          }
        }
        
        layersCleared++;
        // Decrement y to recheck the same layer after shifting
        y--;
      }
    }
    
    // Update score if layers were cleared
    if (layersCleared > 0) {
      // Score formula: level * (100 for 1 layer, 300 for 2, 500 for 3, 800 for 4)
      const layerScores = [0, 100, 300, 500, 800];
      const scoreIncrease = level * (layerScores[Math.min(layersCleared, 4)]);
      setScore(prevScore => prevScore + scoreIncrease);
      
      // Notify player
      if (layersCleared >= 2) {
        toast({
          title: `${layersCleared} Layers Cleared!`,
          description: `+${scoreIncrease} points`,
        });
      }
    }
    
    return layersCleared;
  }, [level, toast]);

  // Check if the current position is valid
  const isValidPosition = useCallback((
    shape: number[][], 
    posX: number, 
    posY: number, 
    posZ: number
  ): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridX = posX + x;
          const gridY = posY;
          const gridZ = posZ + y;
          
          // Check if out of bounds
          if (
            gridX < 0 || gridX >= GRID_SIZE ||
            gridY < 0 || gridY >= GRID_SIZE ||
            gridZ < 0 || gridZ >= GRID_SIZE
          ) {
            return false;
          }
          
          // Check if overlaps with existing block
          if (grid[gridY][gridX][gridZ] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid]);

  // Place the current block on the grid
  const placeBlock = useCallback(() => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          const gridX = position.x + x;
          const gridY = position.y;
          const gridZ = position.z + y;
          
          if (
            gridX >= 0 && gridX < GRID_SIZE &&
            gridY >= 0 && gridY < GRID_SIZE &&
            gridZ >= 0 && gridZ < GRID_SIZE
          ) {
            newGrid[gridY][gridX][gridZ] = getColorIndex(currentBlock.color);
          }
        }
      }
    }
    
    // First clear any complete layers and get the count
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Now set the grid after modifications from both placement and clearing
    setGrid(newGrid);
    
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    if (!isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `No space for new block. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
    setPosition(newPosition);
    
    if (layersCleared > 0 && level < MAX_LEVEL) {
      const layerThreshold = Math.ceil(level / 5) + 1;
      if (layersCleared >= layerThreshold) {
        const newLevel = Math.min(MAX_LEVEL, level + 1);
        setLevel(newLevel);
        toast({
          title: `Level Up!`,
          description: `You are now on level ${newLevel}`,
        });
      }
    }
  }, [grid, currentBlock, nextBlock, position, level, score, clearCompleteLayers, isValidPosition, toast]);

  // Move the block in a direction
  const moveBlock = useCallback((dx: number, dy: number, dz: number) => {
    if (gameOver || gamePaused || !controlsEnabled) return;
    
    const newX = position.x + dx;
    const newY = position.y + dy;
    const newZ = position.z + dz;
    
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
    } else if (dy === -1) {
      // If can't move down further, place the block
      placeBlock();
    }
  }, [gameOver, gamePaused, controlsEnabled, position, currentBlock.shape, isValidPosition, placeBlock]);

  // Auto drop block on interval
  useEffect(() => {
    if (gameOver || gamePaused || !timerActive) return;
    
    const intervalSpeed = SPEEDS[level - 1] || SPEEDS[SPEEDS.length - 1];
    if (autoDropSpeed !== intervalSpeed) {
      setAutoDropSpeed(intervalSpeed);
    }
    
    const intervalId = setInterval(() => {
      moveBlock(0, -1, 0);
    }, intervalSpeed);
    
    return () => clearInterval(intervalId);
  }, [gameOver, gamePaused, timerActive, level, moveBlock, autoDropSpeed]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
  }, []);

  // Toggle game pause state
  const togglePause = useCallback(() => {
    if (gameOver) return;
    setGamePaused(!gamePaused);
    setTimerActive(!gamePaused);
    setControlsEnabled(!gamePaused);
  }, [gameOver, gamePaused]);

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 p-4">
        <div className="w-full sm:w-3/4 h-[600px] bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Grid3D 
              grid={grid} 
              currentBlock={currentBlock} 
              position={position}
            />
            <OrbitControls 
              enablePan={false}
              minDistance={5}
              maxDistance={20}
            />
          </Canvas>
        </div>
        
        <div className="w-full sm:w-1/4 flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <ScoreDisplay score={score} />
            <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
            <GameTimer isActive={timerActive} onTimeUp={() => {}} timeLimit={180} level={level} />
          </div>
          
          <GameControls3D
            onReset={resetGame}
            onStartPause={togglePause}
            isPaused={gamePaused}
            gameOver={gameOver}
          />
        </div>
      </div>
    </div>
  );
};

export default Game3D;
