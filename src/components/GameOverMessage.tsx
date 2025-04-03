
import React from 'react';

interface GameOverMessageProps {
  gameOver: boolean;
  score: number;
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({ gameOver, score }) => {
  if (!gameOver) return null;
  
  return (
    <div className="mt-6 animate-scale-in">
      <p className="text-xl text-white mb-3">Game Over! Final score: {score}</p>
    </div>
  );
};

export default GameOverMessage;
