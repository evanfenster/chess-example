import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables from .env.development.local
dotenv.config({ path: '.env.development.local' });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Connecting to database...');
  const sql = neon(process.env.DATABASE_URL);
  
  // Use SQL directly to create the tables
  console.log('Creating database tables...');
  
  // Drop existing tables if they exist (for fresh start)
  try {
    console.log('Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS chess_moves`;
    await sql`DROP TABLE IF EXISTS chess_games`;
    console.log('Tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
  
  // Create chess_games table
  console.log('Creating chess_games table...');
  await sql`
    CREATE TABLE IF NOT EXISTS chess_games (
      id SERIAL PRIMARY KEY,
      game_code VARCHAR(10) UNIQUE NOT NULL,
      fen_position TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn TEXT DEFAULT '',
      white_player_id VARCHAR(255),
      black_player_id VARCHAR(255),
      next_turn VARCHAR(5) NOT NULL DEFAULT 'white',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  
  // Create chess_moves table
  console.log('Creating chess_moves table...');
  await sql`
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
    )
  `;
  
  // Create indexes
  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_game_code ON chess_games(game_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_game_moves ON chess_moves(game_id)`;
  
  console.log('Database schema created successfully!');
}

main().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
}); 