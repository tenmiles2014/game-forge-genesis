
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  linesCleared?: number;
  levelBonus?: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  linesCleared = 0,
  levelBonus = 0
}) => {
  return (
    <div className="game-score px-8 py-4 rounded-lg animate-fade-in">
      <div className="text-center">
        <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-1">SCORE</h3>
        <p className="text-4xl font-bold text-white">{score}</p>
        <div className="mt-2 text-sm text-gray-300">
          <span className="font-medium">{linesCleared}</span> lines cleared
        </div>
        {levelBonus > 0 && (
          <div className="mt-1 text-xs text-emerald-400">
            +<span className="font-medium">{levelBonus}</span> level bonus
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;
