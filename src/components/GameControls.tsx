
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, Play, Pause } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onStartPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({ 
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
        className="w-full bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
        onClick={onStartPause}
        disabled={gameOver}
      >
        {isPaused ? (
          <>
            <Play className="h-5 w-5 mr-2" />
            Start Game
          </>
        ) : (
          <>
            <Pause className="h-5 w-5 mr-2" />
            Pause Game
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        className="w-full bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
        onClick={onReset}
      >
        <Gamepad className="h-5 w-5 mr-2" />
        New Game
      </Button>
    </div>
  );
};

export default GameControls;
