
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, Play, RotateCw } from 'lucide-react';

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
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <Button 
        variant="outline"
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 w-full"
        onClick={onStartPause}
        disabled={gameOver}
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
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 w-full"
        onClick={onReset}
      >
        <Gamepad className="h-5 w-5 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default GameControls3D;
