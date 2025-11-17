import { Queue } from "bullmq";
import { redis } from "../../../config/redis-connection";

export const emailQueue = new Queue("emails", {
  connection: redis,
});
