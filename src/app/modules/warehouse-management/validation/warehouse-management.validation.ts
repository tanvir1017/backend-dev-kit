import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const newWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    numberOfShelves: z.number().int().min(0),
    storagePerShelf: z.number().int().min(0),
    status: z.enum([
      ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
    ]),
  }),
});

const updateWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    numberOfShelves: z.number().int().min(0).optional(),
    storagePerShelf: z.number().int().min(0).optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

const updateStorageSchema = z.object({
  body: z
    .object({
      isFree: z.boolean(),
      status: z
        .enum([
          ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
        ])
        .optional(),
    })
    .strict(),
});

export const wareHouseValidation = {
  newWarehouseSchema,
  updateWarehouseSchema,
  updateStorageSchema,
};
