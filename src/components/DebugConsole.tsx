import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error';
}

interface DebugConsoleProps {
  maxEntries?: number;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ maxEntries = 15 }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when logs update
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Create a function to intercept console logs
    const addLog = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
      const timestamp = new Date().toISOString().substr(11, 8); // HH:MM:SS format
      
      setLogs(prevLogs => {
        const newLogs = [
          ...prevLogs,
          { message, timestamp, type }
        ];
        
        // Keep only the last maxEntries logs
        if (newLogs.length > maxEntries) {
          return newLogs.slice(newLogs.length - maxEntries);
        }
        
        return newLogs;
      });
    };

    // Create a proxy for the original console methods
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // Override console methods
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      addLog(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '), 'info');
    };

    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      addLog(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '), 'warning');
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      addLog(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '), 'error');
    };

    // Clear console on component mount
    console.log("Debug console initialized");

    // Clean up on unmount
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [maxEntries]);

  return (
    <div className="bg-gray-900 text-white p-2 rounded-lg text-sm w-full h-40 overflow-y-auto font-mono" ref={consoleRef}>
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
        <h3 className="text-xs uppercase tracking-wide font-medium text-gray-400">Debug Console</h3>
        <button 
          onClick={() => setLogs([])} 
          className="text-xs text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      {logs.length === 0 ? (
        <div className="text-gray-500 italic text-xs">No logs yet...</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className={`mb-1 ${
            log.type === 'error' ? 'text-red-400' : 
            log.type === 'warning' ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
            {log.message}
          </div>
        ))
      )}
    </div>
  );
};

export default DebugConsole;
