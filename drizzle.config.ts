import type { Config } from "drizzle-kit";

import { env } from "./src/dal/database/data/env/server";

export default {
  schema: "./src/dal/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["example_*"],
} satisfies Config;
