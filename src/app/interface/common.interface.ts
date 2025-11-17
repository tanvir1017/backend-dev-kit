import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

/* JWT Payload */
export interface I_GlobalJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  lastPasswordChangedAt: string | Date;
}

export interface I_PaginationResponse<T> {
  meta: {
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  result: T;
}

// Prisma types and interfaces
export type T_PrismaModelOmittedProp = "id" | "createdAt" | "updatedAt";
