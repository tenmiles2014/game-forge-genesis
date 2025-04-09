
import React from 'react';
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface Grid3DLabelsProps {
  layerBlockCounts?: {
    layer1: number;
    layer2: number;
  }
}

const Grid3DLabels: React.FC<Grid3DLabelsProps> = ({ layerBlockCounts }) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid-labels absolute w-full h-full pointer-events-none">
      {/* Bottom label with indicator ball */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-2 py-1 rounded-md font-semibold text-xs">Bottom</Label>
      </div>
      
      {/* Right label with indicator ball */}
      {!isMobile && (
        <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-white mr-1 shadow-lg shadow-white/50"></div>
          <Label className="text-white bg-black bg-opacity-70 px-2 py-1 rounded-md font-semibold text-xs">Right</Label>
        </div>
      )}
      
      {/* Front label with indicator ball */}
      {!isMobile && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
          <Label className="text-white bg-black bg-opacity-70 px-2 py-1 rounded-md font-semibold text-xs">Front</Label>
        </div>
      )}
      
      {/* Back label with indicator ball */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-2 py-1 rounded-md font-semibold text-xs">Back</Label>
      </div>
    </div>
  );
};

export default Grid3DLabels;
