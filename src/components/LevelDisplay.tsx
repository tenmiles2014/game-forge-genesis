
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
    <div className="p-2 rounded-lg bg-black bg-opacity-30 h-full">
      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-300 mb-1">Level</h3>
      <div className="text-base sm:text-xl font-bold text-white flex justify-between items-baseline">
        <span className="text-white">{level}</span>
        {maxLevel && <span className="text-xs text-gray-400">/ {maxLevel}</span>}
      </div>
      
      {/* Level Up Criteria - Collapsible section */}
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="mt-1 border-t border-gray-700 pt-1"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase tracking-wide font-medium text-gray-300">LEVEL UP CRITERIA</h4>
          <CollapsibleTrigger className="text-gray-300 hover:text-white">
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="mt-1">
            <div className="flex items-center gap-1 text-[10px] text-cyan-400">
              <Layers className="h-2.5 w-2.5" />
              <span>2 layers simultaneously</span>
            </div>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-[10px] text-sky-400 cursor-help mt-0.5">
                    <Info className="h-2.5 w-2.5 mr-0.5" />
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
