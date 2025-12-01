import "dotenv/config";
import path from "path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "models"),
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
