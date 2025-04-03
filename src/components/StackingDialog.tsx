
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stackedBlocks: number;
}

const StackingDialog: React.FC<StackingDialogProps> = ({
  open,
  onOpenChange,
  stackedBlocks,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-game-blue">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-game-blue">
            Block Stacking Detected!
          </DialogTitle>
          <DialogDescription className="text-center text-white">
            {stackedBlocks} blocks have stacked on top of each other.
          </DialogDescription>
        </DialogHeader>
        <div className="grid place-items-center py-4">
          <div className="text-white text-center">
            <p className="mb-2">
              Stacking blocks can lead to interesting structures but also
              increases the risk of toppling!
            </p>
            <div className="mt-4 text-game-blue font-bold text-xl">
              Keep stacking for bonus points!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StackingDialog;
