import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não definida');
  await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' });
  console.log('Migrations aplicadas.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
