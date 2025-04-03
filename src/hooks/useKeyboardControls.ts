
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
      if (["Enter", "Escape", "p", "P"].includes(event.key)) {
        console.log("Game control key pressed, ignoring to prevent affecting game state");
        return;
      }
      
      if (gamePaused || !controlsEnabled) {
        console.log("🔒 Game is paused or controls disabled");
        return;
      }

      console.log(`🕹️ Processing key: ${event.key}`);
      
      try {
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
          default:
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
