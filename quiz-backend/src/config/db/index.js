import 'dotenv/config';
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";



const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client);
