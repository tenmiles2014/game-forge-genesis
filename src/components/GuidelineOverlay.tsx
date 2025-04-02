
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GuidelineOverlayProps {
  className?: string;
}

const GuidelineOverlay: React.FC<GuidelineOverlayProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-5 left-5 z-10 transition-all duration-300 ${
        isMinimized ? 'w-12 h-12 rounded-full' : 'max-w-xs rounded-lg'
      } bg-black bg-opacity-80 border border-gray-700 shadow-lg ${className}`}
    >
      {isMinimized ? (
        <Button 
          variant="ghost"
          size="icon"
          className="w-full h-full text-white hover:bg-transparent p-0"
          onClick={() => setIsMinimized(false)}
        >
          ?
        </Button>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-white">Controls</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setIsMinimized(true)}
              >
                -
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-200 space-y-2">
            <p><span className="font-medium">Arrow Keys:</span> Move X/Z</p>
            <p><span className="font-medium">S:</span> Move Down</p>
            <p><span className="font-medium">W:</span> Move Up</p>
            <p><span className="font-medium">Z/X:</span> Rotate</p>
            <p><span className="font-medium">Space:</span> Drop</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidelineOverlay;
