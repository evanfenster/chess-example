'use server';

import { revalidatePath } from 'next/cache';
import * as GamesDB from '@/lib/games';

// Types
export type { GameStatus, ChessGame, ChessMove } from '@/lib/games';

interface CreateGameOptions {
  colorPreference?: 'white' | 'black' | 'random';
  playerId?: string;
}

interface GameMove {
  gameId: number;
  moveNotation: string;
  fenAfterMove: string;
  pieceMoved: string;
  fromSquare: string;
  toSquare: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
}

// Generate a unique game code
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new chess game
export async function createGame(options: CreateGameOptions = {}) {
  const { colorPreference = 'random', playerId } = options;
  
  // Generate a unique game code
  const gameCode = generateGameCode();
  
  // Determine player color based on preference
  let whitePlayerId = null;
  let blackPlayerId = null;
  
  if (playerId) {
    if (colorPreference === 'white') {
      whitePlayerId = playerId;
    } else if (colorPreference === 'black') {
      blackPlayerId = playerId;
    } else {
      // Random assignment
      if (Math.random() > 0.5) {
        whitePlayerId = playerId;
      } else {
        blackPlayerId = playerId;
      }
    }
  }
  
  try {
    return await GamesDB.createGameRecord(gameCode, whitePlayerId, blackPlayerId);
  } catch (error) {
    console.error('Error creating game:', error);
    throw new Error('Failed to create game');
  }
}

// Join an existing game
export async function joinGame(gameCode: string, playerId: string) {
  try {
    // Get the game
    const game = await GamesDB.getGameByCode(gameCode);
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Check if a spot is available
    if (!game.whitePlayerId) {
      const result = await GamesDB.updateGamePlayer(gameCode, playerId, 'white');
      revalidatePath(`/game/${gameCode}`);
      return result;
    } else if (!game.blackPlayerId) {
      const result = await GamesDB.updateGamePlayer(gameCode, playerId, 'black');
      revalidatePath(`/game/${gameCode}`);
      return result;
    } else {
      throw new Error('Game is full');
    }
  } catch (error) {
    console.error('Error joining game:', error);
    throw new Error('Failed to join game');
  }
}

// Get a game by its code
export async function getGameByCode(gameCode: string) {
  console.log('Server action: getGameByCode called with code:', gameCode);
  try {
    const game = await GamesDB.getGameByCode(gameCode);
    console.log('Server action: getGameByCode result:', game);
    return game;
  } catch (error) {
    console.error('Error getting game:', error);
    throw new Error('Failed to get game');
  }
}

// Make a move in a chess game
export async function makeMove(gameCode: string, move: GameMove) {
  try {
    // First, get the game to verify it exists and is active
    const game = await GamesDB.getGameByCode(gameCode);
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }
    
    // Update the game state
    const nextTurn = game.nextTurn === 'white' ? 'black' : 'white';
    const status = move.isCheckmate ? 'checkmate' : 'active';
    
    // Update game state
    await GamesDB.updateGameState(gameCode, move.fenAfterMove, nextTurn, status);
    
    // Record the move
    await GamesDB.recordMove(game.id, {
      moveNotation: move.moveNotation,
      fenAfterMove: move.fenAfterMove,
      pieceMoved: move.pieceMoved,
      fromSquare: move.fromSquare,
      toSquare: move.toSquare,
      isCapture: move.isCapture,
      isCheck: move.isCheck,
      isCheckmate: move.isCheckmate
    });
    
    // Get the updated game
    const updatedGame = await GamesDB.getGameByCode(gameCode);
    
    revalidatePath(`/game/${gameCode}`);
    return updatedGame;
  } catch (error) {
    console.error('Error making move:', error);
    throw new Error('Failed to make move');
  }
}

// Get all moves for a game
export async function getGameMoves(gameCode: string) {
  try {
    const game = await GamesDB.getGameByCode(gameCode);
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    return await GamesDB.getMovesByGameId(game.id);
  } catch (error) {
    console.error('Error getting game moves:', error);
    throw new Error('Failed to get game moves');
  }
}

// Update game status (resign or draw)
export async function updateGameStatus(gameCode: string, status: GamesDB.GameStatus) {
  try {
    await GamesDB.updateGameStatus(gameCode, status);
    
    revalidatePath(`/game/${gameCode}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating game status:', error);
    throw new Error('Failed to update game status');
  }
} 