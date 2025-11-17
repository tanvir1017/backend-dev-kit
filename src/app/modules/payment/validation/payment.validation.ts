import { z } from "zod";

//  Change password validation schema
const initRefundAmount = z.object({
  body: z.object({
    userId: z.string().min(24).max(24).describe("Member id must be provided!"),
    amount: z.number().nonnegative(),
    reason: z.string(),
    paymentId: z
      .string()
      .min(24)
      .max(24)
      .describe("Payment id must be provided!"),
    stripeChargeId: z.string().describe("stripe charge id must be provided!"),
  }),
});

//  Change password validation schema
const initiateProductShipping = z.object({
  body: z.object({
    products: z.array(
      z.string().min(24).max(24).describe("Product id must be provided!"),
    ),
    addressId: z
      .string()
      .min(24)
      .max(24)
      .describe("Address id must be provided!"),
    shippingId: z
      .string()
      .min(24)
      .max(24)
      .describe("Shipping id must be provided!"),
    couponCodeId: z
      .string()
      .min(24)
      .max(24)
      .describe("Coupon code id must be provided!")
      .optional(),
    insurance: z
      .string()
      .min(24)
      .max(24)
      .describe("Insurance id must be provided")
      .optional(),
  }),
});

export const paymentInputDataValidation = {
  initRefundAmount,
  initiateProductShipping,
};
//////////////////////////// <- End -> ////////////////////////////////////////////
