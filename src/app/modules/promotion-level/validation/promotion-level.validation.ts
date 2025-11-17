import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const newPromotionalLevelSchema = z.object({
  body: z.object({
    promotionLevelTips: z.string(),
    experienceThreshold: z.number().positive().min(0, "Minimum value 0"),
    commissionRateTips: z.number().positive().min(0, "Minimum value 0"),
    status: z.enum([
      ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
    ]),
  }),
});

const updatePromotionalLevelSchema = z.object({
  body: z.object({
    promotionLevelTips: z.string().optional(),
    experienceThreshold: z
      .number()
      .positive()
      .min(0, "Minimum value 0")
      .optional(),
    commissionRateTips: z
      .number()
      .positive()
      .min(0, "Minimum value 0")
      .optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

export const promotionLevelValidation = {
  newPromotionalLevelSchema,
  updatePromotionalLevelSchema,
};
