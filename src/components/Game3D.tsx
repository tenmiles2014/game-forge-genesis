import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from "@/components/ui/use-toast";
import GameControls3D from './GameControls3D';
import { BlockPattern, getRandomBlockPattern } from './BlockPatterns';
import ScoreDisplay from './ScoreDisplay';
import Grid3D from './Grid3D';
import BlockPreview from './BlockPreview';

// Constants
const GRID_SIZE = 10;
const INITIAL_POSITION = { x: Math.floor(GRID_SIZE / 2) - 1, y: 0, z: Math.floor(GRID_SIZE / 2) - 1 };

const Game3D: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<number[][][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const orbitControlsRef = useRef(null);

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
    setPosition(INITIAL_POSITION);
    setGameOver(false);
    setControlsEnabled(true);
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

  // Check if the position is valid
  const isValidPosition = (pattern: number[][], newX: number, newY: number, newZ: number) => {
    const pattern3D = get3DPattern(pattern);
    
    for (let y = 0; y < pattern3D.length; y++) {
      for (let x = 0; x < pattern3D[y].length; x++) {
        for (let z = 0; z < pattern3D[y][x].length; z++) {
          if (pattern3D[y][x][z]) {
            const gridX = newX + x;
            const gridY = newY + y;
            const gridZ = newZ + z;
            
            // Check boundaries
            if (
              gridX < 0 || gridX >= GRID_SIZE || 
              gridY < 0 || gridY >= GRID_SIZE || 
              gridZ < 0 || gridZ >= GRID_SIZE
            ) {
              return false;
            }
            
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
    clearCompleteLayers(newGrid);
    
    // Get next block
    setCurrentBlock(nextBlock);
    setNextBlock(getRandomBlockPattern());
    setPosition(INITIAL_POSITION);
    
    // Check if game is over
    if (!isValidPosition(nextBlock.shape, INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
      });
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
    
    // Update score
    if (layersCleared > 0) {
      const pointsScored = layersCleared * layersCleared * 100;
      setScore(prevScore => prevScore + pointsScored);
      toast({
        title: `${layersCleared} layers cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid([...grid]);
  };

  // Game controls
  const moveBlock = (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => {
    if (gameOver || !controlsEnabled) return;
    
    let newX = position.x;
    let newY = position.y;
    let newZ = position.z;
    
    if (direction === 'left') newX -= 1;
    if (direction === 'right') newX += 1;
    if (direction === 'forward') newZ -= 1;
    if (direction === 'backward') newZ += 1;
    if (direction === 'down') newY += 1;
    
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
    } else if (direction === 'down') {
      // If we can't move down, place the block
      placeBlock();
    }
  };
  
  const rotateBlock = (axis: 'x' | 'y' | 'z') => {
    if (gameOver || !controlsEnabled) return;
    
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
      
      if (isValidPosition(newPattern, position.x, position.y, position.z)) {
        setCurrentBlock({
          ...currentBlock,
          shape: newPattern
        });
      }
    }
  };
  
  const dropBlock = () => {
    if (gameOver || !controlsEnabled) return;
    
    let newY = position.y;
    
    // Find the lowest valid position
    while (isValidPosition(currentBlock.shape, position.x, newY + 1, position.z)) {
      newY++;
    }
    
    setPosition({ ...position, y: newY });
    placeBlock();
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!controlsEnabled) return;
      
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
        case ' ':  // Space key
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
  }, [position, currentBlock, grid, gameOver, controlsEnabled]);

  // Render game
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        3D Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden max-w-5xl w-full flex flex-col md:flex-row gap-6 p-6 bg-black bg-opacity-30">
        <div className="flex-1">
          <div className="game-board rounded-lg overflow-hidden h-[500px]">
            <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
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
              />
              <gridHelper args={[GRID_SIZE, GRID_SIZE]} />
              <axesHelper args={[5]} />
            </Canvas>
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
          <p className="text-xl text-white mb-3">Game Over! Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default Game3D;
