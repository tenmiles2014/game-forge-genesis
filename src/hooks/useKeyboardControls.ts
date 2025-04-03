
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
      // Skip all gamepad-related keys entirely to avoid affecting game state
      if (["Enter", "Escape", "p", "P"].includes(event.key)) {
        console.log("Game control key pressed, ignoring to prevent affecting game state");
        return;
      }
      
      // Check game state before responding to movement keys
      if (gamePaused) {
        console.log("🔒 Game is paused - movement keys disabled");
        return;
      }
      
      if (!controlsEnabled) {
        console.log("🔒 Controls are disabled - movement keys disabled");
        return;
      }

      console.log(`🕹️ Processing key: ${event.key}`);
      
      try {
        // Only handle defined movement keys
        switch (event.key) {
          case 'ArrowLeft':
            console.log("Moving left");
            moveBlock('left');
            break;
          case 'ArrowRight':
            console.log("Moving right");
            moveBlock('right');
            break;
          case 'ArrowUp':
            console.log("Moving forward");
            moveBlock('forward');
            break;
          case 'ArrowDown':
            console.log("Moving backward");
            moveBlock('backward');
            break;
          case ' ':
            console.log("Dropping block");
            dropBlock();
            break;
          case 'z':
            console.log("Rotating around z-axis");
            const rotatedZ = rotateBlock('z');
            if (rotatedZ) {
              setCurrentBlock({
                ...currentBlock,
                shape: rotatedZ
              });
            }
            break;
          case 'x':
            console.log("Rotating around x-axis");
            const rotatedX = rotateBlock('x');
            if (rotatedX) {
              setCurrentBlock({
                ...currentBlock,
                shape: rotatedX
              });
            }
            break;
          case 's':
            console.log("Moving down");
            moveBlock('down');
            break;
          default:
            // Ignore other keys
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
