
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, ChevronDown } from 'lucide-react';

interface MobileControlsOverlayProps {
  onMove: (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => void;
  onRotate: () => void;
  onDrop: () => void;
  className?: string;
}

const MobileControlsOverlay: React.FC<MobileControlsOverlayProps> = ({
  onMove,
  onRotate,
  onDrop,
  className
}) => {
  return (
    <div className={`fixed bottom-4 left-0 right-0 flex justify-between items-center px-4 pointer-events-none ${className}`}>
      {/* D-Pad for movement */}
      <div className="d-pad grid grid-cols-3 grid-rows-3 gap-1 pointer-events-auto">
        <div className="col-start-1 col-end-2 row-start-1 row-end-2"></div>
        <button 
          className="col-start-2 col-end-3 row-start-1 row-end-2 bg-blue-500 bg-opacity-70 rounded-full p-2 flex items-center justify-center active:bg-blue-700 touch-feedback"
          onClick={() => onMove('forward')}
          aria-label="Move Forward"
        >
          <ArrowUp className="h-5 w-5 text-white" />
        </button>
        <div className="col-start-3 col-end-4 row-start-1 row-end-2"></div>
        
        <button 
          className="col-start-1 col-end-2 row-start-2 row-end-3 bg-blue-500 bg-opacity-70 rounded-full p-2 flex items-center justify-center active:bg-blue-700 touch-feedback"
          onClick={() => onMove('left')}
          aria-label="Move Left"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 bg-blue-500 bg-opacity-40 rounded-full"></div>
        <button 
          className="col-start-3 col-end-4 row-start-2 row-end-3 bg-blue-500 bg-opacity-70 rounded-full p-2 flex items-center justify-center active:bg-blue-700 touch-feedback"
          onClick={() => onMove('right')}
          aria-label="Move Right"
        >
          <ArrowRight className="h-5 w-5 text-white" />
        </button>
        
        <div className="col-start-1 col-end-2 row-start-3 row-end-4"></div>
        <button 
          className="col-start-2 col-end-3 row-start-3 row-end-4 bg-blue-500 bg-opacity-70 rounded-full p-2 flex items-center justify-center active:bg-blue-700 touch-feedback"
          onClick={() => onMove('backward')}
          aria-label="Move Backward"
        >
          <ArrowDown className="h-5 w-5 text-white" />
        </button>
        <div className="col-start-3 col-end-4 row-start-3 row-end-4"></div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 pointer-events-auto">
        <button 
          className="bg-purple-500 bg-opacity-70 rounded-full p-3 flex items-center justify-center active:bg-purple-700 touch-feedback"
          onClick={onRotate}
          aria-label="Rotate Block"
        >
          <RotateCcw className="h-6 w-6 text-white" />
        </button>
        <button 
          className="bg-green-500 bg-opacity-70 rounded-full p-3 flex items-center justify-center active:bg-green-700 touch-feedback"
          onClick={onDrop}
          aria-label="Drop Block"
        >
          <ChevronDown className="h-7 w-7 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MobileControlsOverlay;
