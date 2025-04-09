
import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const GuidelineOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed top-3 right-3 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 border-gray-600 z-20"
        onClick={() => setIsVisible(true)}
      >
        <Info className="h-4 w-4 text-gray-300" />
      </Button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4 flex flex-col">
          <Button
            variant="ghost"
            className="self-end p-2 text-gray-400 hover:text-white"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="max-w-lg mx-auto text-gray-200 text-sm space-y-4 mt-4">
            <h2 className="text-xl font-bold text-white">Game Guidelines</h2>
            
            <div>
              <h3 className="font-bold text-white mb-1">Game Rules:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Clear lines by filling an entire row, column, or layer with blocks.</li>
                <li>Block limits: Layer 2 max 8 blocks, Layer 3 max 5 blocks.</li>
                <li>Game over if blocks exceed limits or reach above layer 3.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-1">Controls:</h3>
              {isMobile ? (
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the D-pad buttons to move blocks.</li>
                  <li>Purple button to rotate blocks.</li>
                  <li>Green button to drop blocks instantly.</li>
                  <li>Double tap to rotate blocks.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-6 space-y-1">
                  <li>Arrow keys to move blocks.</li>
                  <li>Z key to rotate around Z-axis.</li>
                  <li>X key to rotate around X-axis.</li>
                  <li>Space to drop blocks instantly.</li>
                </ul>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-1">Scoring:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Clearing lines gives points based on current level.</li>
                <li>Clearing multiple lines at once gives bonus points.</li>
                <li>Level up for bigger score multipliers (but faster drop speed).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuidelineOverlay;

