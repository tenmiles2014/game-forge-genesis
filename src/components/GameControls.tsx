
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, RotateCcw, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  onRotate: () => void;
  onMove: (direction: 'left' | 'right' | 'down') => void;
  onDrop: () => void;
  onReset: () => void;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onRotate, 
  onMove, 
  onDrop, 
  onReset,
  className 
}) => {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('left')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('down')}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('right')}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={onRotate}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Rotate
        </Button>
        <Button 
          variant="outline"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={onDrop}
        >
          <ArrowDown className="h-5 w-5 mr-2" />
          Drop
        </Button>
      </div>
      
      <Button 
        variant="outline"
        className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 mt-4"
        onClick={onReset}
      >
        <Gamepad className="h-5 w-5 mr-2" />
        New Game
      </Button>
    </div>
  );
};

export default GameControls;
