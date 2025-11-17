import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const createNewBulletinSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    eventName: z.string().min(2),
    status: z.enum([
      ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
    ]),
  }),
});

const updateBulletinSchema = z.object({
  body: z.object({
    date: z.coerce.date().optional(),
    eventName: z.string().min(2).optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

export const bulletinValidation = {
  createNewBulletinSchema,
  updateBulletinSchema,
};
