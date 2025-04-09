
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
        <div className="flex items-center gap-2 px-2 py-1.5 hover:text-[#33C3F0] transition-colors"> {/* Changed hover text color */}
          <Info className="h-4 w-4" />
          Game Guidelines
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white">3D Tetris: Game Guidelines</DialogTitle> {/* Added text-white */}
          <DialogDescription>
            <div className="space-y-4 text-sm text-white"> {/* Changed from text-muted-foreground to text-white */}
              <section>
                <h3 className="text-base font-semibold text-white mb-2">Game Objective</h3> {/* Added text-white */}
                <p className="text-white"> {/* Added text-white */}
                  Your goal is to strategically place 3D blocks in the grid, creating complete layers to clear them and score points. 
                  As you progress, the game becomes more challenging with each level.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-white mb-2">Controls</h3>
                <div className="grid grid-cols-2 gap-2 text-white"> {/* Added text-white */}
                  <div>
                    <strong className="text-white">Movement:</strong>
                    <p className="text-white">Arrow Keys: Move block along X and Z axes</p>
                  </div>
                  <div>
                    <strong className="text-white">Rotation:</strong>
                    <p className="text-white">Z/X Keys: Rotate block</p>
                  </div>
                  <div>
                    <strong className="text-white">Drop:</strong>
                    <p className="text-white">Spacebar: Instant drop</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-base font-semibold text-white mb-2">Game Over Rules</h3>
                <ul className="list-disc pl-4 text-white"> {/* Added text-white */}
                  <li>Layer 1 (bottom layer) can have at most 10 blocks</li>
                  <li>Layer 2 can have at most 5 blocks</li>
                  <li>No blocks are allowed in Layer 3 or above</li>
                  <li>Violating any of these rules will end the game</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-white mb-2">Scoring & Levels</h3>
                <ul className="list-disc pl-4 text-white"> {/* Added text-white */}
                  <li>Clear multiple layers in a single move to level up faster</li>
                  <li>Each level requires clearing more layers</li>
                  <li>Level up bonus: Points increase with each new level</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-white mb-2">Tips</h3>
                <ul className="list-disc pl-4 text-white"> {/* Added text-white */}
                  <li>Plan your block placement to maximize layer clearance</li>
                  <li>Use rotation strategically to fit blocks efficiently</li>
                  <li>Keep an eye on the upcoming block preview</li>
                  <li>Monitor block counts in Layer 1 and 2 to avoid game over</li>
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
