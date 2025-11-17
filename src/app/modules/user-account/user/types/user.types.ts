import { z } from "zod";
import { profileDataValidation } from "../validation/profile.validation";
import { userReqDataValidation } from "../validation/user.validation";

export interface I_UserQueryParams {
  page: string;
  limit: string;
  sort?: "asc" | "desc";
  filter?: string;
}

// ** Inhering type from zod
export type T_UserSchema = z.infer<typeof userReqDataValidation.create>;
// Type from zod
export type T_ChangeRole = z.infer<typeof userReqDataValidation.roleUpdate>;
export type T_ProfileSchema = z.infer<
  typeof profileDataValidation.createProfile
>;
