import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from "@/components/ui/use-toast";
import GameControls3D from './GameControls3D';
import { BlockPattern, getRandomBlockPattern } from './BlockPatterns';
import ScoreDisplay from './ScoreDisplay';
import Grid3D from './Grid3D';
import BlockPreview from './BlockPreview';
import LevelDisplay from './LevelDisplay';
import ViewControls, { ViewPoint } from './ViewControls';
import GuidelineOverlay from './GuidelineOverlay';
import Grid3DLabels from './Grid3DLabels';
import Gyroscope from './Gyroscope';

const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 4, y: GRID_SIZE - 1, z: 4 }; // Start at the top
const MAX_LEVEL = 99;
const BASE_DROP_SPEED = 1000; // Base speed in ms (level 1)
const MIN_CONNECTED_BLOCKS = 5; // Minimum number of connected blocks to clear a layer

const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

// Game state enum
enum GameAnimationState {
  IDLE,
  HIGHLIGHTING,
  CLEARING,
}

const Game3D: React.FC = () => {
  const [grid, setGrid] = useState<number[][][]>([]);
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [gameOver, setGameOver] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [level, setLevel] = useState(1);
  const [gamePaused, setGamePaused] = useState(true);
  const orbitControlsRef = useRef(null);
  const [currentView, setCurrentView] = useState<ViewPoint>(VIEW_POINTS[0]);
  const gravityTimerRef = useRef<number | null>(null);
  const gameBoardRef = useRef<HTMLDivElement>(null);
  const [blocksPlaced, setBlocksPlaced] = useState(0);
  const [testMode, setTestMode] = useState(true);
  
  // Animation state
  const [animationState, setAnimationState] = useState<GameAnimationState>(GameAnimationState.IDLE);
  const [highlightedLayers, setHighlightedLayers] = useState<{y: number, type: string, index: number}[]>([]);
  const animationQueueRef = useRef<{y: number, type: string, index: number}[]>([]);

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
    if (gamePaused || gameOver || animationState !== GameAnimationState.IDLE) {
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
  }, [gamePaused, gameOver, level, position, animationState]);

  // Handle animation sequence
  useEffect(() => {
    if (animationState === GameAnimationState.HIGHLIGHTING && highlightedLayers.length > 0) {
      // Process the first layer in the queue
      const currentLayer = highlightedLayers[0];
      
      // After highlight duration, process the next step
      const timer = setTimeout(() => {
        // Remove the current layer from the queue
        setHighlightedLayers(prev => prev.slice(1));
        
        if (highlightedLayers.length <= 1) {
          // If this was the last layer, move to clearing state
          setAnimationState(GameAnimationState.CLEARING);
          
          // Process the clearing with a short delay
          setTimeout(() => {
            const gridCopy = JSON.parse(JSON.stringify(grid));
            // Apply all the clearing operations in sequence
            animationQueueRef.current.forEach(layer => {
              if (layer.type === 'horizontalRow') {
                for (let x = 0; x < GRID_SIZE; x++) {
                  gridCopy[layer.y][x][layer.index] = 0;
                }
              } else if (layer.type === 'horizontalColumn') {
                for (let z = 0; z < GRID_SIZE; z++) {
                  gridCopy[layer.y][layer.index][z] = 0;
                }
              } else if (layer.type === 'verticalColumn') {
                for (let y = 0; y < GRID_SIZE; y++) {
                  gridCopy[y][layer.index][layer.y] = 0;
                }
              } else if (layer.type === 'fullLayer') {
                for (let x = 0; x < GRID_SIZE; x++) {
                  for (let z = 0; z < GRID_SIZE; z++) {
                    gridCopy[layer.y][x][z] = 0;
                  }
                }
              }
            });
            
            // Apply gravity after clearing
            applyGravityToBlocks(gridCopy);
            setGrid(gridCopy);
            
            // Calculate score based on how many layers were cleared
            const layersCleared = animationQueueRef.current.length;
            const levelMultiplier = 1 + (level * 0.1);
            const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
            
            setScore(prev => prev + pointsScored);
            
            if (layersCleared > 0) {
              toast({
                title: `${layersCleared} layers cleared!`,
                description: `+${pointsScored} points`,
              });
            }
            
            // Reset the animation state and clear the queue
            animationQueueRef.current = [];
            setAnimationState(GameAnimationState.IDLE);
            
            // Spawn the next block
            spawnNextBlock();
          }, 500); // Delay before applying clearing effect
        }
      }, 800); // Highlight duration for each layer
      
      return () => clearTimeout(timer);
    }
    
    if (animationState === GameAnimationState.CLEARING && highlightedLayers.length === 0) {
      // This state is handled in the effect above
    }
  }, [animationState, highlightedLayers, grid]);

  // Spawn the next block after animations
  const spawnNextBlock = () => {
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
  };

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setGamePaused(true);
    setBlocksPlaced(0);
    setAnimationState(GameAnimationState.IDLE);
    setHighlightedLayers([]);
    animationQueueRef.current = [];
    
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

  const countConnectedBlocks = (
    gridCopy: number[][][],
    x: number,
    y: number,
    z: number,
    color: number,
    visited: boolean[][][]
  ): number => {
    if (
      x < 0 || x >= GRID_SIZE ||
      y < 0 || y >= GRID_SIZE ||
      z < 0 || z >= GRID_SIZE ||
      visited[y][x][z] ||
      gridCopy[y][x][z] !== color
    ) {
      return 0;
    }
    
    visited[y][x][z] = true;
    
    return 1 + 
           countConnectedBlocks(gridCopy, x+1, y, z, color, visited) +
           countConnectedBlocks(gridCopy, x-1, y, z, color, visited) +
           countConnectedBlocks(gridCopy, x, y+1, z, color, visited) +
           countConnectedBlocks(gridCopy, x, y-1, z, color, visited) +
           countConnectedBlocks(gridCopy, x, y, z+1, color, visited) +
           countConnectedBlocks(gridCopy, x, y, z-1, color, visited);
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
    setBlocksPlaced(prev => prev + 1);
    
    const layersToHighlight = findLayersToClear(newGrid);
    
    if (layersToHighlight.length > 0) {
      animationQueueRef.current = layersToHighlight;
      setHighlightedLayers(layersToHighlight);
      setAnimationState(GameAnimationState.HIGHLIGHTING);
    } else {
      spawnNextBlock();
    }
  };

  const findLayersToClear = (gridCopy: number[][][]) => {
    const layersToClear: {y: number, type: string, index: number}[] = [];
    const visited: boolean[][][] = Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => 
        Array(GRID_SIZE).fill(false)
      )
    );
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          if (!visited[y][x][z] && gridCopy[y][x][z] !== 0) {
            const color = gridCopy[y][x][z];
            const connectedBlocks = countConnectedBlocks(gridCopy, x, y, z, color, visited);
            
            if (connectedBlocks >= MIN_CONNECTED_BLOCKS) {
              let isHorizontalRow = true;
              for (let i = 0; i < GRID_SIZE; i++) {
                if (gridCopy[y][x][i] === 0) {
                  isHorizontalRow = false;
                  break;
                }
              }
              
              if (isHorizontalRow) {
                layersToClear.push({ y, type: 'horizontalRow', index: x });
                continue;
              }
              
              let isHorizontalColumn = true;
              for (let i = 0; i < GRID_SIZE; i++) {
                if (gridCopy[y][i][z] === 0) {
                  isHorizontalColumn = false;
                  break;
                }
              }
              
              if (isHorizontalColumn) {
                layersToClear.push({ y, type: 'horizontalColumn', index: z });
                continue;
              }
              
              let isVerticalColumn = true;
              for (let i = 0; i < GRID_SIZE; i++) {
                if (gridCopy[i][x][z] === 0) {
                  isVerticalColumn = false;
                  break;
                }
              }
              
              if (isVerticalColumn) {
                layersToClear.push({ y: z, type: 'verticalColumn', index: x });
                continue;
              }
              
              let isFullLayer = true;
              for (let i = 0; i < GRID_SIZE && isFullLayer; i++) {
                for (let j = 0; j < GRID_SIZE && isFullLayer; j++) {
                  if (gridCopy[y][i][j] === 0) {
                    isFullLayer = false;
                  }
                }
              }
              
              if (isFullLayer) {
                layersToClear.push({ y, type: 'fullLayer', index: -1 });
              }
            }
          }
        }
      }
    }
    
    return layersToClear;
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

  const moveBlock = (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => {
    if (gameOver || !controlsEnabled || gamePaused || animationState !== GameAnimationState.IDLE) return;
    
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
    if (gameOver || !controlsEnabled || gamePaused || animationState !== GameAnimationState.IDLE) return;
    
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
    if (gameOver || !controlsEnabled || gamePaused || animationState !== GameAnimationState.IDLE) return;
    
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
      
      if (gameBoardRef.current) {
        setTimeout(() => {
          gameBoardRef.current?.focus();
        }, 0);
      }
    }
  };

  const toggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);
    toast({
      title: `Test Mode ${newTestMode ? "Enabled" : "Disabled"}`,
      description: newTestMode 
        ? "Layers will clear after 5 blocks are placed" 
        : "Normal gameplay resumed",
    });
  };

  const startGame = () => {
    if (!gamePaused) return;
    
    setGamePaused(false);
    setControlsEnabled(true);
    
    if (gameBoardRef.current) {
      setTimeout(() => {
        gameBoardRef.current?.focus();
      }, 0);
    }
    
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
        case 't':  // Toggle test mode
          toggleTestMode();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, currentBlock, grid, gameOver, controlsEnabled, gamePaused, testMode, animationState]);

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
          <div className="flex justify-between items-center mb-2 p-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${testMode ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
              {testMode ? 'TEST MODE ON' : 'TEST MODE OFF'} - Press 'T' to toggle
            </div>
            <ViewControls 
              viewPoints={VIEW_POINTS} 
              onSelectView={handleViewChange}
            />
          </div>
          
          <div 
            className="game-board rounded-lg overflow-hidden h-[500px] md:h-[600px] relative"
            ref={gameBoardRef}
            tabIndex={0}
          >
            <Canvas camera={{ position: currentView.position, fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Grid3D 
                grid={grid} 
                currentBlock={currentBlock} 
                position={position}
                highlightedLayers={animationState === GameAnimationState.HIGHLIGHTING ? highlightedLayers : []}
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
            
            {animationState !== GameAnimationState.IDLE && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded-full text-white text-sm">
                {animationState === GameAnimationState.HIGHLIGHTING ? 'Highlighting' : 'Clearing'} Layers...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-4 w-full md:w-64 p-4">
          <div className="space-y-4">
            <ScoreDisplay score={score} />
            
            <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
            
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
              <div className="flex justify-center">
                <BlockPreview block={nextBlock} className="w-24 h-24" />
              </div>
            </div>
            
            {testMode && (
              <div className="p-4 rounded-lg bg-green-900 bg-opacity-30">
                <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-1">Test Mode</h3>
                <p className="text-white text-xs">Blocks placed: {blocksPlaced}/5</p>
                <div className="w-full bg-gray-700 h-2 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-300" 
                    style={{ width: `${(blocksPlaced / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {animationState !== GameAnimationState.IDLE && (
              <div className="p-4 rounded-lg bg-blue-900 bg-opacity-30">
                <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-1">Layer Action</h3>
                <p className="text-white text-xs">
                  {animationState === GameAnimationState.HIGHLIGHTING
                    ? `Highlighting ${highlightedLayers.length} layers...`
                    : 'Clearing layers...'
                  }
                </p>
                <div className="w-full bg-gray-700 h-2 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300" 
                    style={{ 
                      width: animationState === GameAnimationState.HIGHLIGHTING 
                        ? `${((animationQueueRef.current.length - highlightedLayers.length) / Math.max(1, animationQueueRef.current.length)) * 100}%` 
                        : '100%' 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <GameControls3D 
            onReset={resetGame}
            onStartPause={gamePaused ? startGame : toggleGamePause}
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
