import { eq, desc } from 'drizzle-orm';
import { createDb } from './db/index';
import { chessGames, chessMoves } from './db/schema';
import type { ChessGame, ChessMove, NewChessGame, NewChessMove } from './db/schema';

// Types
export type GameStatus = 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

// Re-export types from schema
export type { ChessGame, ChessMove };

// Helper function to get DB connection
const getDb = () => createDb();

// Create a new chess game record
export async function createGameRecord(
  gameCode: string,
  whitePlayerId: string | null,
  blackPlayerId: string | null
): Promise<ChessGame> {
  const db = getDb();
  const result = await db.insert(chessGames).values({
    gameCode,
    whitePlayerId,
    blackPlayerId,
  }).returning();
  
  return result[0];
}

// Get a game by code
export async function getGameByCode(gameCode: string): Promise<ChessGame | null> {
  console.log('DB function: Getting game by code:', gameCode);
  const db = getDb();
  try {
    const results = await db.select().from(chessGames).where(eq(chessGames.gameCode, gameCode));
    console.log('DB function: Game query results:', results);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('DB error getting game:', error);
    throw error;
  }
}

// Update player in game
export async function updateGamePlayer(
  gameCode: string,
  playerId: string,
  color: 'white' | 'black'
): Promise<ChessGame> {
  const db = getDb();
  const updateData = color === 'white' 
    ? { whitePlayerId: playerId }
    : { blackPlayerId: playerId };
    
  const result = await db.update(chessGames)
    .set(updateData)
    .where(eq(chessGames.gameCode, gameCode))
    .returning();
  
  return result[0];
}

// Update game state after a move
export async function updateGameState(
  gameCode: string,
  fenPosition: string,
  nextTurn: 'white' | 'black',
  status: GameStatus
): Promise<ChessGame> {
  const db = getDb();
  const result = await db.update(chessGames)
    .set({
      fenPosition,
      nextTurn,
      status,
      updatedAt: new Date(),
    })
    .where(eq(chessGames.gameCode, gameCode))
    .returning();
  
  return result[0];
}

// Record a chess move
export async function recordMove(
  gameId: number,
  moveData: {
    moveNotation: string;
    fenAfterMove: string;
    pieceMoved: string;
    fromSquare: string;
    toSquare: string;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
  }
): Promise<ChessMove> {
  const db = getDb();
  const result = await db.insert(chessMoves).values({
    gameId,
    moveNotation: moveData.moveNotation,
    fenAfterMove: moveData.fenAfterMove,
    pieceMoved: moveData.pieceMoved,
    fromSquare: moveData.fromSquare,
    toSquare: moveData.toSquare,
    isCapture: moveData.isCapture,
    isCheck: moveData.isCheck,
    isCheckmate: moveData.isCheckmate,
  }).returning();
  
  return result[0];
}

// Get all moves for a game
export async function getMovesByGameId(gameId: number): Promise<ChessMove[]> {
  const db = getDb();
  return db.select()
    .from(chessMoves)
    .where(eq(chessMoves.gameId, gameId))
    .orderBy(chessMoves.createdAt);
}

// Update game status
export async function updateGameStatus(
  gameCode: string,
  status: GameStatus
): Promise<ChessGame> {
  const db = getDb();
  const result = await db.update(chessGames)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(chessGames.gameCode, gameCode))
    .returning();
  
  return result[0];
} 