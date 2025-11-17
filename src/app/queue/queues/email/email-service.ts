import { emailQueue } from "./email-queue";

export const queueEmail = async (emailData: {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}) => {
  return await emailQueue.add("emails", emailData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5 seconds between retries
    },
    removeOnComplete: true, // Remove job from queue when completed
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  });
};
