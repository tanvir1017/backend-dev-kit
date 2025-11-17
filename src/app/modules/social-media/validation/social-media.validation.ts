import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const newSocialMediaSchema = z.object({
  body: z.object({
    link: z.string().min(3),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

const updateSocialMediaSchema = z.object({
  body: z.object({
    link: z.string().min(3).optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

export const socialMediaValidation = {
  newSocialMediaSchema,
  updateSocialMediaSchema,
};
