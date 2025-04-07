'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChessBoard } from './ChessBoard';
import { Copy, Home, Flag, RotateCcw } from 'lucide-react';
import { getGameByCode, getGameMoves, updateGameStatus } from '@/lib/actions/chess';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSocket } from '@/lib/hooks/useSocket';

interface GameViewProps {
  gameCode: string;
  onExit: () => void;
  playerId?: string;
}

export function GameView({ gameCode, onExit, playerId = 'guest' }: GameViewProps) {
  const [gameState, setGameState] = useState<any>(null);
  const [moves, setMoves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player's color (white or black)
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  
  // Use socket.io for real-time updates
  const { isConnected, joinGame, onMove } = useSocket();
  
  // Load initial game data
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching game with code:', gameCode);
        const game = await getGameByCode(gameCode);
        console.log('Game data received:', game);
        
        if (!game) {
          console.error('Game not found for code:', gameCode);
          setError('Game not found');
          return;
        }
        
        setGameState(game);
        
        // Determine player color
        if (game.whitePlayerId === playerId) {
          setPlayerColor('white');
        } else if (game.blackPlayerId === playerId) {
          setPlayerColor('black');
        } else if (!game.whitePlayerId) {
          // Join as white if available
          setPlayerColor('white');
        } else if (!game.blackPlayerId) {
          // Join as black if available
          setPlayerColor('black');
        } else {
          // Spectator mode
          setPlayerColor(null);
        }
        
        // Load moves
        console.log('Fetching moves for game:', gameCode);
        const movesData = await getGameMoves(gameCode);
        console.log('Moves data received:', movesData);
        setMoves(movesData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading game:', error);
        setError('Failed to load game data');
        setIsLoading(false);
      }
    };
    
    // Load initial game data
    loadGameData();
  }, [gameCode, playerId]);
  
  // Join the game socket room when connected
  useEffect(() => {
    if (isConnected && gameCode) {
      console.log('Joining socket room for game:', gameCode);
      joinGame(gameCode);
    }
  }, [isConnected, gameCode, joinGame]);
  
  // Listen for move updates from other players
  useEffect(() => {
    // Set up listener for moves
    const removeListener = onMove(async (moveData) => {
      console.log('Received move from socket:', moveData);
      
      // Refresh game data after receiving a move
      try {
        const updatedGame = await getGameByCode(gameCode);
        const updatedMoves = await getGameMoves(gameCode);
        
        setGameState(updatedGame);
        setMoves(updatedMoves);
      } catch (error) {
        console.error('Error updating after move:', error);
      }
    });
    
    return removeListener;
  }, [gameCode, onMove]);
  
  // Handle resign
  const handleResign = async () => {
    if (confirm('Are you sure you want to resign?')) {
      await updateGameStatus(gameCode, 'resigned');
      
      // Reload game after resigning
      const updatedGame = await getGameByCode(gameCode);
      setGameState(updatedGame);
    }
  };
  
  // Is it the player's turn?
  const isPlayerTurn = playerColor !== null && gameState?.nextTurn === playerColor;
  
  // Game status messages
  const getStatusMessage = () => {
    if (!gameState) return '';
    
    switch (gameState.status) {
      case 'checkmate':
        return `Checkmate! ${gameState.nextTurn === 'white' ? 'Black' : 'White'} wins.`;
      case 'stalemate':
        return 'Stalemate! The game is a draw.';
      case 'draw':
        return 'Draw agreed.';
      case 'resigned':
        return `${gameState.nextTurn === 'white' ? 'Black' : 'White'} resigned. ${gameState.nextTurn === 'black' ? 'Black' : 'White'} wins.`;
      default:
        return gameState.nextTurn === playerColor 
          ? 'Your turn' 
          : playerColor 
            ? 'Opponent\'s turn' 
            : `${gameState.nextTurn === 'white' ? 'White' : 'Black'}'s turn`;
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading game...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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

      <div className="md:grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-4">
            <p className="text-lg font-medium">
              {getStatusMessage()}
            </p>
            {playerColor && (
              <p>You are playing as {playerColor}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
          
          <ChessBoard 
            gameCode={gameCode}
            initialFen={gameState?.fenPosition}
            isPlayerTurn={isPlayerTurn && gameState?.status === 'active'}
            playerColor={playerColor || 'white'}
          />

          {playerColor && gameState?.status === 'active' && (
            <div className="mt-4 flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleResign}
              >
                <Flag className="mr-2 h-4 w-4" />
                Resign
              </Button>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Move History</h3>
          {moves.length === 0 ? (
            <p className="text-muted-foreground">No moves yet</p>
          ) : (
            <div className="bg-muted p-4 rounded max-h-[400px] overflow-y-auto">
              <ol className="space-y-2">
                {moves.map((move, index) => (
                  <li key={move.id} className="flex justify-between">
                    <span>{Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'} {move.moveNotation}</span>
                    <span className="text-muted-foreground text-sm">
                      {move.isCapture ? 'capture' : ''}
                      {move.isCheck ? ' check' : ''}
                      {move.isCheckmate ? ' checkmate' : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}