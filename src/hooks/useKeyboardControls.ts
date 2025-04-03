
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
      
      // More verbose check
      if (gamePaused) {
        console.warn('⛔ Game is paused, blocking key events');
        toast({
          title: "Game Paused",
          description: "Unpause the game to move blocks"
        });
        return;
      }
      
      if (!controlsEnabled) {
        console.warn('⛔ Controls are not enabled');
        toast({
          title: "Controls Disabled",
          description: "Wait for game to initialize"
        });
        return;
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
        toast({
          title: "Movement Error",
          description: "Unable to move block"
        });
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

