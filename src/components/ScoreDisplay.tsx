
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

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Update open state when mobile status changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30 text-center">
      <h3 className="text-sm uppercase tracking-wide font-medium text-gray-300 mb-2">SCORE</h3>
      <div className="text-2xl font-bold text-white">{score}</div>
      
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
            <div className="flex items-center text-sm text-emerald-400">
              <span className="ml-5">Next level bonus: +200 points</span>
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

export default ScoreDisplay;
