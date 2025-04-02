
import React, { useState, useEffect } from 'react';

interface GameTimerProps {
  isActive: boolean;
  onTimeUp: () => void;
  timeLimit: number; // in seconds
}

const GameTimer: React.FC<GameTimerProps> = ({ isActive, onTimeUp, timeLimit }) => {
  const [seconds, setSeconds] = useState(timeLimit);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          const newTime = prevSeconds - 1;
          if (newTime <= 0) {
            if (onTimeUp) onTimeUp();
            clearInterval(interval);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (seconds === 0) {
      if (onTimeUp) onTimeUp();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onTimeUp]);

  // Reset timer when time limit changes (new level)
  useEffect(() => {
    setSeconds(timeLimit);
  }, [timeLimit]);

  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Time</h3>
      <div className="text-2xl font-mono text-white">{formatTime(seconds)}</div>
    </div>
  );
};

export default GameTimer;
