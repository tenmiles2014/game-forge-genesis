
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
    
    // First clear any complete layers and get the count
    const layersCleared = clearCompleteLayers(newGrid);
    
    // Now set the grid after modifications from both placement and clearing
    setGrid(newGrid);
    
    const nextBlockPattern = nextBlock;
    setCurrentBlock(nextBlockPattern);
    setNextBlock(getRandomBlockPattern());
    
    const newPosition = {...INITIAL_POSITION};
    
    if (!isValidPosition(nextBlockPattern.shape, newPosition.x, newPosition.y, newPosition.z)) {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      toast({
        title: "Game Over!",
        description: `No space for new block. Final score: ${score} | Level: ${level}`,
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
