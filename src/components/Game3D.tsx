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
import GuidelineOverlay from './GuidelineOverlay';
import Grid3DLabels from './Grid3DLabels';
import Gyroscope from './Gyroscope';

const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 4, y: GRID_SIZE - 1, z: 4 }; // Start at the top
const MAX_LEVEL = 99;
const BASE_TIME_LIMIT = 180; // 3 minutes in seconds for level 1
const BASE_DROP_SPEED = 1000; // Base speed in ms (level 1)
const GAME_OVER_Y_LEVEL = 2; // Game over if blocks reach level 2 or above

const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

const STACK_HEIGHT_THRESHOLD = 2; // Kept at 2, single source of truth

const Game3D: React.FC = () => {
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
  const [gamePaused, setGamePaused] = useState(true);
  const orbitControlsRef = useRef(null);
  const [currentView, setCurrentView] = useState<ViewPoint>(VIEW_POINTS[0]);
  const gravityTimerRef = useRef<number | null>(null);
  const [blocksAtWarningLevel, setBlocksAtWarningLevel] = useState(0);

  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(BASE_TIME_LIMIT - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level]);

  const getDropSpeed = () => {
    return Math.max(100, BASE_DROP_SPEED - (level * 50));
  };

  const initializeGrid = () => {
    const newGrid: number[][][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const layer: number[][] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const row: number[] = [];
        for (let z = 0; z < GRID_SIZE; z++) {
          row.push(0);
        }
        layer.push(row);
      }
      newGrid.push(layer);
    }
    return newGrid;
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (gamePaused || gameOver) {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    const dropSpeed = getDropSpeed();
    
    gravityTimerRef.current = window.setInterval(() => {
      moveBlock('down');
    }, dropSpeed);

    return () => {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [gamePaused, gameOver, level, position]);

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setTimerActive(false);
    setGamePaused(true);
    
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
  };

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

  const isValidPosition = (pattern: number[][], newX: number, newY: number, newZ: number) => {
    if (wouldExceedBoundary(pattern, newX, newY, newZ)) {
      return false;
    }
    
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
            continue;
          }
          
          if (grid[gridY][gridX][gridZ] !== 0) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const detectBlocksAtYLevel = (grid: number[][][], yLevel: number): number => {
    let blocksCount = 0;
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (grid[yLevel][x][z] !== 0) {
          blocksCount++;
        }
      }
    }
    
    return blocksCount;
  };

  const placeBlock = () => {
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
    
    setGrid(newGrid);
    
    const layersCleared = clearCompleteLayers(newGrid);
    
    const blocksAtLevelTwo = detectBlocksAtYLevel(newGrid, 2);
    if (blocksAtLevelTwo > 0) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `Blocks reached level 2. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
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
  };

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

  const clearCompleteLayers = (grid: number[][][]) => {
    let layersCleared = 0;
    const gridCopy = JSON.parse(JSON.stringify(grid));
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let rowFull = true;
        for (let x = 0; x < GRID_SIZE; x++) {
          if (gridCopy[y][x][z] === 0) {
            rowFull = false;
            break;
          }
        }
        
        if (rowFull) {
          for (let x = 0; x < GRID_SIZE; x++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
      
      for (let x = 0; x < GRID_SIZE; x++) {
        let rowFull = true;
        for (let z = 0; z < GRID_SIZE; z++) {
          if (gridCopy[y][x][z] === 0) {
            rowFull = false;
            break;
          }
        }
        
        if (rowFull) {
          for (let z = 0; z < GRID_SIZE; z++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
    }
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let columnFull = true;
        for (let y = 0; y < GRID_SIZE; y++) {
          if (gridCopy[y][x][z] === 0) {
            columnFull = false;
            break;
          }
        }
        
        if (columnFull) {
          for (let y = 0; y < GRID_SIZE; y++) {
            gridCopy[y][x][z] = 0;
          }
          layersCleared++;
        }
      }
    }
    
    for (let y = 0; y < GRID_SIZE; y++) {
      let layerFull = true;
      for (let x = 0; x < GRID_SIZE && layerFull; x++) {
        for (let z = 0; z < GRID_SIZE && layerFull; z++) {
          if (gridCopy[y][x][z] === 0) {
            layerFull = false;
          }
        }
      }
      
      if (layerFull) {
        for (let x = 0; x < GRID_SIZE; x++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            gridCopy[y][x][z] = 0;
          }
        }
        layersCleared++;
      }
    }
    
    applyGravityToBlocks(gridCopy);
    
    if (layersCleared > 0) {
      const levelMultiplier = 1 + (level * 0.1);
      const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
      setScore(prevScore => prevScore + pointsScored);
      toast({
        title: `${layersCleared} lines cleared!`,
        description: `+${pointsScored} points`,
      });
    }
    
    setGrid([...gridCopy]);
    return layersCleared;
  };

  const applyGravityToBlocks = (grid: number[][][]) => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        for (let y = 1; y < GRID_SIZE; y++) {
          if (grid[y][x][z] !== 0) {
            let newY = y;
            
            while (newY > 0 && grid[newY - 1][x][z] === 0) {
              newY--;
            }
            
            if (newY < y) {
              grid[newY][x][z] = grid[y][x][z];
              grid[y][x][z] = 0;
            }
          }
        }
      }
    }
  };

  const detectStackedBlocks = (grid: number[][][]) => {
    let stacks = 0;
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let stackHeight = 0;
        let currentBlock = 0;
        
        for (let y = 0; y < GRID_SIZE; y++) {
          if (grid[y][x][z] !== 0) {
            if (currentBlock === 0) {
              currentBlock = grid[y][x][z];
              stackHeight = 1;
            } else {
              stackHeight++;
              
              if (stackHeight >= STACK_HEIGHT_THRESHOLD) {
                stacks++;
              }
            }
          } else {
            currentBlock = 0;
            stackHeight = 0;
          }
        }
      }
    }
    
    return stacks;
  };

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

  const moveBlock = (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    let newX = position.x;
    let newY = position.y;
    let newZ = position.z;
    
    if (direction === 'left') newX -= 1;
    if (direction === 'right') newX += 1;
    if (direction === 'forward') newZ -= 1;
    if (direction === 'backward') newZ += 1;
    if (direction === 'down') newY -= 1;
    
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
    } else if (direction === 'down') {
      placeBlock();
    }
  };

  const rotateBlock = (axis: 'x' | 'y' | 'z') => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    const rotatedPattern = [...currentBlock.shape];
    
    if (axis === 'x' || axis === 'z') {
      const numRows = rotatedPattern.length;
      const numCols = rotatedPattern[0].length;
      
      const newPattern: number[][] = Array(numCols).fill(0).map(() => Array(numRows).fill(0));
      
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
      } else {
        const offsets = [
          { x: -1, y: 0, z: 0 },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 0, z: -1 },
          { x: 0, y: 0, z: 1 },
          { x: -1, y: 0, z: -1 },
          { x: 1, y: 0, z: -1 },
          { x: -1, y: 0, z: 1 },
          { x: 1, y: 0, z: 1 },
        ];
        
        let validPositionFound = false;
        
        for (const offset of offsets) {
          const newX = position.x + offset.x;
          const newY = position.y;
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
        
        if (!validPositionFound) {
          toast({
            title: "Can't rotate",
            description: "Not enough space to rotate block",
          });
        }
      }
    }
  };

  const dropBlock = () => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    let newY = position.y;
    
    while (isValidPosition(currentBlock.shape, position.x, newY - 1, position.z)) {
      newY--;
    }
    
    setPosition({ ...position, y: newY });
    
    setTimeout(() => {
      placeBlock();
    }, 0);
  };

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

  const startGame = () => {
    if (!gamePaused) return;
    
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
    
    toast({
      title: "Game Started",
      description: "Good luck!",
    });
  };

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

  const handleViewChange = (viewPoint: ViewPoint) => {
    setCurrentView(viewPoint);
    
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current as any;
      
      if (controls.object) {
        controls.object.position.set(...viewPoint.position);
        
        if (viewPoint.target) {
          controls.target.set(...viewPoint.target);
        } else {
          controls.target.set(4.5, 4.5, 4.5);
        }
        
        controls.update();
      }
    }
    
    toast({
      title: `View Changed`,
      description: `Now viewing from ${viewPoint.name}`,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-2 md:p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
        3D Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden w-full max-w-[1400px] flex flex-col md:flex-row gap-4 bg-black bg-opacity-30">
        <div className="flex-1 min-h-[550px] md:min-h-[650px]">
          <div className="flex justify-end items-center mb-2 p-2">
            <ViewControls 
              viewPoints={VIEW_POINTS} 
              onSelectView={handleViewChange}
            />
          </div>
          
          <div className="game-board rounded-lg overflow-hidden h-[500px] md:h-[600px] relative">
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
            <Grid3DLabels />
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-4 w-full md:w-64 p-4">
          <div className="space-y-4">
            <ScoreDisplay score={score} />
            
            <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
            
            <GameTimer 
              isActive={timerActive} 
              onTimeUp={handleTimeUp} 
              timeLimit={timeLimit} 
              level={level}
            />
            
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
              <div className="flex justify-center">
                <BlockPreview block={nextBlock} className="w-24 h-24" />
              </div>
            </div>
          </div>
          
          <GameControls3D 
            onReset={resetGame}
            onStartPause={toggleGamePause}
            isPaused={gamePaused}
            gameOver={gameOver}
          />
        </div>
      </div>
      
      {gameOver && (
        <div className="mt-6 animate-scale-in">
          <p className="text-xl text-white mb-3">Game Over! Final Score: {score} | Level: {level}</p>
        </div>
      )}
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3D;
