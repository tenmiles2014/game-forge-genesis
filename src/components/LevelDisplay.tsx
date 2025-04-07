
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Layers } from 'lucide-react';

interface LevelDisplayProps {
  level: number;
  maxLevel: number;
  layersCleared?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel, layersCleared = 0 }) => {
  // Use 2 layers as the threshold consistently
  const layerThreshold = Math.ceil(level / 5) + 2;
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
      
      {/* Next level info with tooltip */}
      <div className="mt-2 text-xs text-gray-300 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center">
                <Layers className="h-4 w-4 mr-1 text-blue-400" />
                <span className="font-medium">{layerThreshold}</span> layers simultaneously
                <InfoIcon className="h-3 w-3 ml-1 text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-gray-800 border-gray-700 text-gray-200">
              <p>You need to clear <strong>{layerThreshold}</strong> layers at the same time to level up. 
              This can be rows, columns, or complete layers that are cleared in a single move.</p>
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
