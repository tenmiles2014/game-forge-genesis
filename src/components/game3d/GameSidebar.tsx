
import React from 'react';
import ScoreDisplay from '../ScoreDisplay';
import LevelDisplay from '../LevelDisplay';
import GameTimer from '../GameTimer';
import BlockPreview from '../BlockPreview';
import GameControls3D from '../GameControls3D';
import { BlockPattern } from '../BlockPatterns';

interface GameSidebarProps {
  score: number;
  linesCleared: number;
  level: number;
  maxLevel: number;
  timerActive: boolean;
  onTimeUp: () => void;
  timeLimit: number;
  nextBlock: BlockPattern;
  onReset: () => void;
  onStartPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  score,
  linesCleared,
  level,
  maxLevel,
  timerActive,
  onTimeUp,
  timeLimit,
  nextBlock,
  onReset,
  onStartPause,
  isPaused,
  gameOver
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 w-full md:w-64 p-4">
      <div className="space-y-4">
        <ScoreDisplay score={score} linesCleared={linesCleared} />
        
        <LevelDisplay level={level} maxLevel={maxLevel} />
        
        <GameTimer 
          isActive={timerActive} 
          onTimeUp={onTimeUp} 
          timeLimit={timeLimit} 
          level={level}
        />
        
        <div className="p-4 rounded-lg bg-black bg-opacity-30">
          <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-4">Next Block</h3>
          <div className="flex justify-center">
            <BlockPreview block={nextBlock} className="w-24 h-24" />
          </div>
        </div>
      </div>
      
      <GameControls3D 
        onReset={onReset}
        onStartPause={onStartPause}
        isPaused={isPaused}
        gameOver={gameOver}
      />
    </div>
  );
};

export default GameSidebar;
