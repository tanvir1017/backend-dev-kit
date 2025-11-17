import { Redis } from "ioredis";
import env from "./clean-env";

export const redis = new Redis({
  host: env.REDIS_URL,
  port: env.REDIS_PROT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});
