
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GameStatusDisplayProps {
  score: number;
  level: number;
  maxLevel: number;
  linesCleared: number;
}

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
  score,
  level,
  maxLevel,
  linesCleared
}) => {
  // Calculate level progress as a percentage
  const levelProgress = (level / maxLevel) * 100;
  
  return (
    <Card className="bg-black/30 border-gray-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <h3 className="text-lg font-semibold text-white">Game Status</h3>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Score</p>
            <p className="text-xl font-bold text-white">{score}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Lines</p>
            <p className="text-xl font-bold text-white">{linesCleared}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Level</span>
            <span className="text-white">{level} / {maxLevel}</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStatusDisplay;
