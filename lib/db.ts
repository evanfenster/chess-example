import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Create a singleton database connection
const sql: NeonQueryFunction<any, any> = neon(process.env.DATABASE_URL!);

export { sql }; 