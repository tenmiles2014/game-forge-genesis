
import React, { useState, useEffect, useCallback } from 'react';

interface GameTimerProps {
  isActive: boolean;
  onTimeUp: () => void;
  timeLimit: number; // in seconds
  level: number; // Add level prop to adjust speed
}

const DEFAULT_TIME_LIMIT = 180; // 3 minutes in seconds

const GameTimer: React.FC<GameTimerProps> = ({ 
  isActive, 
  onTimeUp, 
  timeLimit = DEFAULT_TIME_LIMIT, // Default to 3 minutes if not specified
  level = 1 // Default level is 1
}) => {
  const [seconds, setSeconds] = useState(timeLimit);
  
  // Reset timer when time limit changes or when isActive changes
  useEffect(() => {
    if (!isActive) return; // Only reset when active changes to true
    setSeconds(timeLimit);
  }, [timeLimit, isActive]);
  
  // Timer effect with proper cleanup
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          const newTime = prevSeconds - 1;
          if (newTime <= 0) {
            // When time reaches zero, call onTimeUp immediately
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    // Clean up timer
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = (seconds / timeLimit) * 100;

  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Time</h3>
      <div className="flex flex-col">
        <div className="text-2xl font-mono text-white">{formatTime(seconds)}</div>
        <div className="mt-2 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-game-blue transition-all duration-300 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameTimer;
