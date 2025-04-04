
import React from 'react';
import { cn } from '@/lib/utils';

interface GameBlockProps {
  color: string;
  className?: string;
  isPreview?: boolean;
}

const GameBlock: React.FC<GameBlockProps> = ({ color, className, isPreview = false }) => {
  const baseStyle = "w-full h-full rounded-sm block-shadow transition-all duration-200";
  
  const colorMap: Record<string, string> = {
    blue: "bg-game-blue",
    red: "bg-game-red",
    green: "bg-game-green",
    purple: "bg-game-purple",
    yellow: "bg-game-yellow",
    highlight: "bg-white animate-pulse opacity-90 scale-[1.05] shadow-xl shadow-white/60 z-10" // Further enhanced highlight animation
  };
  
  const blockColor = colorMap[color] || "bg-gray-400";
  
  return (
    <div className={cn(
      baseStyle,
      blockColor,
      isPreview ? "opacity-70" : "opacity-100",
      className
    )} />
  );
};

export default GameBlock;
