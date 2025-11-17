import { z } from "zod";
import { dashUserInputValidation } from "../validation/dashboard-user.validation";
import { profileDataValidation } from "../validation/profile.validation";

export interface I_UserQueryParams {
  page: string;
  limit: string;
  sort?: "asc" | "desc";
  filter?: string;
}

// ** Inhering type from zod
export type T_DashUserSchema = z.infer<
  typeof dashUserInputValidation.dashUserSchema
>;
// Type from zod
export type T_ChangeRole = z.infer<typeof dashUserInputValidation.roleUpdate>;
export type T_ProfileSchema = z.infer<
  typeof profileDataValidation.createProfile
>;
