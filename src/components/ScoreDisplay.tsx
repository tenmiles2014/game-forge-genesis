
import React, { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  linesCleared: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, linesCleared }) => {
  const [animate, setAnimate] = useState(false);
  const [lastLinesCleared, setLastLinesCleared] = useState(0);
  const [recentlyCleared, setRecentlyCleared] = useState(0);
  
  useEffect(() => {
    // Only animate when new lines are cleared
    if (linesCleared > lastLinesCleared) {
      const clearedNow = linesCleared - lastLinesCleared;
      setRecentlyCleared(clearedNow);
      setLastLinesCleared(linesCleared);
      setAnimate(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [linesCleared, lastLinesCleared]);
  
  return (
    <div className="game-score px-8 py-4 rounded-lg animate-fade-in">
      <div className="text-center">
        <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-1">SCORE</h3>
        <p className={`text-4xl font-bold text-white ${animate ? 'animate-scale-in' : ''}`}>{score}</p>
        
        {animate && recentlyCleared > 0 && (
          <div className="mt-2 animate-fade-in">
            <p className={`text-sm font-medium ${getLinesClearedColor(recentlyCleared)}`}>
              +{recentlyCleared} LINES CLEARED!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine the color based on number of lines cleared
const getLinesClearedColor = (count: number): string => {
  if (count >= 4) return "text-purple-400";
  if (count >= 3) return "text-green-400";
  if (count >= 2) return "text-yellow-400";
  return "text-blue-400";
};

export default ScoreDisplay;
