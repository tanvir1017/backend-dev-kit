import { Elysia } from "elysia";

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`[${code}]`, error);

    set.status =
      code === "VALIDATION"
        ? 400
        : code === "NOT_FOUND"
        ? 404
        : code === "PARSE"
        ? 400
        : 500;

    if (code === "VALIDATION") {
      return {
        status: "error",
        message: "Validation error",
        errors: error.all,
      };
    }

    return {
      status: "error",
      message: (error as Error).message || "An unexpected error occurred",
    };
  })
  .as("scoped");
