
import React, { useEffect } from 'react';

interface DebugConsoleProps {
  maxEntries?: number;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ maxEntries = 15 }) => {
  useEffect(() => {
    // Create a proxy for the original console methods
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // Override console methods - just pass through to browser console
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
    };

    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
    };

    // Clear console on component mount
    originalConsoleLog("Debug console initialized (logs will appear in browser console)");

    // Clean up on unmount
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [maxEntries]);

  // Return null to hide the UI
  return null;
};

export default DebugConsole;
