
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Layers, SquareCheck, SquareDot, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LevelDisplayProps {
  level: number;
  maxLevel: number;
  layersCleared?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel, layersCleared = 0 }) => {
  // Use tier-based system
  const tier = Math.ceil(level / 2);
  
  // Calculate layer requirements based on tiers
  const maxSimultaneousLayers = Math.min(5, level + 1);
  const isHighTier = level >= 5;
  
  // For high tiers, we track cumulative layers per tier
  const tierLayerTarget = isHighTier ? 20 : 0;
  const tierLayersCleared = isHighTier ? (layersCleared % tierLayerTarget) : 0;
  const tierLayersRemaining = isHighTier ? (tierLayerTarget - tierLayersCleared) : 0;
  
  // Game mechanics calculations
  const nextLevelBonus = (level + 1) * 100;
  const dropSpeed = Math.max(100, 1000 - (level * 50));
  const scoreMultiplier = (1 + (level * 0.1)).toFixed(1);
  
  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Level</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-white">{level}</span>
        <span className="text-sm text-gray-400">/ {maxLevel}</span>
      </div>
      
      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${(level / maxLevel) * 100}%` }}
        />
      </div>
      
      <div className="mt-3 flex items-center text-xs text-cyan-400">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1">
              <ChevronDown className="h-4 w-4" />
              <span className="font-medium">{dropSpeed}ms</span> drop speed
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200">
            <p>Current block drop speed: {dropSpeed}ms</p>
            <p className="text-xs text-gray-400 mt-1">Decreases by 50ms each level</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
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
              
              {!isHighTier ? (
                <p>To advance to level {level + 1}, you need to clear <strong>{maxSimultaneousLayers}</strong> layers simultaneously in a single move.</p>
              ) : (
                <>
                  <p>To advance to level {level + 1}, you need to clear <strong>{tierLayersRemaining}</strong> more layers in tier {tier}.</p>
                  <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${(tierLayersCleared / tierLayerTarget) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Tier {tier} progress: {tierLayersCleared}/{tierLayerTarget} layers</p>
                </>
              )}
              
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
                  <span>Current level multiplier: x{scoreMultiplier}</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-700">
                <h4 className="font-medium text-white mb-1">Difficulty Progression</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Drop speed: {dropSpeed}ms (decreases by 50ms per level)</li>
                  <li>• Score multiplier: x{scoreMultiplier} (increases by 0.1x per level)</li>
                  {!isHighTier ? (
                    <li>• Simultaneous layers needed: {maxSimultaneousLayers} (increases by 1 per level, max 5)</li>
                  ) : (
                    <li>• Layers to clear per tier: 20 (resets each tier, tier = 2 levels)</li>
                  )}
                </ul>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-700">
                <h4 className="font-medium text-white mb-1">Rules Change at Level 5</h4>
                <p className="text-xs">
                  Levels 1-4: Clear increasingly more layers simultaneously.<br/>
                  Levels 5+: Clear 20 total layers per tier, with maximum simultaneous requirement capped at 5.
                </p>
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
                {!isHighTier ? (
                  <span><span className="font-medium">{maxSimultaneousLayers}</span> layers simultaneously</span>
                ) : (
                  <span><span className="font-medium">{tierLayersRemaining}</span> more layers in tier {tier}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-gray-800 border-gray-700 text-gray-200">
              {!isHighTier ? (
                <p>You need to clear <strong>{maxSimultaneousLayers}</strong> layers simultaneously in a single move.</p>
              ) : (
                <>
                  <p>You need to clear <strong>{tierLayersRemaining}</strong> more layers to complete tier {tier}.</p>
                  <p className="text-xs text-gray-400 mt-1">Progress: {tierLayersCleared}/{tierLayerTarget} layers</p>
                </>
              )}
              <div className="mt-1 text-xs text-gray-400">
                <p>Game gets harder with each level:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Blocks fall faster</li>
                  {!isHighTier && <li>More simultaneous layers needed (max 5)</li>}
                  {isHighTier && <li>20 total layers needed per tier</li>}
                  <li>Score multiplier increases</li>
                </ul>
              </div>
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
