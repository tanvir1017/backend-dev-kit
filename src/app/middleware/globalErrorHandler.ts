import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import env from "../config/clean-env";
import {
  handleForeignKeyConstraintViolation,
  handlePrismaCastError,
  handlePrismaUniqueConstraintError,
  handlePrismaValidationError,
} from "../errors/ORMSchemaError";
import AppError from "../errors/appError";
import TaobaoError from "../errors/taobaoError";
import handleZodError from "../errors/zodError";
import { TErrorSource } from "../interface/erros/error";
import { taobaoErrorMap } from "../modules/taobao/utils/taobaoErrorMap";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  __next: NextFunction,
) => {
  // Default values
  let statusCode = 500;
  let message = (error as Error).message || "Something went wrong!";
  let errorSources: TErrorSource[] = [
    { path: "", message: "Something went wrong!" },
  ];
  let errorField = "";
  let errorCode = "";
  let reason = "";
  let extraInfo = "";
  let data: any = null;

  // 🟢 Taobao API Error Handling (axios response with Taobao error)
  if (error?.response?.data?.error && error?.response?.data?.error_code) {
    const taobaoData = error.response.data;
    const mapping = taobaoErrorMap[taobaoData.error_code] || {
      statusCode: 500,
      extraInfo: "Unknown Taobao error occurred.",
    };

    statusCode = mapping.statusCode;
    message = taobaoData.error;
    errorField = taobaoData.error;
    errorCode = taobaoData.error_code;
    reason = taobaoData.reason || "";
    extraInfo = mapping.extraInfo;
    data = null;
    errorSources = [
      {
        path: taobaoData.reason,
        message: taobaoData.error,
      },
    ];
  }

  // 🟢 Zod validation error
  else if (error instanceof ZodError) {
    const simplified = handleZodError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorSources = simplified.errorSources;
  }

  // 🟢 Prisma ORM errors

  // Prisma unique constraint violation (P2002)
  else if (error.code === "P2002") {
    // e.g., trying to create a user with an existing unique email
    const prismaError = handlePrismaUniqueConstraintError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorSources = prismaError.errorSources;
  }

  // Prisma client validation error (schema validation)
  else if (error instanceof Prisma.PrismaClientValidationError) {
    // e.g., invalid data type or missing required field
    const prismaError = handlePrismaValidationError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorSources = prismaError.errorSources;
  }

  // Prisma cast error (P2023)
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2023"
  ) {
    // e.g., invalid ID type for a query (string instead of number)
    const prismaError = handlePrismaCastError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorSources = prismaError.errorSources;
  }

  // Prisma foreign key constraint violation (P2003)
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    // e.g., trying to delete a parent record while children exist
    const prismaError = handleForeignKeyConstraintViolation(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorSources = prismaError.errorSources;
  }

  // Prisma initialization error
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    // e.g., invalid database URL or cannot connect to DB
    statusCode = 500;
    message = "Invalid database URL or connection string.";
    extraInfo =
      "Can't reach database server. Please make sure it's running and accessible.";
  }
  // 🟢 Custom TaobaoError
  else if (error instanceof TaobaoError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [{ path: "", message: error.message }];
    errorField = error.taobao.error || "";
    errorCode = error.taobao.errorCode || "";
    reason = error.taobao.reason || "";
    extraInfo = error.taobao.extraInfo || "";
  }
  // 🟢 Custom AppError
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [{ path: "", message: error.message }];
  }

  // 🟢 Generic JS Error
  else if (error instanceof Error) {
    message = error.message;
    errorSources = [{ path: "", message: error.message }];
  }

  // Unified response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: errorField,
    errorCode,
    reason,
    extraInfo,
    data,
    errorSources,
    stack: env.isProd ? null : error?.stack,
  });
};

export default globalErrorHandler;
