import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationClient = postgres(process.env.DATABASE_URL as string, {max : 1});

const migration = async () : Promise<void> => {
    await migrate(drizzle(migrationClient), {migrationsFolder : './db/migrations'});
    await migrationClient.end();
}
migration();