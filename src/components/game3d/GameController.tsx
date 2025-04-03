
import React, { useRef } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import { useGameActions } from '../../hooks/useGameActions';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { VIEW_POINTS } from './GameViewManager';
import GameLayout from './GameLayout';

// Define the BlockPattern type
interface BlockPattern {
  shape: number[][];
  color: string;
}

// Define a set of block patterns
const BLOCK_PATTERNS = [
  { shape: [[1, 1, 1, 1]], color: 'blue' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'red' },
  { shape: [[1, 1], [1, 1]], color: 'yellow' }
];

// Define the getRandomBlockPattern function
function getRandomBlockPattern(): BlockPattern {
  const randomIndex = Math.floor(Math.random() * BLOCK_PATTERNS.length);
  return BLOCK_PATTERNS[randomIndex];
}

const GameController: React.FC = () => {
  const {
    grid, setGrid,
    score, setScore,
    currentBlock, setCurrentBlock,
    nextBlock, setNextBlock,
    position, setPosition,
    gameOver, setGameOver,
    controlsEnabled, setControlsEnabled,
    level, setLevel,
    timeLimit, setTimeLimit,
    timerActive, setTimerActive,
    gamePaused, setGamePaused,
    linesCleared, setLinesCleared,
    gravityTimerRef,
    getColorIndex,
    INITIAL_POSITION,
    MAX_LEVEL,
    GRID_SIZE,
    VERTICAL_STACK_LIMIT,
    initializeGrid,
    resetPosition
  } = useGameState();

  // Reference for orbit controls to update camera position
  const orbitControlsRef = useRef(null);

  const { isValidPosition, moveBlock, rotateBlock, dropBlock } = useBlockMovement(
    grid, currentBlock, position, setPosition, gamePaused, gameOver, controlsEnabled
  );

  const { clearCompleteLayers, checkIfStackedBlocks, checkVerticalStackLimit } = useGridOperations(
    grid, 
    setGrid, 
    setScore,
    setLinesCleared,
    level, 
    GRID_SIZE, 
    VERTICAL_STACK_LIMIT
  );

  // Create local object with all props for useGameActions to avoid line 49 error
  const gameActionProps = {
    grid,
    setGrid,
    score,
    setScore,
    currentBlock,
    setCurrentBlock,
    nextBlock,
    setNextBlock,
    position,
    setPosition,
    setGameOver,
    setControlsEnabled,
    setTimerActive,
    setGamePaused,
    level,
    setLevel,
    gravityTimerRef,
    setLinesCleared,
    clearCompleteLayers,
    checkIfStackedBlocks,
    checkVerticalStackLimit,
    isValidPosition,
    getRandomBlockPattern,
    getColorIndex,
    INITIAL_POSITION,
    MAX_LEVEL,
    gamePaused,
    gameOver,
    resetPosition,
    initializeGrid
  };

  const {
    resetGame,
    handleTimeUp,
    toggleGamePause,
    startGame
  } = useGameActions(gameActionProps);

  useKeyboardControls({
    moveBlock,
    rotateBlock, 
    dropBlock,
    controlsEnabled,
    gamePaused,
    setCurrentBlock,
    currentBlock
  });

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
      currentView={VIEW_POINTS[0]}
      orbitControlsRef={orbitControlsRef}
      onSelectView={(viewPoint) => {
        if (orbitControlsRef.current) {
          const controls = orbitControlsRef.current as any;
          
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
      }}
      onTimeUp={handleTimeUp}
      onReset={resetGame}
      onStartPause={gamePaused ? startGame : toggleGamePause}
    />
  );
};

export default GameController;
