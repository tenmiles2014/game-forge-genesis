
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad, RotateCcw, RotateCw, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControls3DProps {
  onRotate: (axis: 'x' | 'y' | 'z') => void;
  onMove: (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => void;
  onDrop: () => void;
  onReset: () => void;
  className?: string;
}

const GameControls3D: React.FC<GameControls3DProps> = ({ 
  onRotate, 
  onMove, 
  onDrop, 
  onReset,
  className 
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('left')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('forward')}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('right')}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="col-start-1 col-span-1"></div>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('backward')}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onMove('down')}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onRotate('z')}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 aspect-square"
          onClick={() => onRotate('x')}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button 
          variant="outline"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={onDrop}
        >
          <ArrowDown className="h-5 w-5 mr-1" />
          Drop
        </Button>
        <Button 
          variant="outline"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={onReset}
        >
          <Gamepad className="h-5 w-5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default GameControls3D;
