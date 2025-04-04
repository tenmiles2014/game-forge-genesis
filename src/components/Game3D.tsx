
const placeBlock = () => {
  setGrid(prevGrid => {
    // Create a deep copy of the current grid
    const newGrid = JSON.parse(JSON.stringify(prevGrid));
    
    // First, place the current block in the grid
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
    
    // Then clear any completed layers and calculate score
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Finally, apply gravity to ensure blocks fall properly
    applyGravityToBlocks(newGrid);
    
    // Update score if layers were cleared
    if (layersCleared > 0) {
      const levelMultiplier = 1 + (level * 0.1);
      const pointsScored = Math.floor(layersCleared * 10 * levelMultiplier);
      setTimeout(() => {
        setScore(prevScore => prevScore + pointsScored);
        toast({
          title: `${layersCleared} lines cleared!`,
          description: `+${pointsScored} points`,
        });

        // Check for level up
        if (level < MAX_LEVEL) {
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
      }, 200);
    }
    
    return newGrid; // Return the final modified grid
  });

  // Add a delay before setting the next block to allow for visual clearing effect
  setTimeout(() => {
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    if (!isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `No space for new block. Final score: ${score} | Level: ${level}`,
      });
      return;
    }
    
    setPosition(newPosition);
  }, 500); // Increased delay to 500ms to make layer clearing more noticeable
};
