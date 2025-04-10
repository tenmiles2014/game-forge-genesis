
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircleHelp, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Grid3DLabelsProps {
  layerBlockCounts?: {
    layer1: number;
    layer2: number;
    layer3: number;
  }
}

const Grid3DLabels: React.FC<Grid3DLabelsProps> = ({ layerBlockCounts }) => {
  const isMobile = useIsMobile();
  const [buildVersion, setBuildVersion] = useState(0);
  
  // Default values if not provided
  const counts = layerBlockCounts || { layer1: 0, layer2: 0, layer3: 0 };

  // Increment build version on component mount
  useEffect(() => {
    // Get current build version from localStorage or initialize at 1
    const currentVersion = parseInt(localStorage.getItem('buildVersion') || '0', 10);
    const newVersion = currentVersion + 1;
    
    // Save updated version to localStorage
    localStorage.setItem('buildVersion', newVersion.toString());
    setBuildVersion(newVersion);
  }, []);

  return (
    <div className="grid-labels absolute w-full h-full pointer-events-none">
      {/* Bottom label with indicator ball */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Bottom</Label>
      </div>
      
      {/* Right label with indicator ball */}
      {!isMobile && (
        <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-white mr-1 shadow-lg shadow-white/50"></div>
          <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Right</Label>
        </div>
      )}
      
      {/* Front label with indicator ball */}
      {!isMobile && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
          <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Front</Label>
        </div>
      )}
      
      {/* Back label with indicator ball */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Back</Label>
      </div>

      {/* Block Limits section */}
      {!isMobile && layerBlockCounts && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 px-3 py-1 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs uppercase tracking-wide font-medium text-white">BLOCK LIMITS</h3>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="inline-block ml-1 h-3 w-3 text-white" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-white">Maximum blocks allowed per layer. Exceeding these limits will end the game.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-[10px] text-white">
            <div className="flex justify-between">
              <span className="text-white">Layer 2:</span>
              <span className={counts.layer2 > 8 ? "text-red-400" : "text-white"}>{counts.layer2}/8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Layer 3:</span>
              <span className={counts.layer3 > 5 ? "text-red-400" : "text-white"}>{counts.layer3}/5</span>
            </div>
          </div>
          
          {/* Build version display */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/20">
            <div className="flex items-center text-[10px] text-white">
              <Package className="h-2.5 w-2.5 mr-1 text-white/70" />
              <span>Build:</span>
            </div>
            <span className="text-[10px] text-white/80">v{buildVersion}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grid3DLabels;
