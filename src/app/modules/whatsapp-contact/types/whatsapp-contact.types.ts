import { z } from "zod";
import { whatsappContactValidation } from "../validation/whatsapp-contact.validation";

export type T_WhatsappContactUpdate = z.infer<
  typeof whatsappContactValidation.updateWhatsappContactSchema
>["body"] & {
  imageUrl: string;
  description: string;
};
