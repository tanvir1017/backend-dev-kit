import { z } from "zod";
import { membershipLevelValidation } from "../validation/membership-level.validation";

export type T_MembershipLevel = z.infer<
  typeof membershipLevelValidation.createNewInternshipLevelSchema
>["body"];

export type T_UpdateMembershipLevel = z.infer<
  typeof membershipLevelValidation.updateInternshipLevelSchema
>["body"];
