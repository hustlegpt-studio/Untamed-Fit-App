import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";
import "./init-db";

const client = createClient({
  url: "file:.data/db.sqlite",
});

export const db = drizzle(client, { schema });
