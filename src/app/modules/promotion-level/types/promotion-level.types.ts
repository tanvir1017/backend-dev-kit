import { z } from "zod";
import { promotionLevelValidation } from "../validation/promotion-level.validation";

export type T_NewPromotionalLevel = z.infer<
  typeof promotionLevelValidation.newPromotionalLevelSchema
>["body"];

export type T_UpdatePromotionalLevel = z.infer<
  typeof promotionLevelValidation.updatePromotionalLevelSchema
>["body"];
