import { z } from "zod";

const updateWhatsappContactSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const whatsappContactValidation = {
  updateWhatsappContactSchema,
};
