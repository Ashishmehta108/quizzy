import 'dotenv/config';
import postgres from "postgres"
import { drizzle } from "drizzle-orm/node-postgres";



const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client);
