import { z } from "zod";

const updateHelpCenterInfoSchema = z.object({
  body: z.object({
    whatsAppNumber: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const helpCenterInfoValidator = {
  updateHelpCenterInfoSchema,
};
