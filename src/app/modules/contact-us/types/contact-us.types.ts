import { ContactUsStatus } from "@prisma/client";
import { z } from "zod";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import { contactUsValidation } from "../validation/contact-us.validation";

export type T_NewContactUs = z.infer<typeof contactUsValidation.create>["body"];

export type T_UpdateContactUs = z.infer<
  typeof contactUsValidation.updateStatusSchema
>["body"];

export interface I_ContactUsQuery extends I_PaginationOptions {
  q: string;
  status: ContactUsStatus;
}
