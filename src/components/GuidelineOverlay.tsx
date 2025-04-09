
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info, Gamepad } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";

interface GuidelineOverlayProps {
  className?: string;
}

const GuidelineOverlay: React.FC<GuidelineOverlayProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-5 left-5 z-10 transition-all duration-300 max-w-xs rounded-lg bg-black bg-opacity-80 border border-gray-700 shadow-lg ${className}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Controls</h3>
          <div className="flex gap-2">
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
          <p><span className="font-medium">Arrow Keys:</span> Move</p>
          <p><span className="font-medium">Z/X:</span> Rotate</p>
          <p><span className="font-medium">Space:</span> Drop</p>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-1 w-full text-left flex items-center justify-start p-1 h-auto text-xs text-blue-400 hover:text-blue-300">
                <Info className="h-3 w-3 mr-1" />
                <span>View game rules</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 text-xs">
              <h4 className="font-bold text-white mb-2">Game Rules</h4>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Objective:</span> Clear layers by filling them completely.</p>
                <p><span className="font-medium">Game Over Rules:</span></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Layer 2 can have at most 8 blocks</li>
                  <li>Layer 3 can have at most 5 blocks</li>
                  <li>No blocks allowed above Layer 3</li>
                </ul>
                <p><span className="font-medium">Tips:</span></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>On mobile: Swipe to move, double-tap to rotate, long-press to drop</li>
                  <li>Clear multiple layers at once to level up faster</li>
                  <li>Watch your block counts in upper layers</li>
                  <li>Use camera views to check your block placement</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default GuidelineOverlay;
