import { Prisma } from "@prisma/client";
import { TErrorSource, TReturnError } from "../interface/erros/error";

export const handlePrismaUniqueConstraintError = (
  error: Prisma.PrismaClientKnownRequestError,
): TReturnError => {
  const statusCode = 409;

  // @ts-ignore
  const fieldName = error?.meta?.target?.split("_")?.[1] || "This field";
  const message = `${fieldName} is already in use. Please try a different one.`;

  const errorSources: TErrorSource[] = [
    {
      path: (error?.meta?.target as string) || "",
      message: "Unique constraint failed for this path or field.",
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError,
): TReturnError => {
  const statusCode = 400;

  // ? PrismaClientValidationError messages are long strings; you can optionally try to parse them more deeply.
  const message = "ORM Validation error";

  const errorSources: TErrorSource[] = [
    {
      path: error.name,
      message: `Invalid value for ${error.name}. Expected String`,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export const handlePrismaCastError = (
  error: Prisma.PrismaClientKnownRequestError,
): TReturnError => {
  const statusCode = 400;
  const message = "Invalid data type or format provided.";

  return {
    statusCode,
    message,
    errorSources: [
      {
        path: (error?.meta?.modelName as string) || "",
        message:
          (error.meta?.message as string) || "Invalid input data format.",
      },
    ],
  };
};

export const handleForeignKeyConstraintViolation = (
  error: Prisma.PrismaClientKnownRequestError,
): TReturnError => {
  const statusCode = 400;
  const message = "Foreign key constraint violation.";

  return {
    statusCode,
    message,
    errorSources: [
      {
        path: "",
        message:
          "Cannot delete or update this record because it is referenced by another record.",
      },
    ],
  };
};
