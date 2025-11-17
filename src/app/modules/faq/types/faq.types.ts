import { z } from "zod";
import { faqValidationSchema } from "../validation/faq.validation";

export type T_CreateFAQ = z.infer<
  typeof faqValidationSchema.newFAQSchema
>["body"];

export type T_UpdateFAQ = z.infer<
  typeof faqValidationSchema.updateFAQSchema
>["body"];
