
import React from 'react';

interface GameFooterProps {
  gameOver: boolean;
  score: number;
  level: number;
}

const GameFooter: React.FC<GameFooterProps> = ({ gameOver, score, level }) => {
  if (!gameOver) return null;
  
  return (
    <div className="mt-6 animate-scale-in">
      <p className="text-xl text-white mb-3">Game Over! Final Score: {score} | Level: {level}</p>
    </div>
  );
};

export default GameFooter;
