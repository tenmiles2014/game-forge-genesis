
import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30 text-center">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">SCORE</h3>
      <div className="text-2xl font-bold text-white">{score}</div>
    </div>
  );
};

export default ScoreDisplay;
