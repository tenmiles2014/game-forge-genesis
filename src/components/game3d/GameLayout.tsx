
import React from 'react';
import GameHeader from './GameHeader';
import GameSidebar from './GameSidebar';
import GameContainer from './GameContainer';
import GameOverlay from './GameOverlay';
import GameFooter from './GameFooter';
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
    <div className="game-container rounded-lg overflow-hidden w-full max-w-[1400px] flex flex-col md:flex-row gap-4 bg-black bg-opacity-30">
      <div className="flex-1 min-h-[550px] md:min-h-[650px]">
        <GameHeader viewPoints={viewPoints} onSelectView={onSelectView} />
        
        <GameContainer 
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
        
        <GameOverlay />
      </div>
      
      <GameSidebar
        score={score}
        linesCleared={linesCleared}
        level={level}
        maxLevel={maxLevel}
        timerActive={timerActive}
        onTimeUp={onTimeUp}
        timeLimit={timeLimit}
        nextBlock={nextBlock}
        onReset={onReset}
        onStartPause={onStartPause}
        isPaused={isPaused}
        gameOver={gameOver}
      />
    </div>
  );
};

export default GameLayout;
