import { z } from "zod";
import { couponManagementValidation } from "../validation/coupon-management.validation";

export type T_NewCoupon = z.infer<
  typeof couponManagementValidation.newCouponSchema
>["body"];

export type T_UpdateCoupon = z.infer<
  typeof couponManagementValidation.updateCouponSchema
>["body"];
