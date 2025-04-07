'use client';

import { Button } from '@/components/ui/button';
import { ChessBoard } from './ChessBoard';
import { Copy, Home } from 'lucide-react';

interface GameViewProps {
  gameCode: string;
  onExit: () => void;
}

export function GameView({ gameCode, onExit }: GameViewProps) {
  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onExit}
        >
          <Home className="mr-2 h-4 w-4" />
          Exit to Home
        </Button>
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-sm">
            Game Code: {gameCode}
          </code>
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(gameCode)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ChessBoard />
    </div>
  );
}