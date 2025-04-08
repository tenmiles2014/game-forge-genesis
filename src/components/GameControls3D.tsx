
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, Play, RotateCw, Maximize, Minimize } from 'lucide-react';

interface GameControls3DProps {
  onReset: () => void;
  onStartPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
  className?: string;
}

const GameControls3D: React.FC<GameControls3DProps> = ({ 
  onReset,
  onStartPause,
  isPaused,
  gameOver,
  className 
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }
  }, []);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="outline"
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
        onClick={onStartPause}
        disabled={gameOver}
        autoFocus={false}
      >
        {isPaused ? (
          <>
            <Play className="h-5 w-5 mr-2" />
            Start
          </>
        ) : (
          <>
            <RotateCw className="h-5 w-5 mr-2" />
            Pause
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
        onClick={onReset}
      >
        <Gamepad className="h-5 w-5 mr-2" />
        Reset
      </Button>

      <Button 
        variant="outline"
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
        onClick={toggleFullScreen}
      >
        {isFullScreen ? (
          <>
            <Minimize className="h-5 w-5 mr-2" />
            Exit
          </>
        ) : (
          <>
            <Maximize className="h-5 w-5 mr-2" />
            Full
          </>
        )}
      </Button>
    </div>
  );
};

export default GameControls3D;
