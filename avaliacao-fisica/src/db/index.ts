import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Driver HTTP do Neon: funciona em ambiente serverless e atrás de proxies HTTPS.
export const db = drizzle(neon(process.env.DATABASE_URL ?? ''), { schema });
