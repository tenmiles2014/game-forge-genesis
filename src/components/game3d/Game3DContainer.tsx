
import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getRandomBlockPattern } from '../BlockPatterns';
import GuidelineOverlay from '../GuidelineOverlay';
import GameContainer from './GameContainer';
import GameSidebar from './GameSidebar';
import GameHeader from './GameHeader';
import GameOverlay from './GameOverlay';
import { useGameState } from '../../hooks/useGameState';
import { useBlockMovement } from '../../hooks/useBlockMovement';
import { useGridOperations } from '../../hooks/useGridOperations';
import GameFooter from './GameFooter';
import GameInitializer from './GameInitializer';
import { ViewPoint } from '../ViewControls';
import { useGameActions } from '../../hooks/useGameActions';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';

const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

const Game3DContainer: React.FC = () => {
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
    initializeGrid
  } = useGameState();

  // Initialize grid on mount
  useEffect(() => {
    console.log("🔄 Initializing grid on component mount");
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
  }, []);

  const orbitControlsRef = useRef(null);
  const [currentView, setCurrentView] = useState<ViewPoint>(VIEW_POINTS[0]);

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

  const {
    resetGame,
    handleTimeUp,
    toggleGamePause,
    startGame
  } = useGameActions({
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
    gamePaused
  });

  // Keyboard Controls Hook
  useKeyboardControls({
    moveBlock,
    rotateBlock, 
    dropBlock,
    controlsEnabled,
    gamePaused,
    setCurrentBlock,
    currentBlock
  });

  // Debug Effect for Game State
  useEffect(() => {
    console.log('🎮 Game State Debug:', {
      controlsEnabled,
      gamePaused,
      gameOver,
      timerActive,
      currentBlock: currentBlock?.name,
      position: JSON.stringify(position),
      gridInitialized: grid && grid.length > 0
    });
  }, [controlsEnabled, gamePaused, gameOver, timerActive, currentBlock, position, grid]);

  const handleViewChange = (viewPoint: ViewPoint) => {
    setCurrentView(viewPoint);
    
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
    
    toast({
      title: `View Changed`,
      description: `Now viewing from ${viewPoint.name}`,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-2 md:p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
        3D Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden w-full max-w-[1400px] flex flex-col md:flex-row gap-4 bg-black bg-opacity-30">
        <GameInitializer>
          <div className="flex-1 min-h-[550px] md:min-h-[650px]">
            <GameHeader viewPoints={VIEW_POINTS} onSelectView={handleViewChange} />
            
            <GameContainer 
              grid={grid}
              currentBlock={currentBlock}
              position={position}
              linesCleared={linesCleared}
              controlsEnabled={controlsEnabled}
              currentView={currentView}
              orbitControlsRef={orbitControlsRef}
            />
            
            <GameOverlay />
          </div>
          
          <GameSidebar
            score={score}
            linesCleared={linesCleared}
            level={level}
            maxLevel={MAX_LEVEL}
            timerActive={timerActive}
            onTimeUp={handleTimeUp}
            timeLimit={timeLimit}
            nextBlock={nextBlock}
            onReset={resetGame}
            onStartPause={gamePaused ? startGame : toggleGamePause}
            isPaused={gamePaused}
            gameOver={gameOver}
          />
        </GameInitializer>
      </div>
      
      <GameFooter gameOver={gameOver} score={score} level={level} />
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3DContainer;
