import { UserRole } from "@prisma/client";

export const APP_CONFIG = {
  API_ENDPOINT: "http://localhost:3000/api",
  MAX_RETRIES: 3, // Use full for retry the same things by while loop. e.g, api call max retries
  ROLES: [...Object.values(UserRole)] as const,
};
