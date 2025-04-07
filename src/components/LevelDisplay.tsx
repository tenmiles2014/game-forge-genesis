
import React from 'react';

interface LevelDisplayProps {
  level: number;
  maxLevel: number;
  layersCleared?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel, layersCleared = 0 }) => {
  const layerThreshold = Math.ceil(level / 5) + 1;
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
      
      {/* Next level info */}
      <div className="mt-2 text-xs text-gray-300">
        <span className="font-medium">{remainingLayers}</span> more layers to level up
      </div>
      <div className="mt-1 text-xs text-emerald-400">
        Next level bonus: +<span className="font-medium">{nextLevelBonus}</span> points
      </div>
    </div>
  );
};

export default LevelDisplay;
