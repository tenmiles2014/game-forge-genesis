
import React, { useEffect, useMemo } from 'react';
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
  const gridSize = grid?.length || 10;
  
  // Calculate the landing position for the current block
  const landingData = useMemo(() => {
    // Safety check for required data
    if (!grid || !currentBlock?.shape || !position) {
      return { 
        landingPosition: {...position}, 
        isValid: false 
      };
    }
    
    const calculatedLanding = calculateLandingPosition(grid, currentBlock, position);
    const isValid = calculatedLanding.y !== position.y;
    
    return {
      landingPosition: calculatedLanding,
      isValid: isValid
    };
  }, [grid, currentBlock, position]);
  
  return (
    <group>
      <GridBoundaries gridSize={gridSize} />
      
      {grid && grid.length > 0 && (
        <GridBlocks grid={grid} />
      )}
      
      {currentBlock?.shape && position && (
        <ActiveBlock 
          currentBlock={currentBlock}
          position={position} 
        />
      )}
      
      {currentBlock?.shape && landingData.isValid && (
        <LandingPreview 
          currentBlock={currentBlock}
          position={position}
          landingY={landingData.landingPosition.y}
        />
      )}
      
      <FlashEffect active={linesCleared > 0} />
      
      <SpawnPointIndicator 
        gridSize={gridSize}
        isGameActive={isGameActive}
      />
    </group>
  );
};

export default Grid3D;
