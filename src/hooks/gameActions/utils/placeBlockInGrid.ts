
import { BlockPattern } from '@/components/BlockPatterns';

export function placeBlockInGrid(
  grid: number[][][],
  position: { x: number; y: number; z: number },
  currentBlock: BlockPattern,
  colorIndex: number
): number[][][] {
  // Deep clone to avoid mutation
  const newGrid = JSON.parse(JSON.stringify(grid));
  
  console.log(`Placing block at position [x:${position.x}, y:${position.y}, z:${position.z}]`, {
    blockShape: JSON.stringify(currentBlock.shape),
    colorIndex
  });
  
  for (let yy = 0; yy < currentBlock.shape.length; yy++) {
    for (let xx = 0; xx < currentBlock.shape[yy].length; xx++) {
      if (currentBlock.shape[yy][xx]) {
        const gridX = position.x + xx;
        const gridY = position.y;
        const gridZ = position.z + yy;
        
        if (
          gridX >= 0 && gridX < grid.length &&
          gridY >= 0 && gridY < grid.length &&
          gridZ >= 0 && gridZ < grid.length
        ) {
          newGrid[gridY][gridX][gridZ] = colorIndex;
        }
      }
    }
  }
  
  return newGrid;
}
