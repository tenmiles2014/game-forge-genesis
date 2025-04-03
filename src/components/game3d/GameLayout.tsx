
import React from 'react';
import GameMainContent from './GameMainContent';
import GameControlPanel from './GameControlPanel';
import ViewControls from './ViewControls';
import { ViewPoint } from '../ViewControls';
import { BlockPattern } from '../BlockPatterns';

interface GameLayoutProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
  nextBlock: BlockPattern;
  score: number;
  level: number;
  maxLevel: number;
  timerActive: boolean;
  timeLimit: number;
  isPaused: boolean;
  gameOver: boolean;
  controlsEnabled: boolean;
  viewPoints: ViewPoint[];
  currentView: ViewPoint;
  orbitControlsRef: React.RefObject<any>;
  onSelectView: (viewPoint: ViewPoint) => void;
  onTimeUp: () => void;
  onReset: () => void;
  onStartPause: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({ 
  grid,
  currentBlock,
  position,
  linesCleared,
  nextBlock,
  score,
  level,
  maxLevel,
  timerActive,
  timeLimit,
  isPaused,
  gameOver,
  controlsEnabled,
  viewPoints,
  currentView,
  orbitControlsRef,
  onSelectView,
  onTimeUp,
  onReset,
  onStartPause
}) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex-1 space-y-4">
          <div className="flex justify-center mb-4">
            <ViewControls
              viewPoints={viewPoints}
              currentView={currentView}
              orbitControlsRef={orbitControlsRef}
              onSelectView={onSelectView}
            />
          </div>
          
          <GameMainContent
            grid={grid}
            currentBlock={currentBlock}
            position={position}
            linesCleared={linesCleared}
            controlsEnabled={controlsEnabled}
            currentView={currentView}
            orbitControlsRef={orbitControlsRef}
            gamePaused={isPaused}
            gameOver={gameOver}
          />
        </div>
        
        <GameControlPanel
          score={score}
          level={level}
          maxLevel={maxLevel}
          linesCleared={linesCleared}
          nextBlock={nextBlock}
          timerActive={timerActive}
          timeLimit={timeLimit}
          onTimeUp={onTimeUp}
          onReset={onReset}
          onStartPause={onStartPause}
          isPaused={isPaused}
          gameOver={gameOver}
        />
      </div>
    </div>
  );
};

export default GameLayout;

