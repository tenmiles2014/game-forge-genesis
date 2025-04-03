
import React from 'react';
import { Card } from '@/components/ui/card';
import GameControls3D from '../GameControls3D';
import { BlockPattern } from '../BlockPatterns';
import GameStatusDisplay from './GameStatusDisplay';
import GameTimer from '../GameTimer';

interface GameControlPanelProps {
  score: number;
  level: number;
  maxLevel: number;
  linesCleared: number;
  nextBlock: BlockPattern;
  timerActive: boolean;
  timeLimit: number;
  onTimeUp: () => void;
  onReset: () => void;
  onStartPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

const GameControlPanel: React.FC<GameControlPanelProps> = ({
  score,
  level,
  maxLevel,
  linesCleared,
  nextBlock,
  timerActive,
  timeLimit,
  onTimeUp,
  onReset,
  onStartPause,
  isPaused,
  gameOver
}) => {
  return (
    <div className="w-full md:w-72 lg:w-80 space-y-4">
      <GameStatusDisplay
        score={score}
        level={level}
        maxLevel={maxLevel}
        linesCleared={linesCleared}
      />
      
      <Card className="bg-black/30 border-gray-800 p-4">
        <GameTimer
          active={timerActive}
          timeLimit={timeLimit}
          onTimeUp={onTimeUp}
        />
      </Card>
      
      <GameControls3D
        onReset={onReset}
        onStartPause={onStartPause}
        isPaused={isPaused}
        gameOver={gameOver}
        className="mt-4"
      />
    </div>
  );
};

export default GameControlPanel;
