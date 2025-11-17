import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const newServiceManagement = z.object({
  body: z.object({
    orderType: z.enum(["Product", "Parcel"]),
    typeOfCharge: z.enum([
      "Percentage_of_products_amount",
      "Fixed_amount_for_each_pcs",
    ]),
    service: z.string(),
    fee: z.number().positive().min(0),
    status: z.enum([
      ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
    ]),
  }),
});

const updateServiceManagement = z.object({
  body: z.object({
    orderType: z.enum(["Product", "Parcel"]).optional(),
    typeOfCharge: z
      .enum(["Percentage_of_products_amount", "Fixed_amount_for_each_pcs"])
      .optional(),
    service: z.string().optional(),
    fee: z.number().positive().min(0).optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

export const serviceManagementValidation = {
  newServiceManagement,
  updateServiceManagement,
};
