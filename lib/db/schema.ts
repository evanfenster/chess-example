import { pgTable, serial, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// Chess games table
export const chessGames = pgTable('chess_games', {
  id: serial('id').primaryKey(),
  gameCode: varchar('game_code', { length: 10 }).notNull().unique(),
  fenPosition: text('fen_position').notNull().default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
  pgn: text('pgn').default(''),
  whitePlayerId: varchar('white_player_id', { length: 255 }),
  blackPlayerId: varchar('black_player_id', { length: 255 }),
  nextTurn: varchar('next_turn', { length: 5 }).notNull().default('white'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => {
  return {
    gameCodeIdx: index('idx_game_code').on(table.gameCode)
  };
});

// Chess moves table
export const chessMoves = pgTable('chess_moves', {
  id: serial('id').primaryKey(),
  gameId: serial('game_id').references(() => chessGames.id, { onDelete: 'cascade' }),
  moveNotation: varchar('move_notation', { length: 10 }).notNull(),
  fenAfterMove: text('fen_after_move').notNull(),
  pieceMoved: varchar('piece_moved', { length: 10 }).notNull(),
  fromSquare: varchar('from_square', { length: 2 }).notNull(),
  toSquare: varchar('to_square', { length: 2 }).notNull(),
  isCapture: boolean('is_capture').default(false),
  isCheck: boolean('is_check').default(false),
  isCheckmate: boolean('is_checkmate').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => {
  return {
    gameIdIdx: index('idx_game_moves').on(table.gameId)
  };
});

// Types based on the schema
export type ChessGame = typeof chessGames.$inferSelect;
export type NewChessGame = typeof chessGames.$inferInsert;

export type ChessMove = typeof chessMoves.$inferSelect;
export type NewChessMove = typeof chessMoves.$inferInsert; 