
import React from 'react';
import { BlockPattern } from './BlockPatterns';
import ActiveBlock from './grid3d/ActiveBlock';
import GridBlocks from './grid3d/GridBlocks';
import GridBoundaries from './grid3d/GridBoundaries';
import SpawnPointIndicator from './grid3d/SpawnPointIndicator';
import LandingPreview from './grid3d/LandingPreview';
import FlashEffect from './grid3d/FlashEffect';
import { calculateLandingPosition } from './utils/landingCalculator';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
  isGameActive?: boolean;
}

const Grid3D: React.FC<Grid3DProps> = ({ 
  grid, 
  currentBlock, 
  position, 
  linesCleared,
  isGameActive = false
}) => {
  // Default grid size if grid is not initialized yet
  const gridSize = grid?.length || 10;
  
  // Calculate landing position for preview, with safety check for grid
  const landingPosition = grid && grid.length > 0 && currentBlock
    ? calculateLandingPosition(grid, currentBlock, position)
    : { ...position };

  return (
    <group>
      {/* Grid boundaries */}
      <GridBoundaries gridSize={gridSize} />
      
      {/* Active blocks in the grid */}
      {grid && grid.length > 0 && (
        <GridBlocks grid={grid} />
      )}
      
      {/* Current moving block */}
      {currentBlock && (
        <ActiveBlock 
          currentBlock={currentBlock}
          position={position} 
        />
      )}
      
      {/* Landing preview */}
      {currentBlock && landingPosition && (
        <LandingPreview 
          currentBlock={currentBlock}
          position={position}
          landingY={landingPosition.y}
        />
      )}
      
      {/* Flash effect on line clear */}
      <FlashEffect 
        active={linesCleared > 0} 
      />
      
      {/* Spawn point indicator */}
      <SpawnPointIndicator 
        gridSize={gridSize}
        isGameActive={isGameActive}
      />
    </group>
  );
};

export default Grid3D;
