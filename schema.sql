-- Chess App Database Schema

-- Create chess games table
CREATE TABLE IF NOT EXISTS chess_games (
  id SERIAL PRIMARY KEY,
  game_code VARCHAR(10) UNIQUE NOT NULL,
  fen_position TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT DEFAULT '',
  white_player_id TEXT,
  black_player_id TEXT,
  next_turn VARCHAR(5) NOT NULL DEFAULT 'white',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create game moves table
CREATE TABLE IF NOT EXISTS chess_moves (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES chess_games(id) ON DELETE CASCADE,
  move_notation VARCHAR(10) NOT NULL,
  fen_after_move TEXT NOT NULL,
  piece_moved VARCHAR(10) NOT NULL,
  from_square VARCHAR(2) NOT NULL,
  to_square VARCHAR(2) NOT NULL,
  is_capture BOOLEAN DEFAULT FALSE,
  is_check BOOLEAN DEFAULT FALSE,
  is_checkmate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_code ON chess_games(game_code);
CREATE INDEX IF NOT EXISTS idx_game_moves ON chess_moves(game_id); 