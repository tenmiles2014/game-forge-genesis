
import React, { useEffect, useMemo } from 'react';
import { BlockPattern } from './BlockPatterns';
import ActiveBlock from './grid3d/ActiveBlock';
import GridBlocks from './grid3d/GridBlocks';
import GridBoundaries from './grid3d/GridBoundaries';
import SpawnPointIndicator from './grid3d/SpawnPointIndicator';
import LandingPreview from './grid3d/LandingPreview';
import FlashEffect from './grid3d/FlashEffect';
import { 
  calculateLandingPosition, 
  isValidLandingPosition 
} from './utils/landingCalculator';

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
  
  // Memoized landing position calculation
  const landingData = useMemo(() => {
    console.log("📊 Grid3D calculating landing position for:", {
      blockColor: currentBlock?.color,
      blockShapeSize: currentBlock?.shape?.length,
      position: position,
      gridInitialized: !!grid && grid.length > 0
    });
    
    if (!grid || !currentBlock?.shape || !position) {
      console.warn("⚠️ Missing data for landing calculation");
      return { 
        landingPosition: {...position}, 
        isValid: false 
      };
    }
    
    const calculatedLanding = calculateLandingPosition(grid, currentBlock, position);
    const validLanding = calculatedLanding.y !== position.y;
    
    console.log("🎯 Landing preview:", {
      currentY: position.y,
      landingY: calculatedLanding.y,
      diff: position.y - calculatedLanding.y,
      valid: validLanding
    });
    
    return {
      landingPosition: calculatedLanding,
      isValid: validLanding
    };
  }, [grid, currentBlock, position]);
  
  // Debug effect for monitoring landing calculations
  useEffect(() => {
    console.log("🎮 Grid3D rendering with:", { 
      landingY: landingData.landingPosition?.y,
      currentY: position?.y,
      diff: position ? position.y - landingData.landingPosition?.y : "unknown",
      isValid: landingData.isValid
    });
  }, [landingData, position]);

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
