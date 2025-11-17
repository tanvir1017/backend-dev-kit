import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const newCouponSchema = z.object({
  body: z
    .object({
      couponName: z.string().min(1),
      promoCode: z.string().min(1),
      couponType: z.enum(["Full_Reduction", "Discount"]),
      couponUse: z.enum(["All", "Order", "Waybill"]),
      fullAmount: z.number().positive().min(0),
      discount: z.number().positive().min(0),
      total: z.number().positive().min(0),
      maximumAmount: z.number().positive().min(0),
      startingTime: z.coerce.date(),
      endingTime: z.coerce
        .date()
        .refine(
          (date) => date > new Date(),
          "Ending time must be in the future",
        ),
      validityPeriodDays: z.number().positive().min(0),
      status: z.enum([
        ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
      ]),
    })
    .refine((data) => data.endingTime > data.startingTime, {
      message: "Ending time must be after starting time",
      path: ["endingTime"], // This shows the error on the endingTime field
    }),
});

const updateCouponSchema = z.object({
  body: z
    .object({
      couponName: z.string().min(1).optional(),
      promoCode: z.string().min(1).optional(),
      couponType: z.enum(["Full_Reduction", "Discount"]).optional(),
      couponUse: z.enum(["All", "Order", "Waybill"]).optional(),
      fullAmount: z.number().positive().min(0).optional(),
      discount: z.number().positive().min(0).optional(),
      total: z.number().positive().min(0).optional(),
      maximumAmount: z.number().positive().min(0).optional(),
      startingTime: z.coerce.date().optional(),
      endingTime: z.coerce
        .date()
        .refine(
          (date) => date > new Date(),
          "Ending time must be in the future",
        )
        .optional(),
      validityPeriodDays: z.number().positive().min(0).optional(),
      status: z
        .enum([
          ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
        ])
        .optional(),
    })
    .refine(
      ({ endingTime, startingTime }) => {
        // Only validate if both dates are provided
        if (!endingTime || !startingTime) return true;
        return endingTime > startingTime;
      },
      {
        message: "Ending time must be after starting time",
        path: ["endingTime"],
      },
    ),
});

export const couponManagementValidation = {
  newCouponSchema,
  updateCouponSchema,
};
