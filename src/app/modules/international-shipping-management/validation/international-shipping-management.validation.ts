import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const create = z.object({
  body: z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    billingType: z.enum(["volumetric", "actual", "whichever"]),
    shippingTimeRange: z.string().min(1, "Shipping time range is required"),
    firstWeightG: z.number().int().positive(),
    continueG: z.number().int().positive(),
    firstCharge: z.number().positive(),
    renewalCharge: z.number().positive(),
    fuelCost: z.number().nonnegative(),
    customsFee: z.number().nonnegative(),
    serviceCharge: z.number().nonnegative(),
    volumeRatio: z.number().positive(),
    freeShippingAmt: z.number().nonnegative(),
    floatingWeight: z.number().positive(),
    maxHeightCm: z.number().positive(),
    minWeightG: z.number().positive(),
    maxWeightG: z.number().positive(),
    maxLengthCm: z.number().positive(),
    maxWidthCm: z.number().positive(),
    supportedCountries: z.array(z.string()).nonempty(),
    nation: z.string().min(1, "Nation name is required"),
    status: z.nativeEnum(NormalOrHiddenStatus).default("NORMAL"),
    description: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    billingType: z.enum(["volumetric", "actual", "whichever"]).optional(),
    shippingTimeRange: z.string().optional(),
    firstWeightG: z.number().int().positive().optional(),
    continueG: z.number().int().positive().optional(),
    firstCharge: z.number().positive().optional(),
    renewalCharge: z.number().positive().optional(),
    fuelCost: z.number().nonnegative().optional(),
    customsFee: z.number().nonnegative().optional(),
    serviceCharge: z.number().nonnegative().optional(),
    volumeRatio: z.number().positive().optional(),
    freeShippingAmt: z.number().nonnegative().optional(),
    floatingWeight: z.number().positive().optional(),
    maxHeightCm: z.number().positive().optional(),
    minWeightG: z.number().positive().optional(),
    maxWeightG: z.number().positive().optional(),
    maxLengthCm: z.number().positive().optional(),
    maxWidthCm: z.number().positive().optional(),
    supportedCountries: z.array(z.string()).optional(),
    nation: z.string().optional(),
    status: z.nativeEnum(NormalOrHiddenStatus).optional(),
    description: z.string().optional(),
  }),
});
export const shippingProviderValidation = {
  create,
  update,
};
