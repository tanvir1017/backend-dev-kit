import { z } from "zod";
import { countryCodeEnum } from "../../../constant";

const newContactUsSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phoneNumber: z.string(),
    phoneCountryCode: countryCodeEnum,
    orderId: z.string(),
    message: z.string().min(4, "Enter minimum 6 character message"),
    searchText: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["Read", "Replied", "Unread"]),
  }),
});

export const contactUsValidation = {
  create: newContactUsSchema,
  updateStatusSchema,
};
