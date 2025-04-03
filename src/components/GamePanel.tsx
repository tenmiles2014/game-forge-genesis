
import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import BlockPreview from './BlockPreview';
import GameControls from './GameControls';
import { BlockPattern } from './BlockPatterns';

interface GamePanelProps {
  score: number;
  linesCleared: number;
  nextBlock: BlockPattern;
  onReset: () => void;
  onStartPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

const GamePanel: React.FC<GamePanelProps> = ({
  score,
  linesCleared,
  nextBlock,
  onReset,
  onStartPause,
  isPaused,
  gameOver,
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 w-full md:w-60">
      <div className="space-y-6">
        <ScoreDisplay score={score} linesCleared={linesCleared} />
        
        <div className="p-4 rounded-lg bg-black bg-opacity-30">
          <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
          <div className="flex justify-center">
            <BlockPreview block={nextBlock} className="w-24 h-24" />
          </div>
        </div>
      </div>
      
      <GameControls 
        onReset={onReset}
        onStartPause={onStartPause}
        isPaused={isPaused}
        gameOver={gameOver}
      />
    </div>
  );
};

export default GamePanel;
