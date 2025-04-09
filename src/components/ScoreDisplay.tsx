
import React from 'react';
import { Layers, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="p-4 rounded-lg bg-black bg-opacity-30 text-center">
      <div className="text-2xl font-bold text-white">{score}</div>
      
      {/* Level Up Criteria */}
      <div className="mt-2 text-left">
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
                <Layers className="h-4 w-4" />
                <span>Level Up Criteria</span>
                <Info className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p>Clear multiple layers simultaneously to level up faster. Higher levels give better score multipliers but faster drop speeds.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ScoreDisplay;
