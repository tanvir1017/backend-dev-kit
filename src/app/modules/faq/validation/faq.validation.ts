import { z } from "zod";

const newFAQSchema = z.object({
  body: z.object({
    question: z.string().min(4),
    answer: z.string().min(4),
  }),
});

const updateFAQSchema = z.object({
  body: z.object({
    question: z.string().min(4).optional(),
    answer: z.string().min(4).optional(),
  }),
});

export const faqValidationSchema = {
  newFAQSchema,
  updateFAQSchema,
};
