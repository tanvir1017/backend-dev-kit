import { z } from "zod";

const createNewInternshipLevelSchema = z.object({
  body: z
    .object({
      gradeName: z.string().min(1),
      totalCost: z.number().min(0),
      internationalFreightDiscount: z.number().min(0),
    })
    .strict(),
});

const updateInternshipLevelSchema = z.object({
  body: z.object({
    gradeName: z.string().min(1).optional(),
    totalCost: z.number().min(0).optional(),
    internationalFreightDiscount: z.number().min(0).optional(),
  }),
});

export const membershipLevelValidation = {
  createNewInternshipLevelSchema,
  updateInternshipLevelSchema,
};
