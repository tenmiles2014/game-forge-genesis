
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Layers, SquareCheck, SquareDot } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LevelDisplayProps {
  level: number;
  maxLevel: number;
  layersCleared?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel, layersCleared = 0 }) => {
  // Change the calculation: each level tier plus 1 only
  const layerThreshold = level + 1;
  const remainingLayers = Math.max(0, layerThreshold - (layersCleared % layerThreshold));
  const nextLevelBonus = (level + 1) * 100;
  
  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Level</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-white">{level}</span>
        <span className="text-sm text-gray-400">/ {maxLevel}</span>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${(level / maxLevel) * 100}%` }}
        />
      </div>
      
      {/* Level upgrade criteria with tooltips */}
      <div className="mt-2 text-xs text-gray-300">
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-black hover:bg-opacity-30">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="font-medium">Level Up Criteria</span>
              <InfoIcon className="h-3 w-3 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-gray-200">
            <div className="space-y-3">
              <h4 className="font-medium text-white">Level {level} Requirements</h4>
              <p>To advance to level {level + 1}, you need to clear <strong>{layerThreshold}</strong> layers simultaneously in a single move.</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SquareCheck className="h-4 w-4 text-green-400" />
                  <span>Complete rows (all blocks in a row)</span>
                </div>
                <div className="flex items-center gap-2">
                  <SquareCheck className="h-4 w-4 text-green-400" />
                  <span>Complete columns (all blocks in a column)</span>
                </div>
                <div className="flex items-center gap-2">
                  <SquareCheck className="h-4 w-4 text-green-400" />
                  <span>Complete layers (all blocks in a horizontal layer)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <SquareDot className="h-4 w-4 text-blue-400" />
                  <span>Current level multiplier: x{(1 + (level * 0.1)).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center text-xs">
                <Layers className="h-4 w-4 mr-1 text-blue-400" />
                <span className="font-medium">{layerThreshold}</span> {/* Added whitespace here */} layers needed
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-gray-800 border-gray-700 text-gray-200">
              <p>You need to clear <strong>{layerThreshold}</strong> layers simultaneously in a single move.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="mt-1 text-xs text-emerald-400">
        Next level bonus: +<span className="font-medium">{nextLevelBonus}</span> points
      </div>
    </div>
  );
};

export default LevelDisplay;
