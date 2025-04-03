
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
    console.log(`🎮 Setting up keyboard controls:
      - Controls Enabled: ${controlsEnabled}
      - Game Paused: ${gamePaused}`);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip all gamepad-related keys entirely to avoid affecting game state
      if (["Enter", "Escape", "p", "P"].includes(event.key)) {
        console.log("Game control key pressed, ignoring to prevent affecting game state");
        return;
      }
      
      // Skip processing if game is paused or controls disabled
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
            event.preventDefault();
            moveBlock('left');
            break;
          case 'ArrowRight':
            console.log("Moving right");
            event.preventDefault();
            moveBlock('right');
            break;
          case 'ArrowUp':
            console.log("Moving forward");
            event.preventDefault();
            moveBlock('forward');
            break;
          case 'ArrowDown':
            console.log("Moving backward");
            event.preventDefault();
            moveBlock('backward');
            break;
          case ' ':
            console.log("Dropping block");
            event.preventDefault();
            dropBlock();
            break;
          case 'z':
            console.log("Rotating around z-axis");
            event.preventDefault();
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
            event.preventDefault();
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
            event.preventDefault();
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
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
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
