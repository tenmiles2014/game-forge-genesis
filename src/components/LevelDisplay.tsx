
import React, { useState, useEffect } from 'react';
import { Layers, Info, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

export interface LevelDisplayProps {
  level: number;
  maxLevel?: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, maxLevel = 99 }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Update open state when mobile status changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">Level</h3>
      <div className="text-3xl font-bold text-white flex justify-between items-baseline">
        <span className="text-white">{level}</span>
        {maxLevel && <span className="text-sm text-gray-400">/ {maxLevel}</span>}
      </div>
      
      {/* Level Up Criteria - Collapsible section */}
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="mt-4 border-t border-gray-700 pt-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wide font-medium text-gray-300">LEVEL UP CRITERIA</h4>
          <CollapsibleTrigger className="text-gray-300 hover:text-white">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-sm text-cyan-400">
              <Layers className="h-4 w-4" />
              <span>2 layers simultaneously</span>
            </div>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-sm text-sky-400 cursor-help mt-1">
                    <Info className="h-3.5 w-3.5 mr-1" />
                    <span>More information</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Clear multiple layers simultaneously to level up faster. Higher levels give better score multipliers but faster drop speeds.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LevelDisplay;
