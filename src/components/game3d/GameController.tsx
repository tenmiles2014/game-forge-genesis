
import React, { useState } from 'react';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { VIEW_POINTS } from './GameViewManager';
import GameLayout from './GameLayout';
import { useGameController } from '../../hooks/game3d/useGameController';

const GameController: React.FC = () => {
  const [currentView, setCurrentView] = useState(VIEW_POINTS[0]);
  
  const {
    grid,
    currentBlock,
    nextBlock,
    position,
    linesCleared,
    score,
    level,
    MAX_LEVEL,
    timerActive,
    timeLimit,
    gamePaused,
    gameOver,
    controlsEnabled,
    orbitControlsRef,
    handleTimeUp,
    resetGame,
    startGame,
    toggleGamePause,
    setCurrentBlock
  } = useGameController();

  // Connect keyboard controls
  useKeyboardControls({
    moveBlock: () => false, // Controller doesn't directly handle movement
    rotateBlock: () => null,
    dropBlock: () => {},
    controlsEnabled,
    gamePaused,
    setCurrentBlock,
    currentBlock
  });

  // Handle view selection
  const handleViewSelection = (viewPoint: any) => {
    setCurrentView(viewPoint);
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      
      if (controls.object) {
        controls.object.position.set(...viewPoint.position);
        
        if (viewPoint.target) {
          controls.target.set(...viewPoint.target);
        } else {
          controls.target.set(4.5, 4.5, 4.5);
        }
        
        controls.update();
      }
    }
  };

  // Handle game actions
  const handleGameAction = gamePaused ? startGame : toggleGamePause;

  return (
    <GameLayout
      grid={grid}
      currentBlock={currentBlock}
      position={position}
      linesCleared={linesCleared}
      nextBlock={nextBlock}
      score={score}
      level={level}
      maxLevel={MAX_LEVEL}
      timerActive={timerActive}
      timeLimit={timeLimit}
      isPaused={gamePaused}
      gameOver={gameOver}
      controlsEnabled={controlsEnabled}
      viewPoints={VIEW_POINTS}
      currentView={currentView}
      orbitControlsRef={orbitControlsRef}
      onSelectView={handleViewSelection}
      onTimeUp={handleTimeUp}
      onReset={resetGame}
      onStartPause={handleGameAction}
    />
  );
};

export default GameController;
