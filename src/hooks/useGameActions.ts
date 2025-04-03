
const toggleGamePause = useCallback(() => {
  if (gravityTimerRef.current) {
    clearInterval(gravityTimerRef.current);
    gravityTimerRef.current = null;
  }
  
  setGamePaused(prevPaused => !prevPaused);
  setTimerActive(prevActive => !prevActive);
  setControlsEnabled(prevEnabled => !prevEnabled);
  
  if (!gamePaused) {
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
}, [
  gravityTimerRef, 
  setGamePaused, 
  setTimerActive, 
  setControlsEnabled, 
  gamePaused
]);
