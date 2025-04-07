import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Import all from schema to re-export
import * as schema from './schema';
export * from './schema';

// Define the DB type
type DrizzleDB = NeonHttpDatabase<typeof schema>;

// We create a singleton for the database connection
let db: DrizzleDB | undefined = undefined;

// This function creates a database connection or returns the existing one
export function createDb(): DrizzleDB {
  console.log('createDb called, db exists:', !!db);
  
  if (db) return db;
  
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('DATABASE_URL is not defined');
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    console.log('Creating new database connection...');
    const sql = neon(connectionString);
    
    db = drizzle(sql, { schema });
    console.log('Database connection created successfully');
    
    return db;
  } catch (error) {
    console.error('Error creating database connection:', error);
    throw error;
  }
} 