import { OauthMethod } from "@prisma/client";

import {
  hashPwd,
  validateEncryptedPassword,
} from "../../../../lib/utils/encryption";
import { verifyToken } from "../../../../lib/utils/verify-token.utils";
import env from "../../../config/clean-env";
import {
  forgetPwdVerificationOtp,
  verificationOtp,
} from "../../../emails/templates/verification-otp";
import AppError from "../../../errors/appError";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { queueEmail } from "../../../queue/queues/email/email-service";

import { HttpStatusCode } from "axios";
import { userRepository } from "../../user-account/user/repository/user.repository";
import { generateEmailVerificationToken } from "../../user-account/user/utils/verification-token";
import { T_ReqSourceType } from "../types/auth.types";
import { createCookie } from "../utils/auth.utils";
import generateOTP from "../utils/genOtp.utils";
export const authServices = {
  // User login service
  login: async (payload: {
    email: string;
    password: string;
    reqSource: T_ReqSourceType;
  }) => {
    const user = await userRepository.getUserByMail({
      email: payload.email,
      omitPwd: false,
    });

    if (!user) {
      throw new AppError(HttpStatusCode.NotFound, "User doesn't exist");
    }

    if (payload.reqSource !== "dash" && !user.isVerified) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "Please verify your email before login!",
      );
    }

    // if user is blocked
    if (user.isBlocked) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "Your account was blocked by the system! Please contact support!",
      );
    }

    // if user is blocked
    if (!user.authMethod.includes(OauthMethod.EMAIL_PASS)) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "This action is only available for accounts created with email and password!",
      );
    }

    if (
      payload.reqSource !== "web" &&
      !user.authMethod.includes(OauthMethod.EMAIL_PASS)
    ) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Please try to login with email and password!",
      );
    }

    // validate the password
    if (!(await validateEncryptedPassword(payload.password, user.password))) {
      throw new AppError(HttpStatusCode.BadRequest, "Credentials mismatch!");
    }

    // All payload should include these data for consistency
    const jwtPayload: I_GlobalJwtPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      lastPasswordChangedAt: user.lastPasswordChangedAt,
    };

    const accessToken = createCookie(jwtPayload, "Access");

    // A token with  15 days of expiry
    const refreshToken = createCookie(jwtPayload, "Refresh");

    return {
      accessToken,
      refreshToken,
    };
  },

  // Send forget password email to reset the password

  sendForgotPasswordOTPEmail: async (email: string) => {
    const isUserExist = await userRepository.getUserByMail({ email: email });

    if (!isUserExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User doesn't exist by this email!",
      );
    }

    // if user is blocked
    if (isUserExist.isBlocked) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Your account was blocked by the system! Please contact support!",
      );
    }

    // if user already verified
    if (!isUserExist.isVerified) {
      throw new AppError(HttpStatusCode.BadRequest, "User not verified!");
    }

    // 01. Generate a OTP
    const generateSixDigitOpOTP = generateOTP(email);

    // 02. Save the otp in DB with expiry
    await userRepository.updateUserInfo(isUserExist.id, {
      otp: Number(generateSixDigitOpOTP.otp),
      otpExpires: generateSixDigitOpOTP.token,
    });

    // 03. Send the email
    await queueEmail({
      to: email,
      subject: "Your reset password OTP",
      html: forgetPwdVerificationOtp(String(generateSixDigitOpOTP.otp)),
    });

    return null;
    //
  },

  // Re-send verification mail
  resendOPTEmail: async ({
    email,
    isFPwd,
  }: {
    email: string;
    isFPwd?: boolean;
  }) => {
    const isUserExist = await userRepository.getUserByMail({ email: email });

    if (!isUserExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User doesn't exist by this email!",
      );
    }

    // if user is blocked
    if (isUserExist.isBlocked) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Your account was blocked by the system! Please contact support!",
      );
    }

    // Only check verification for non-forgot-password flows
    if (!isFPwd) {
      // if user already verified AND this is NOT forgot password flow
      if (isUserExist.isVerified) {
        throw new AppError(HttpStatusCode.BadRequest, "User already verified!");
      }
    }

    // 01. Generate a OTP
    const generateSixDigitOpOTP = generateOTP(email);

    // 02. Save the otp in DB with expiry
    await userRepository.updateUserInfo(isUserExist.id, {
      otp: Number(generateSixDigitOpOTP.otp),
      otpExpires: generateSixDigitOpOTP.token,
    });

    // 03. Send the email
    await queueEmail({
      to: email,
      subject: `Your ${isFPwd ? "reset password" : "verification"} OTP`,
      html: verificationOtp(String(generateSixDigitOpOTP.otp)),
    });

    return null;
  },

  // Verify the otp
  verifyTheOTP: async (payload: { email: string; otp: number }) => {
    // make a otp verification logic with jwt expires
    const user = await userRepository.getUserByMail({ email: payload.email });

    if (!user) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User doesn't exist by this email!",
      );
    }

    // if user is blocked
    if (user.isBlocked) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Your account was blocked by the system! Please contact support!",
      );
    }

    // if user already verified
    if (user.isVerified) {
      throw new AppError(HttpStatusCode.BadRequest, "User already verified!");
    }

    // if otpexpires is null
    if (!user.otpExpires) {
      throw new AppError(
        HttpStatusCode.BadGateway,
        "Invalid request for verifying OTP!",
      );
    }
    // check if the token is expired or not
    const isTokenExpired = verifyToken(user.otpExpires, env.JWT_OTP_TOKEN) as {
      email: string;
      otp: string;
    };

    if (Number(payload.otp) !== Number(isTokenExpired.otp)) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid OTP!");
    }

    await userRepository.updateUserInfo(user.id, {
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    return null;
  },

  // Verify the otp for forget password

  verifyTheForgetPwdOtp: async ({
    email,
    otp,
  }: {
    email: string;
    otp: number;
  }) => {
    const user = await userRepository.getUserByMail({ email: email });

    if (!user) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User doesn't exist by this email!",
      );
    }

    // if user is blocked
    if (user.isBlocked) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Your account was blocked by the system! Please contact support!",
      );
    }

    // if user already verified
    if (!user.isVerified) {
      throw new AppError(HttpStatusCode.BadRequest, "User is not verified!");
    }

    // if otpexpires is null
    if (!user.otpExpires) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Invalid request for verifying OTP!",
      );
    }
    // check if the token is expired or not
    const isTokenExpired = verifyToken(user.otpExpires, env.JWT_OTP_TOKEN) as {
      email: string;
      otp: string;
    };

    if (Number(otp) !== Number(isTokenExpired.otp)) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid OTP!");
    }

    if (isTokenExpired.email !== email) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Invalid request for verifying OTP!",
      );
    }

    await userRepository.updateUserInfo(user.id, {
      otp: null,
      otpExpires: null,
    });

    return generateEmailVerificationToken(user.email);
  },

  // After verification of the forgotten password otp user can reset the password
  resetPwd: async (payload: { token: string; newPassword: string }) => {
    const vrifyToken = verifyToken(
      payload.token,
      env.JWT_EMAIL_VERIFICATION_TOKEN,
    );

    const user = await userRepository.getUserByMail({
      email: vrifyToken.email,
    });

    if (!user) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User doesn't exist by this email!",
      );
    }

    // change the password with hash
    const hashUserPwd = await hashPwd(payload.newPassword);

    // update the password
    await userRepository.updateUserInfo(user.id, {
      password: hashUserPwd,
    });

    return null;
  },
};
