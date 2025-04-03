
import { useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface KeyboardControlsProps {
  moveBlock: (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => boolean;
  rotateBlock: (axis: 'x' | 'y' | 'z') => number[][] | null;
  dropBlock: () => void;
  controlsEnabled: boolean;
  gamePaused: boolean;
  setCurrentBlock: (block: any) => void;
  currentBlock: any;
}

export function useKeyboardControls({
  moveBlock,
  rotateBlock, 
  dropBlock,
  controlsEnabled,
  gamePaused,
  setCurrentBlock,
  currentBlock
}: KeyboardControlsProps) {
  useEffect(() => {
    console.log(`🎮 Keyboard Controls Status:
      - Controls Enabled: ${controlsEnabled}
      - Game Paused: ${gamePaused}`);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`🕹️ Key Pressed: ${event.key}`);
      
      // Make sure gameplay keys don't affect game pause state
      if (["Enter", "Escape", "p", "P"].includes(event.key)) {
        console.log("Game control key pressed, but ignored to prevent affecting game state");
        return;
      }
      
      // More verbose check
      if (gamePaused) {
        console.warn('⛔ Game is paused, blocking key events');
        return; // Don't show toast on every key press when paused
      }
      
      if (!controlsEnabled) {
        console.warn('⛔ Controls are not enabled');
        return; // Don't show toast when controls disabled
      }

      try {
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
          case ' ':
            dropBlock();
            break;
          case 'z':
            const rotatedZ = rotateBlock('z');
            if (rotatedZ) {
              setCurrentBlock({
                ...currentBlock,
                shape: rotatedZ
              });
            }
            break;
          case 'x':
            const rotatedX = rotateBlock('x');
            if (rotatedX) {
              setCurrentBlock({
                ...currentBlock,
                shape: rotatedX
              });
            }
            break;
          case 's':
            moveBlock('down');
            break;
        }
      } catch (error) {
        console.error('❌ Block movement error:', error);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    moveBlock, 
    rotateBlock, 
    dropBlock, 
    controlsEnabled, 
    gamePaused, 
    currentBlock, 
    setCurrentBlock
  ]);
}
