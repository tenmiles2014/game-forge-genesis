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
import { useIsMobile } from '@/hooks/use-mobile';
import { CameraIcon, ArrowUp, ArrowLeft } from 'lucide-react';
import MobileControlsOverlay from './MobileControlsOverlay';

const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 4, y: GRID_SIZE - 1, z: 4 }; // Start at the top
const MAX_LEVEL = 99;
const BASE_DROP_SPEED = 1000; // Base speed in ms (level 1)
const BLINK_DURATION = 1000; // Duration of blinking effect in ms

const VIEW_POINTS: ViewPoint[] = [
  { name: "Default View", position: [15, 15, 15], icon: <CameraIcon className="h-4 w-4" /> },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5], icon: <ArrowUp className="h-4 w-4" /> },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0], icon: <ArrowLeft className="h-4 w-4" /> },
];

const Game3D: React.FC = () => {
  const isMobile = useIsMobile();
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
  const [linesCleared, setLinesCleared] = useState(0);
  const [layerBlockCounts, setLayerBlockCounts] = useState({ layer1: 0, layer2: 0 });
  const [blinkingLayers, setBlinkingLayers] = useState<Array<{
    type: 'row' | 'column' | 'layer', 
    y?: number, 
    x?: number, 
    z?: number
  }>>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [layersUntilCollision, setLayersUntilCollision] = useState<number>(0);

  const getDropSpeed = () => {
    return Math.max(100, BASE_DROP_SPEED - (level * 5)); // Updated to decrease by 5ms per level
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

  const countBlocksByLayers = (grid: number[][][], currentLevel: number) => {
    const layerBlockCounts = Array(GRID_SIZE).fill(0);
    
    for (let y = 0; y < GRID_SIZE; y++) {
      let layerCount = 0;
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          if (grid[y][x][z] !== 0) {
            layerCount++;
          }
        }
      }
      layerBlockCounts[y] = layerCount;
    }
    
    console.log(`Level ${currentLevel}: Blocks per layer: `, 
      layerBlockCounts.map((count, idx) => `Layer ${idx + 1}: ${count}`).join(', '));
    
    // Update the layer block counts state
    setLayerBlockCounts({
      layer1: layerBlockCounts[1],
      layer2: layerBlockCounts[2]
    });
      
    return layerBlockCounts;
  };

  const checkGameOverRules = (grid: number[][][]) => {
    const layerCounts = countBlocksByLayers(grid, level);
    
    // No limitation on layer 1 (index 0)
    const tooManyInLayer2 = layerCounts[1] > 8; // Layer 2 (index 1) max 8 blocks
    const tooManyInLayer3 = layerCounts[2] > 5;  // Layer 3 (index 2) max 5 blocks
    const blocksInUpperLayers = layerCounts.slice(3).some(count => count > 0); // No blocks above layer 3
    
    const isGameOverDueToRules = tooManyInLayer2 || tooManyInLayer3 || blocksInUpperLayers;
    
    if (isGameOverDueToRules) {
      let reason = '';
      if (tooManyInLayer2) reason = `Too many blocks in layer 2 (${layerCounts[1]}/8)`;
      else if (tooManyInLayer3) reason = `Too many blocks in layer 3 (${layerCounts[2]}/5)`;
      else if (blocksInUpperLayers) reason = 'Blocks detected above layer 3';
      
      console.log(`Game over due to rule violation: ${reason}`);
      return { isGameOver: true, reason };
    }
    
    return { isGameOver: false, reason: '' };
  };

  const resetGame = () => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setGamePaused(true);
    
    // Reset layer block counts
    setLayerBlockCounts({ layer1: 0, layer2: 0 });
    
    // Reset the countdown counter
    setLayersUntilCollision(0);
    
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    toast({
      title: "New Game",
      description: "Game has been reset. Click Start to begin!",
    });
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (grid.length > 0 && !gameOver && !gamePaused) {
      const { isGameOver, reason } = checkGameOverRules(grid);
      
      if (isGameOver) {
        setGameOver(true);
        setControlsEnabled(false);
        setGamePaused(true);
        toast({
          title: "Game Over!",
          description: `Rule violation: ${reason}. Final score: ${score} | Level: ${level}`,
        });
      }
    }
  }, [grid, gameOver, gamePaused]);

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

  useEffect(() => {
    if (!gamePaused && !gameOver && grid.length > 0) {
      calculateLayersUntilCollision();
    }
  }, [position, grid, currentBlock, gamePaused, gameOver]);

  const calculateLayersUntilCollision = () => {
    let layersCount = 0;
    let newY = position.y;
    
    // Keep checking layers below until we find a collision
    while (newY > 0 && isValidPosition(currentBlock.shape, position.x, newY - 1, position.z)) {
      newY--;
      layersCount++;
    }
    
    setLayersUntilCollision(layersCount);
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

  const placeBlock = () => {
    console.log('--- placeBlock START ---');
    console.log('Current Block:', {
      shape: currentBlock.shape,
      color: currentBlock.color
    });
    console.log('Current Position:', position);

    console.log('Function sequence: placeBlock() started');

    const newGrid = JSON.parse(JSON.stringify(grid));
    
    console.log('Function sequence: Creating new grid copy');
    
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
            const colorIndex = getColorIndex(currentBlock.color);
            newGrid[gridY][gridX][gridZ] = colorIndex;
          } else {
            console.warn(`Block placement out of bounds: (${gridX},${gridY},${gridZ})`);
          }
        }
      }
    }
    
    console.log('Function sequence: Setting updated grid state');
    setGrid(newGrid);
    
    // Count blocks by layer after placing the block
    countBlocksByLayers(newGrid, level);
    
    console.log('Function sequence: Calling clearCompleteLayers()');
    clearCompleteLayers(newGrid);
    
    console.log('Function sequence: Setting up next block');
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    console.log('Next Block:', {
      shape: nextBlockPattern.shape,
      color: nextBlockPattern.color
    });
    
    console.log('Function sequence: Checking if new block can be placed');
    if (!isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      console.error('Game Over: No space for new block');
      
      console.log('Function sequence: Game over condition triggered');
      setGameOver(true);
      setControlsEnabled(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `No space for new block. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
    console.log('Function sequence: Setting new position');
    setPosition(newPosition);
    
    console.log('--- placeBlock END ---');
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
    console.log('Function sequence: clearCompleteLayers() started');
    
    // Apply gravity to blocks first
    console.log('Function sequence: Applying gravity to blocks FIRST TIME (before clearing)');
    applyGravityToBlocks(grid);
    
    // Find all complete layers
    const completeLayers: Array<{
      type: 'row' | 'column' | 'layer', 
      y?: number, 
      x?: number, 
      z?: number
    }> = [];
    
    // Check for complete rows (X-axis lines at fixed Y,Z)
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let rowFull = true;
        for (let x = 0; x < GRID_SIZE; x++) {
          if (grid[y][x][z] === 0) {
            rowFull = false;
            break;
          }
        }
        
        if (rowFull) {
          completeLayers.push({ type: 'row', y, z });
        }
      }
    }
    
    // Check for complete columns (Z-axis lines at fixed X,Y)
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let rowFull = true;
        for (let z = 0; z < GRID_SIZE; z++) {
          if (grid[y][x][z] === 0) {
            rowFull = false;
            break;
          }
        }
        
        if (rowFull) {
          completeLayers.push({ type: 'column', y, x });
        }
      }
    }
    
    // Check for complete vertical columns (Y-axis lines at fixed X,Z)
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        let columnFull = true;
        for (let y = 0; y < GRID_SIZE; y++) {
          if (grid[y][x][z] === 0) {
            columnFull = false;
            break;
          }
        }
        
        if (columnFull) {
          completeLayers.push({ type: 'column', x, z });
        }
      }
    }
    
    // Check for complete horizontal layers (all blocks at a fixed Y)
    for (let y = 0; y < GRID_SIZE; y++) {
      let layerFull = true;
      for (let x = 0; x < GRID_SIZE && layerFull; x++) {
        for (let z = 0; z < GRID_SIZE && layerFull; z++) {
          if (grid[y][x][z] === 0) {
            layerFull = false;
          }
        }
      }
      
      if (layerFull) {
        completeLayers.push({ type: 'layer', y });
      }
    }
    
    const layersCleared = completeLayers.length;
    
    // If we have layers to clear, start the blinking effect
    if (layersCleared > 0) {
      setBlinkingLayers(completeLayers);
      setIsBlinking(true);
      
      // After the blinking duration, clear the layers
      setTimeout(() => {
        setIsBlinking(false);
        setBlinkingLayers([]);
        
        const gridCopy = JSON.parse(JSON.stringify(grid));
        
        // Clear the complete layers
        completeLayers.forEach(layer => {
          if (layer.type === 'row' && layer.y !== undefined && layer.z !== undefined) {
            for (let x = 0; x < GRID_SIZE; x++) {
              gridCopy[layer.y][x][layer.z] = 0;
            }
          } else if (layer.type === 'column' && layer.y !== undefined && layer.x !== undefined) {
            for (let z = 0; z < GRID_SIZE; z++) {
              gridCopy[layer.y][layer.x][z] = 0;
            }
          } else if (layer.type === 'column' && layer.x !== undefined && layer.z !== undefined) {
            for (let y = 0; y < GRID_SIZE; y++) {
              gridCopy[y][layer.x][layer.z] = 0;
            }
          } else if (layer.type === 'layer' && layer.y !== undefined) {
            for (let x = 0; x < GRID_SIZE; x++) {
              for (let z = 0; z < GRID_SIZE; z++) {
                gridCopy[layer.y][x][z] = 0;
              }
            }
          }
        });
        
        console.log('Function sequence: Applying gravity to blocks SECOND TIME (after clearing)');
        applyGravityToBlocks(gridCopy);
        
        // Update the layer counts after clearing and applying gravity
        countBlocksByLayers(gridCopy, level);
        
        // Calculate score based on layers cleared
        const levelMultiplier = 1 + (level * 0.1);
        const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
        
        console.log('Scoring details:', {
          layersCleared,
          basePoints: layersCleared * 10,
          levelMultiplier,
          totalPointsScored: pointsScored
        });
        
        setScore(prevScore => prevScore + pointsScored);
        
        // Update the linesCleared counter
        const newLinesCleared = linesCleared + layersCleared;
        setLinesCleared(newLinesCleared);
        
        toast({
          title: `${layersCleared} lines cleared!`,
          description: `+${pointsScored} points`,
        });
        
        setGrid([...gridCopy]);
        
        console.log('Function sequence: clearCompleteLayers() completed');
        
        // Check for level up - Modified to fix incorrect progressions
        if (layersCleared > 0 && level < MAX_LEVEL) {
          if (level < 5) {
            const layerThreshold = level + 1;
            if (layersCleared >= layerThreshold) {
              const newLevel = Math.min(MAX_LEVEL, level + 1);
              
              const levelUpBonus = newLevel * 100;
              setScore(prevScore => prevScore + levelUpBonus);
              
              console.log(`Function sequence: Level up triggered (${level} → ${newLevel})`);
              setLevel(newLevel);
              toast({
                title: `Level Up!`,
                description: `You cleared ${layersCleared} layers simultaneously! Now on level ${newLevel}. Bonus: +${levelUpBonus} points!`,
              });
            }
          } else {
            const tier = Math.ceil(level / 2);
            const tierLayerTarget = 20;
            
            const prevTierProgress = Math.floor(linesCleared / tierLayerTarget);
            const newTierProgress = Math.floor(newLinesCleared / tierLayerTarget);
            
            if (prevTierProgress < newTierProgress) {
              const newLevel = Math.min(MAX_LEVEL, level + 1);
              
              const levelUpBonus = newLevel * 100;
              setScore(prevScore => prevScore + levelUpBonus);
              
              console.log(`Function sequence: Level up triggered (${level} → ${newLevel})`);
              setLevel(newLevel);
              toast({
                title: `Level Up!`,
                description: `You completed tier ${tier} (${tierLayerTarget} layers)! Now on level ${newLevel}. Bonus: +${levelUpBonus} points!`,
              });
            }
          }
        }
      }, BLINK_DURATION);
    }
    
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
      
      // Recalculate layers after a move
      if (direction !== 'down') {
        setTimeout(() => calculateLayersUntilCollision(), 0);
      }
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

  const handleTouchStart = React.useCallback((event: React.TouchEvent) => {
    // We're keeping this only for the touch feedback but not for controlling blocks
    // It will do nothing functional, but preserves the touch feedback for UI elements
  }, []);

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
      title: `Camera: ${viewPoint.name}`,
      description: `Switched to ${viewPoint.name.toLowerCase()} for better visibility`,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-2 md:p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-white text-center">
        3D Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden w-full max-w-full md:max-w-[90vw] lg:max-w-[85vw] 2xl:max-w-[75vw] flex flex-col md:flex-row gap-2 md:gap-4 bg-black bg-opacity-30">
        <div className="flex-1 min-h-[350px] sm:min-h-[400px] md:min-h-[550px] lg:min-h-[650px]">
          {/* Mobile Game Stats Grid - Only visible on mobile */}
          {isMobile && (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 mb-2 p-1 bg-black bg-opacity-30 rounded-lg max-h-[110px]">
              <ScoreDisplay score={score} />
              <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
              <div className="rounded-lg bg-black bg-opacity-30 p-2 text-center">
                <h3 className="text-xs uppercase tracking-wide font-medium text-gray-300 mb-1">NEXT</h3>
                <BlockPreview block={nextBlock} className="w-10 h-10 mx-auto" />
              </div>
              <div className="rounded-lg bg-black bg-opacity-30 p-2">
                <h3 className="text-xs uppercase tracking-wide font-medium text-white mb-1">BLOCK LIMITS</h3>
                <div className="text-[10px] text-white">
                  <div className="flex justify-between">
                    <span className="text-white">Layer 2:</span>
                    <span className={layerBlockCounts.layer2 > 8 ? "text-red-400" : "text-white"}>{layerBlockCounts.layer2}/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Layer 3:</span>
                    <span className="text-white">0/5</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap justify-between items-center mb-1 sm:mb-2 p-1 sm:p-2">
            <ViewControls 
              viewPoints={VIEW_POINTS} 
              onSelectView={handleViewChange}
              className="flex-1 mr-1"
            />
            
            <GameControls3D 
              onReset={resetGame}
              onStartPause={gamePaused ? startGame : toggleGamePause}
              isPaused={gamePaused}
              gameOver={gameOver}
              className="flex-none"
            />
          </div>
          
          <div 
            className="game-board rounded-lg overflow-hidden h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] relative"
            ref={gameBoardRef}
            tabIndex={0}
            onTouchStart={handleTouchStart}
          >
            {/* Countdown Label */}
            {!gamePaused && !gameOver && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-70 px-3 py-1 rounded-md text-white font-semibold">
                {layersUntilCollision} {layersUntilCollision === 1 ? 'layer' : 'layers'} until collision
              </div>
            )}
            
            <Canvas camera={{ position: currentView.position, fov: isMobile ? 60 : 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Grid3D 
                grid={grid} 
                currentBlock={currentBlock} 
                position={position}
                blinkingLayers={isBlinking ? blinkingLayers : []}
              />
              <OrbitControls 
                ref={orbitControlsRef} 
                enabled={controlsEnabled}
                minDistance={8}
                maxDistance={30}
                target={currentView.target || [4.5, 4.5, 4.5]}
              />
            </Canvas>
            
            {/* Mobile Controls Overlay - Only visible on mobile and when game is active */}
            {isMobile && !gamePaused && !gameOver && (
              <MobileControlsOverlay
                onMove={moveBlock}
                onRotate={() => rotateBlock('z')}
                onDrop={dropBlock}
              />
            )}
          </div>
        </div>
        
        {/* Desktop Game Stats - Only visible on non-mobile */}
        {!isMobile && (
          <div className="game-score p-2 md:p-4 rounded-lg w-full md:w-64 flex flex-col gap-2 md:gap-4">
            <ScoreDisplay score={score} />
            <LevelDisplay level={level} maxLevel={MAX_LEVEL} />
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Next Block</h3>
              <BlockPreview block={nextBlock} className="w-24 h-24 mx-auto" />
            </div>
            <div className="p-4 rounded-lg bg-black bg-opacity-30">
              <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">BLOCK LIMITS</h3>
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span>Layer 2:</span>
                  <span className={layerBlockCounts.layer2 > 8 ? "text-red-400" : ""}>{layerBlockCounts.layer2}/8</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Layer 3:</span>
                  <span>0/5</span>
                </div>
              </div>
            </div>
            <Grid3DLabels layerBlockCounts={layerBlockCounts} />
          </div>
        )}
      </div>
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3D;
