
import React from 'react';
import { cn } from '@/lib/utils';

interface GameBlockProps {
  color: string;
  className?: string;
  isPreview?: boolean;
  isClearing?: boolean;
}

const GameBlock: React.FC<GameBlockProps> = ({ 
  color, 
  className, 
  isPreview = false,
  isClearing = false 
}) => {
  const baseStyle = "w-full h-full rounded-sm block-shadow transition-all duration-200";
  
  const colorMap: Record<string, string> = {
    blue: "bg-game-blue",
    red: "bg-game-red",
    green: "bg-game-green",
    purple: "bg-game-purple",
    yellow: "bg-game-yellow",
    highlight: "bg-white animate-pulse opacity-90 scale-[1.05] shadow-xl shadow-white/60 z-10" // Further enhanced highlight animation
  };
  
  // If the block is in clearing state, apply a stronger animation
  const clearingAnimation = isClearing 
    ? "animate-[pulse_0.4s_ease-in-out_infinite] scale-110" 
    : "";
  
  const blockColor = colorMap[color] || "bg-gray-400";
  
  return (
    <div className={cn(
      baseStyle,
      blockColor,
      isPreview ? "opacity-70" : "opacity-100",
      isClearing && "z-20", // Ensure clearing blocks appear on top
      clearingAnimation,
      className
    )} />
  );
};

export default GameBlock;
