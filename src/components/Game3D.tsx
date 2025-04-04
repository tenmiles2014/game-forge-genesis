
import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Grid3D from './Grid3D';
import BlockPreview from './BlockPreview';
import GameControls3D from './GameControls3D';
import ScoreDisplay from './ScoreDisplay';
import LevelDisplay from './LevelDisplay';
import { useToast } from "@/hooks/use-toast";
import { getRandomBlockPattern, BlockPattern } from './BlockPatterns';

// Game constants
const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 3, y: 0, z: 3 };
const GAME_SPEED_MS = 1000;
const MAX_LEVEL = 10;

// Helper function to get a color index from a block color
const getColorIndex = (color: string): number => {
  const colorMap: { [key: string]: number } = {
    'red': 1,
    'blue': 2,
    'green': 3,
    'yellow': 4,
    'purple': 5,
    'cyan': 6,
    'orange': 7,
  };
  return colorMap[color] || 0;
};

const Game3D: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<number[][][]>(() => {
    // Initialize a 3D grid with zeros
    return Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => 
        Array(GRID_SIZE).fill(0)
      )
    );
  });
  
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState({ ...INITIAL_POSITION });
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  
  const { toast } = useToast();

  // Check if a position is valid for the current block
  const isValidPosition = useCallback((shape: number[][], x: number, y: number, z: number) => {
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
        if (shape[shapeY][shapeX]) {
          const gridX = x + shapeX;
          const gridY = y;
          const gridZ = z + shapeY;
          
          // Check if out of bounds
          if (
            gridX < 0 || gridX >= GRID_SIZE ||
            gridY < 0 || gridY >= GRID_SIZE ||
            gridZ < 0 || gridZ >= GRID_SIZE
          ) {
            return false;
          }
          
          // Check if cell is already occupied
          if (grid[gridY][gridX][gridZ] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid]);

  // Clear complete layers in the grid
  const clearCompleteLayers = useCallback((grid: number[][][]) => {
    let layersCleared = 0;
    
    // Check each Y-layer
    for (let y = 0; y < GRID_SIZE; y++) {
      let layerComplete = true;
      
      // Check if this layer is completely filled
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          if (grid[y][x][z] === 0) {
            layerComplete = false;
            break;
          }
        }
        if (!layerComplete) break;
      }
      
      // If layer is complete, clear it
      if (layerComplete) {
        layersCleared++;
        
        // Clear this layer
        for (let x = 0; x < GRID_SIZE; x++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            grid[y][x][z] = 0;
          }
        }
      }
    }
    
    return layersCleared;
  }, []);

  // Apply gravity to blocks after clearing layers
  const applyGravityToBlocks = useCallback((grid: number[][][]) => {
    // For each column
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        // Collect all blocks in this column
        const blocks: number[] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
          if (grid[y][x][z] !== 0) {
            blocks.push(grid[y][x][z]);
            grid[y][x][z] = 0;
          }
        }
        
        // Place blocks from bottom up
        for (let i = 0; i < blocks.length; i++) {
          const y = GRID_SIZE - 1 - i;
          grid[y][x][z] = blocks[blocks.length - 1 - i];
        }
      }
    }
  }, []);

  // Place the current block into the grid
  const placeBlock = useCallback(() => {
    setGrid(prevGrid => {
      // Create a deep copy of the current grid
      const newGrid = JSON.parse(JSON.stringify(prevGrid));
      
      // First, place the current block in the grid
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
      
      // Then clear any completed layers and calculate score
      const layersCleared = clearCompleteLayers(newGrid);
      
      // Finally, apply gravity to ensure blocks fall properly
      applyGravityToBlocks(newGrid);
      
      // Update score if layers were cleared
      if (layersCleared > 0) {
        const levelMultiplier = 1 + (level * 0.1);
        const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
        setTimeout(() => {
          setScore(prevScore => prevScore + pointsScored);
          toast({
            title: `${layersCleared} lines cleared!`,
            description: `+${pointsScored} points`,
          });

          // Check for level up
          if (level < MAX_LEVEL) {
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
        }, 200);
      }
      
      return newGrid; // Return the final modified grid
    });

    // Wait a bit longer (500ms) to see the effect of clearing layers
    setTimeout(() => {
      // Then set the next block
      const nextBlockPattern = nextBlock;
      setCurrentBlock(nextBlockPattern);
      setNextBlock(getRandomBlockPattern());
      
      const newPosition = {...INITIAL_POSITION};
      
      if (!isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
        setGameOver(true);
        setControlsEnabled(false);
        setGamePaused(true);
        toast({
          title: "Game Over!",
          description: `No space for new block. Final score: ${score} | Level: ${level}`,
        });
        return;
      }
      
      setPosition(newPosition);
    }, 500); // 500ms delay to see the effect of clearing layers
  }, [
    currentBlock, 
    nextBlock, 
    position, 
    isValidPosition, 
    clearCompleteLayers, 
    applyGravityToBlocks, 
    level, 
    score, 
    toast
  ]);

  // Move the current block
  const moveBlock = useCallback((dx: number, dy: number, dz: number) => {
    if (!controlsEnabled || gamePaused) return;
    
    const newX = position.x + dx;
    const newY = position.y + dy;
    const newZ = position.z + dz;
    
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
      return true;
    }
    
    // If moving down is not possible, place the block
    if (dy > 0) {
      placeBlock();
    }
    
    return false;
  }, [position, currentBlock, isValidPosition, controlsEnabled, gamePaused, placeBlock]);

  // Reset game state
  const resetGame = useCallback(() => {
    setGrid(Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => 
        Array(GRID_SIZE).fill(0)
      )
    ));
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setGamePaused(true);
    setControlsEnabled(true);
    setScore(0);
    setLevel(1);
  }, []);

  // Toggle game pause state
  const togglePause = useCallback(() => {
    if (gameOver) return;
    setGamePaused(prev => !prev);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (gamePaused || gameOver) return;
    
    const gameSpeed = Math.max(100, GAME_SPEED_MS - (level * 50));
    const timer = setTimeout(() => {
      moveBlock(0, 1, 0);
    }, gameSpeed);
    
    return () => clearTimeout(timer);
  }, [gamePaused, gameOver, moveBlock, level]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!controlsEnabled) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          moveBlock(-1, 0, 0);
          break;
        case 'ArrowRight':
        case 'd':
          moveBlock(1, 0, 0);
          break;
        case 'ArrowUp':
        case 'w':
          moveBlock(0, 0, -1);
          break;
        case 'ArrowDown':
        case 's':
          moveBlock(0, 0, 1);
          break;
        case ' ':
          // Drop block to bottom
          while (moveBlock(0, 1, 0)) {}
          break;
        case 'p':
          togglePause();
          break;
        case 'r':
          resetGame();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveBlock, controlsEnabled, togglePause, resetGame]);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-900 text-white">
      {/* Game canvas */}
      <div className="flex-grow relative">
        <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Grid3D 
            grid={grid} 
            currentBlock={currentBlock} 
            position={position} 
          />
          <OrbitControls enablePan={false} />
          <gridHelper args={[GRID_SIZE, GRID_SIZE]} />
          <axesHelper args={[5]} />
        </Canvas>
        
        {/* Game status overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-4">
          <ScoreDisplay score={score} />
          <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
        </div>
      </div>
      
      {/* Game controls sidebar */}
      <div className="w-full md:w-64 p-4 bg-gray-800 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center mb-4">3D Tetris</h2>
        
        {/* Next block preview */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Next Block</h3>
          <div className="h-32 relative">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <BlockPreview block={nextBlock} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        </div>
        
        {/* Game controls */}
        <GameControls3D 
          onReset={resetGame}
          onStartPause={togglePause}
          isPaused={gamePaused}
          gameOver={gameOver}
        />
        
        {/* Game instructions */}
        <div className="mt-auto">
          <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Controls</h3>
          <ul className="text-xs text-gray-400">
            <li>WASD / Arrows: Move block</li>
            <li>Space: Drop block</li>
            <li>P: Pause game</li>
            <li>R: Reset game</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game3D; // Add the default export
