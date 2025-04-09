
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, Play, Pause } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex gap-1 md:gap-2 ${className}`}>
      <Button 
        variant="outline"
        size={isMobile ? "sm" : "default"}
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 touch-feedback"
        onClick={onStartPause}
        disabled={gameOver}
      >
        {isPaused ? (
          <>
            <Play className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">{isMobile ? "Play" : "Start Game"}</span>
          </>
        ) : (
          <>
            <Pause className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">{isMobile ? "Pause" : "Pause Game"}</span>
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        size={isMobile ? "sm" : "default"}
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 touch-feedback"
        onClick={onReset}
      >
        <Gamepad className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        <span className="text-xs md:text-sm">{isMobile ? "New" : "New Game"}</span>
      </Button>
    </div>
  );
};

export default GameControls3D;
