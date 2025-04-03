
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, GithubIcon, HelpCircleIcon } from 'lucide-react';

interface GameFooterProps {
  gameOver: boolean;
  score: number;
  level: number;
}

const GameFooter: React.FC<GameFooterProps> = ({ gameOver, score, level }) => {
  return (
    <footer className="w-full mt-6 py-4 px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        <Badge variant="outline" className="bg-black/30 border-gray-700 px-3 py-1">
          <InfoIcon className="w-4 h-4 mr-1" />
          {gameOver ? 'Game Over' : 'Press arrow keys to move blocks'}
        </Badge>
        
        {gameOver && (
          <Badge variant="outline" className="bg-black/30 border-gray-700 px-3 py-1">
            Final Score: {score} | Level: {level}
          </Badge>
        )}
      </div>
      
      <div className="flex gap-4">
        <a
          href="https://github.com/username/blockbusters3d"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="GitHub repository"
        >
          <GithubIcon className="w-5 h-5" />
        </a>
        
        <button
          className="text-gray-400 hover:text-white transition-colors"
          onClick={() => {
            // Show help or instructions
            alert('Use arrow keys to move, Z/X to rotate, and Space to drop blocks quickly.');
          }}
          aria-label="Help"
        >
          <HelpCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};

export default GameFooter;
