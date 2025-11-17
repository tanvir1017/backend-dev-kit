import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const updateAdvertisingSchema = z.object({
  body: z.object({
    link: z.string().min(2).optional(),
    text: z.string().optional(),
    status: z.nativeEnum(NormalOrHiddenStatus).optional(),
  }),
});

export const advertisingValidation = {
  updateAdvertisingSchema,
};
