
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
    blue: "bg-gradient-to-br from-game-blue to-blue-500",
    red: "bg-gradient-to-br from-game-red to-red-400",
    green: "bg-gradient-to-br from-game-green to-green-400",
    purple: "bg-gradient-to-br from-game-purple to-purple-400",
    yellow: "bg-gradient-to-br from-game-yellow to-yellow-400",
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
