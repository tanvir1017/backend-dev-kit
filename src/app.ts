// import { errorHandler } from "@/interface/middleware/error-handler";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { errorHandler } from "./app/middleware/error-handler.middleware";
import { v1Routes } from "./app/router/v1";

export const createServer = (port: number = 3000) => {
  return new Elysia()
    .use(cors())
    .use(
      openapi({
        path: "/docs",
        documentation: {
          info: {
            title: "ElysiaJS + Prisma ",
            version: "1.0.0",
          },
        },
      })
    )

    .use(errorHandler)
    .use(v1Routes)

    .get("/health", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }))

    .listen(port);
};
