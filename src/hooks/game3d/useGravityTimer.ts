
import { useEffect } from 'react';

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
}) {
  useEffect(() => {
    console.log("🎮 Gravity Timer Setup");
    console.log("Game State:", {
      paused: gamePaused,
      over: gameOver,
      controlsEnabled,
      blockExists: !!currentBlock?.shape
    });

    // Always reset controls
    if (!controlsEnabled) {
      console.log("🔓 Force Enabling Controls");
      setControlsEnabled(true);
    }

    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }

    if (gamePaused || gameOver || !currentBlock?.shape) {
      console.log("⏸️ Timer Paused or No Block");
      return;
    }

    const dropSpeed = getDropSpeed();
    console.log(`⏱️ Drop Speed: ${dropSpeed}ms`);

    gravityTimerRef.current = window.setInterval(() => {
      console.log("⬇️ Attempting Downward Movement");
      const moved = moveBlock('down');

      console.log("Movement Result:", moved ? "Moved" : "Cannot Move");

      if (!moved) {
        console.log("🧱 Dropping Block");
        dropBlock();
      }
    }, dropSpeed);

    return () => {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [
    gamePaused, 
    gameOver, 
    controlsEnabled, 
    currentBlock,
    moveBlock, 
    dropBlock, 
    gravityTimerRef, 
    getDropSpeed, 
    setControlsEnabled
  ]);
}
