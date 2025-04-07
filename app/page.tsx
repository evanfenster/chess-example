'use client';

import { useState } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { GameCreation } from '@/components/chess/GameCreation';
import { GameView } from '@/components/chess/GameView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Swords, Users } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'home' | 'create' | 'game'>('home');
  const [gameCode, setGameCode] = useState('');

  const handleGameCreated = (code: string) => {
    setGameCode(code);
    setView('game');
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="fixed top-0 right-0 p-4">
        <ThemeToggle />
      </nav>
      
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {view === 'home' && (
          <div className="space-y-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Play Chess Online
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Challenge players from around the world or play with friends in a beautiful, 
              distraction-free environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => setView('create')}
              >
                <Swords className="mr-2 h-5 w-5" />
                Create Game
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Game
              </Button>
            </div>
          </div>
        )}
        
        {view === 'create' && (
          <GameCreation 
            onBack={() => setView('home')}
            onGameCreated={handleGameCreated}
          />
        )}

        {view === 'game' && (
          <GameView gameCode={gameCode} onExit={() => setView('home')} />
        )}
      </div>
    </main>
  );
}