
import React, { useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getRandomBlockPattern } from './BlockPatterns';
import GuidelineOverlay from './GuidelineOverlay';
import GameContainer from './game3d/GameContainer';
import GameSidebar from './game3d/GameSidebar';
import GameHeader from './game3d/GameHeader';
import GameOverlay from './game3d/GameOverlay';
import GameFooter from './game3d/GameFooter';
import { useGameState } from '../hooks/useGameState';
import { useBlockMovement } from '../hooks/useBlockMovement';
import { useGridOperations } from '../hooks/useGridOperations';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { ViewPoint } from './ViewControls';

// Constants
const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

const Game3D: React.FC = () => {
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
    getDropSpeed,
    initializeGrid,
    getColorIndex,
    GRID_SIZE,
    INITIAL_POSITION,
    MAX_LEVEL,
    VERTICAL_STACK_LIMIT
  } = useGameState();

  const orbitControlsRef = useRef(null);
  const [currentView, setCurrentView] = React.useState<ViewPoint>(VIEW_POINTS[0]);

  const { isValidPosition, moveBlock, rotateBlock } = useBlockMovement(
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

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (gamePaused || gameOver) {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    const dropSpeed = getDropSpeed();
    
    gravityTimerRef.current = window.setInterval(() => {
      moveBlock('down');
    }, dropSpeed);

    return () => {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
    };
  }, [gamePaused, gameOver, level, position]);

  useEffect(() => {
    const newTimeLimit = Math.max(60, Math.floor(180 - (level * 2)));
    setTimeLimit(newTimeLimit);
  }, [level]);

  const dropBlock = () => {
    if (gameOver || !controlsEnabled || gamePaused) return;
    
    placeBlock();
  };

  useKeyboardControls({
    moveBlock,
    rotateBlock,
    dropBlock,
    controlsEnabled,
    gamePaused,
    setCurrentBlock,
    currentBlock
  });

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setControlsEnabled(true);
    setLevel(1);
    setTimerActive(false);
    setGamePaused(true);
    
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    toast({
      title: "Game Rules",
      description: "Blocks drop from top to bottom. Game ends if blocks stack too high!",
    });
  };

  const placeBlock = () => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          const gridX = position.x + x;
          const gridY = position.y;
          const gridZ = position.z + y;
          
          if (
            gridX >= 0 && gridX < GRID_SIZE &&
            gridY >= 0 && gridY < GRID_SIZE &&
            gridZ >= 0 && gridZ < GRID_SIZE
          ) {
            newGrid[gridY][gridX][gridZ] = getColorIndex(currentBlock.color);
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    const layersCleared = clearCompleteLayers(newGrid);
    
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    if (checkIfStackedBlocks(newGrid) || checkVerticalStackLimit(newGrid) || !isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `Blocks stacked too high. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
    setPosition(newPosition);
    
    if (layersCleared > 0 && level < MAX_LEVEL) {
      const layerThreshold = Math.ceil(level / 5) + 1;
      if (layersCleared >= layerThreshold) {
        const newLevel = Math.min(MAX_LEVEL, level + 1);
        setLevel(newLevel);
        toast({
          title: `Level Up!`,
          description: `You are now on level ${newLevel}`,
        });
      }
    }
  };

  const handleTimeUp = () => {
    if (!gameOver) {
      setGameOver(true);
      setControlsEnabled(false);
      setGamePaused(true);
      toast({
        title: "Time's Up!",
        description: `Final score: ${score} | Level: ${level}`,
      });
    }
  };

  const toggleGamePause = () => {
    if (gameOver) return;
    
    const newPausedState = !gamePaused;
    setGamePaused(newPausedState);
    setTimerActive(!newPausedState);
    setControlsEnabled(!newPausedState);
    
    if (newPausedState) {
      toast({
        title: "Game Paused",
        description: "Take a breather!",
      });
    } else {
      toast({
        title: "Game Resumed",
        description: "Let's go!",
      });
    }
  };

  const startGame = () => {
    if (!gamePaused) return;
    
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
    
    toast({
      title: "Game Started",
      description: "Good luck! Remember: No stacking allowed!",
    });
  };

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
          onStartPause={toggleGamePause}
          isPaused={gamePaused}
          gameOver={gameOver}
        />
      </div>
      
      <GameFooter gameOver={gameOver} score={score} level={level} />
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3D;
