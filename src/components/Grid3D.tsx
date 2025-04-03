import React, { useMemo, useState, useEffect } from 'react';
import { BlockPattern } from './BlockPatterns';
import GridBoundaries from './grid3d/GridBoundaries';
import GridBlocks from './grid3d/GridBlocks';
import ActiveBlock from './grid3d/ActiveBlock';
import LandingPreview from './grid3d/LandingPreview';
import FlashEffect from './grid3d/FlashEffect';
import { calculateLandingPosition } from './utils/landingCalculator';
import SpawnPointIndicator from './grid3d/SpawnPointIndicator';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, linesCleared }) => {
  const VERTICAL_STACK_LIMIT = grid.length - 3; // Match the limit in Game3D
  const gridSize = grid.length || 10;
  
  // Calculate landing position
  const landingY = useMemo(() => 
    calculateLandingPosition(position, currentBlock, grid), 
  [position, currentBlock, grid]);
  
  // Flash effect when lines are cleared
  const [flashEffect, setFlashEffect] = useState(false);
  const [lastLinesCleared, setLastLinesCleared] = useState(0);
  
  useEffect(() => {
    if (linesCleared > lastLinesCleared) {
      setFlashEffect(true);
      setLastLinesCleared(linesCleared);
      
      // Turn off the flash effect after a delay
      const timer = setTimeout(() => {
        setFlashEffect(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [linesCleared, lastLinesCleared]);
  
  return (
    <>
      {/* Grid boundaries, floor and coordinate system */}
      <GridBoundaries 
        gridSize={gridSize} 
        verticalStackLimit={VERTICAL_STACK_LIMIT} 
      />
      
      {/* Spawn point indicator */}
      <SpawnPointIndicator 
        gridSize={gridSize} 
      />
      
      {/* Existing blocks in the grid */}
      <GridBlocks grid={grid} />
      
      {/* Currently active block */}
      <ActiveBlock currentBlock={currentBlock} position={position} />
      
      {/* Landing position preview */}
      <LandingPreview 
        currentBlock={currentBlock} 
        position={position} 
        landingY={landingY} 
      />
      
      {/* Flash effect when lines are cleared */}
      <FlashEffect active={flashEffect} />
    </>
  );
};

export default Grid3D;
