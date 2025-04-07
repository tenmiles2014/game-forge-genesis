
import React from 'react';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GameGuidelines: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger className="w-full text-left">
        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
          <Info className="h-4 w-4" />
          Game Guidelines
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>3D Tetris: Game Guidelines</DialogTitle>
          <DialogDescription>
            <div className="space-y-4 text-sm text-muted-foreground">
              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">Game Objective</h3>
                <p>
                  Your goal is to strategically place 3D blocks in the grid, creating complete layers to clear them and score points. 
                  As you progress, the game becomes more challenging with each level.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong>Movement:</strong>
                    <p>Arrow Keys: Move block along X and Z axes</p>
                  </div>
                  <div>
                    <strong>Rotation:</strong>
                    <p>Z/X Keys: Rotate block</p>
                  </div>
                  <div>
                    <strong>Drop:</strong>
                    <p>Spacebar: Instant drop</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">Scoring & Levels</h3>
                <ul className="list-disc pl-4">
                  <li>Clear multiple layers in a single move to level up faster</li>
                  <li>Each level requires clearing more layers</li>
                  <li>Level up bonus: Points increase with each new level</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">Tips</h3>
                <ul className="list-disc pl-4">
                  <li>Plan your block placement to maximize layer clearance</li>
                  <li>Use rotation strategically to fit blocks efficiently</li>
                  <li>Keep an eye on the upcoming block preview</li>
                </ul>
              </section>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GameGuidelines;
