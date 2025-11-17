import { z } from "zod";
import { bulletinValidation } from "../validation/bulletin.validation";

export type T_NewBulletin = z.infer<
  typeof bulletinValidation.createNewBulletinSchema
>["body"];

export type T_UpdateBulletin = z.infer<
  typeof bulletinValidation.updateBulletinSchema
>["body"];
