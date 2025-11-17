import { UserRole } from "@prisma/client";
import { z } from "zod";
import { addressReqDataValidation } from "./address.validation";
import { profileDataValidation } from "./profile.validation";

// user validation schema via zod
const userSchema = z.object({
  body: z.object({
    email: z.string().trim(),
    password: z
      .string()
      .min(6)
      .max(16)
      .describe(
        "Password should be at least of 6 characters and maximum 16 char",
      ),
    isVerified: z.boolean().optional(),
    lastPasswordChangedAt: z.string().default(new Date().toISOString()),
    otp: z.number().optional(),
    otpExpires: z.string().optional(),
    profile: profileDataValidation.createProfile.shape.body,
    address: addressReqDataValidation.create.shape.body,
  }),
});

//  update user role validation schema
const updateRoleValidationSchema = z.object({
  body: z.object({
    email: z.string().email().trim(),
    role: z.enum([...Object.values(UserRole)] as [string, ...string[]]),
  }),
});

//  Change password validation schema
const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6).max(16),
    newPassword: z
      .string()
      .min(6)
      .max(16)
      .describe(
        "Password should be at least of 6 characters and maximum 16 char",
      ),
  }),
});

export const userReqDataValidation = {
  create: userSchema,
  roleUpdate: updateRoleValidationSchema,
  changePwd: changePasswordValidationSchema,
};
//////////////////////////// <- End -> ////////////////////////////////////////////
