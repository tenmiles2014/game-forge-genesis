
import React from 'react';

export interface LevelDisplayProps {
  level: number;
  maxLevel?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel = 99 }) => {
  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Level</h3>
      <div className="text-3xl font-bold text-white flex justify-between items-baseline">
        <span className="text-white">{level}</span>
        {maxLevel && <span className="text-sm text-gray-400">/ {maxLevel}</span>}
      </div>
    </div>
  );
};

export default LevelDisplay;
