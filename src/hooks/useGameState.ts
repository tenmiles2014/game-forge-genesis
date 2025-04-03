
import { useState, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern, getRandomBlockPattern } from '../components/BlockPatterns';

const GRID_SIZE = 10;
const INITIAL_POSITION = { x: 4, y: 8, z: 4 }; // Changed from top (GRID_SIZE-1) to y: 8 for better visibility
const MAX_LEVEL = 99;
const BASE_TIME_LIMIT = 180; // 3 minutes in seconds for level 1
const BASE_DROP_SPEED = 1000; // Base speed in ms (level 1)
const VERTICAL_STACK_LIMIT = 3; // Game over if blocks stack higher than this from the bottom

export function useGameState() {
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
  const [linesCleared, setLinesCleared] = useState(0);
  const gravityTimerRef = useRef<number | null>(null);

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
  
  return {
    grid, setGrid,
    score, setScore, 
    currentBlock, setCurrentBlock,
    nextBlock, setNextBlock,
    position, setPosition,
    gameOver, setGameOver,
    controlsEnabled, setControlsEnabled,
    level, setLevel,
    timeLimit, setTimeLimit,
    timerActive, setTimerActive,
    gamePaused, setGamePaused,
    linesCleared, setLinesCleared,
    gravityTimerRef,
    getDropSpeed,
    initializeGrid,
    getColorIndex,
    GRID_SIZE,
    INITIAL_POSITION,
    MAX_LEVEL,
    VERTICAL_STACK_LIMIT
  };
}
