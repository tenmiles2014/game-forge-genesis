
import { useEffect } from 'react';

interface UseGravityTimerProps {
  grid: number[][][];
  currentBlock: any;
  gamePaused: boolean;
  gameOver: boolean;
  controlsEnabled: boolean;
  timerActive: boolean;
  level: number;
  moveBlock: (direction: string) => boolean;
  dropBlock: () => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  getDropSpeed: () => number;
  setControlsEnabled: (enabled: boolean) => void;
}

export function useGravityTimer({
  grid,
  currentBlock,
  gamePaused,
  gameOver,
  controlsEnabled,
  timerActive,
  level,
  moveBlock,
  dropBlock,
  gravityTimerRef,
  getDropSpeed,
  setControlsEnabled
}: UseGravityTimerProps) {
  
  useEffect(() => {
    console.log(`Game state changed - gamePaused: ${gamePaused}, gameOver: ${gameOver}, controlsEnabled: ${controlsEnabled}, timerActive: ${timerActive}`);
    
    if (gamePaused || gameOver) {
      console.log("Game paused or over - clearing gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    if (!controlsEnabled && !gamePaused && !gameOver) {
      console.log("Game active but controls disabled - enabling controls");
      setControlsEnabled(true);
    }

    // Always clear the existing timer before setting a new one
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Don't set up the timer if the grid isn't initialized
    if (!grid || grid.length === 0) {
      console.log("Grid not initialized yet, delaying gravity timer setup");
      return;
    }

    if (!currentBlock?.shape) {
      console.log("No active block yet, delaying gravity timer setup");
      return;
    }

    // Setup the gravity timer to automatically move blocks down
    const dropSpeed = getDropSpeed();
    console.log(`Setting up gravity timer with dropSpeed: ${dropSpeed}ms, controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
    
    gravityTimerRef.current = window.setInterval(() => {
      if (!gamePaused && !gameOver && controlsEnabled) {
        console.log("Gravity timer triggered - moving block down");
        const moved = moveBlock('down');
        if (!moved) {
          console.log("Block can't move down further, dropping it");
          dropBlock();
        }
      }
    }, dropSpeed);

    return () => {
      console.log("Cleaning up gravity timer");
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [
    gamePaused, 
    gameOver, 
    level, 
    moveBlock, 
    dropBlock, 
    getDropSpeed, 
    controlsEnabled, 
    setControlsEnabled, 
    timerActive, 
    grid,
    currentBlock?.shape,
    gravityTimerRef
  ]);
}
