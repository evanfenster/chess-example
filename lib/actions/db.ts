'use server';

import { createDb } from '../db/index';

// This function is a server action wrapper to get the DB
export async function getServerDb() {
  return createDb();
} 