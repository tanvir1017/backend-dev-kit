import { Elysia } from "elysia";

export const authMiddleware = new Elysia({ name: "Middleware.Auth" })
  .use(authService)
  .derive(async ({ headers, verifyToken }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isAuthenticated: false };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { isAuthenticated: false };
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      user: {
        id: payload.userId,
        role: String(payload.role),
      },
    };
  })
  .macro({
    authorize: (roles: string[] = ["user", "admin"]) => ({
      beforeHandle: async ({ isAuthenticated, user, error }) => {
        if (!isAuthenticated) {
          return error(401, {
            status: "error",
            message: "Unauthorized: You must be signed in",
          });
        }

        if (roles.length && !roles.includes((user?.role as string) || "")) {
          return error(403, {
            status: "error",
            message: "Forbidden: Insufficient permissions",
          });
        }
      },
    }),
  })
  .as("global");
