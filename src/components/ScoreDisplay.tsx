
import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="p-3 rounded-lg bg-black bg-opacity-30 text-center h-full">
      <h3 className="text-xs sm:text-sm uppercase tracking-wide font-medium text-gray-300 mb-1 sm:mb-2">SCORE</h3>
      <div className="text-xl sm:text-2xl font-bold text-white">{score}</div>
    </div>
  );
};

export default ScoreDisplay;
