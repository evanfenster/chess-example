'use client';

import { useState } from 'react';
import { GameCreation } from '@/components/chess/GameCreation';
import { GameView } from '@/components/chess/GameView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { 
  Swords, 
  Users, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinGame, getGameByCode } from '@/lib/actions/chess';

export default function Home() {
  const [view, setView] = useState<'home' | 'create' | 'game'>('home');
  const [gameCode, setGameCode] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  
  // Generate a simple pseudo-random player ID for this session
  const [playerId] = useState(
    `player_${Math.random().toString(36).substring(2, 10)}`
  );

  const handleGameCreated = (code: string) => {
    console.log('Game created with code:', code);
    setGameCode(code);
    setView('game');
  };
  
  const handleJoinGame = async () => {
    if (!joinGameCode.trim()) {
      setJoinError('Please enter a game code');
      return;
    }
    
    try {
      setIsJoining(true);
      setJoinError(null);
      
      // First check if the game exists
      const game = await getGameByCode(joinGameCode);
      
      if (!game) {
        setJoinError('Game not found. Please check the code and try again.');
        return;
      }
      
      // Try to join the game
      await joinGame(joinGameCode, playerId);
      
      // Success - close dialog and go to game view
      setJoinDialogOpen(false);
      setGameCode(joinGameCode);
      setView('game');
    } catch (error: any) {
      console.error('Error joining game:', error);
      setJoinError(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
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
                onClick={() => setJoinDialogOpen(true)}
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
            playerId={playerId}
          />
        )}

        {view === 'game' && (
          <GameView 
            gameCode={gameCode} 
            onExit={() => setView('home')} 
            playerId={playerId}
          />
        )}
      </div>
      
      {/* Join Game Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Chess Game</DialogTitle>
            <DialogDescription>
              Enter the game code provided by your opponent.
            </DialogDescription>
          </DialogHeader>
          
          {joinError && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
              {joinError}
            </div>
          )}
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="gameCode">Game Code</Label>
              <Input
                id="gameCode"
                placeholder="Enter 6-character code"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-lg tracking-wider"
                disabled={isJoining}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)} disabled={isJoining}>
              Cancel
            </Button>
            <Button onClick={handleJoinGame} disabled={isJoining}>
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Game
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}