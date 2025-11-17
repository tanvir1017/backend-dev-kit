import { User, UserRole } from "@prisma/client";
import { Router } from "express";
import passport from "passport";
import { urlFrontEnd } from "../../../../lib/utils/baseUrl";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { authControllers } from "../controller/auth.controller";
import {
  createCookie,
  setAccessToken,
  setRefreshToken,
} from "../utils/auth.utils";

const authRouter: Router = Router();

// Login authentication
authRouter.route("/login").post(authControllers.login);

// Re-send verification OTP
authRouter
  .route("/resend-verification-otp")
  .post(authControllers.resendVerificationOTPToEmail);

// Forget password
authRouter.route("/forget-pwd").post(authControllers.forgotPassword);

// Verify OTP
authRouter.route("/verify-otp").post(authControllers.verifyOTP);

authRouter
  .route("/verify-forget-pwd-otp")
  .post(authControllers.forgetPwdVerificationOtp);

authRouter.route("/reset-pwd").patch(authControllers.resetPassword);

// Logout
authRouter.route("/logout").post(authControllers.logout);

export const authRoutes = authRouter;

// Initiate Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      // "https://www.googleapis.com/auth/userinfo.profile",
      // "https://www.googleapis.com/auth/user.addresses.read",
    ],
  }),
);

// Google callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${urlFrontEnd}/login?status=oauth_failed`,
  }),
  (req, res) => {
    /* 
    console.log("🚀 ~ req:", req);
    user: {
      id: '69008e153c3b03454901aec7',
      password: '$2b$10$f.pEcx2ZaybRVEgLyg2m5e11u4UG2/vL10Cd/EFwY1XSOgp6kDl/S',
      email: 'teambinary.smt@gmail.com',
      role: 'MEMBER',
      memberId: 'team25102875',
      lastPasswordChangedAt: 2025-10-28T09:34:13.104Z,
      isVerified: true,
      isBlocked: false,
      authMethod: 'GOOGLE',
      otp: null,
      otpExpires: null,
      stripeCustomerId: null,
      memberPoints: 0,
      googleId: '102042087132700096717',
      facebookId: null,
      createdAt: 2025-10-28T09:34:13.104Z,
      updatedAt: 2025-10-28T09:34:13.104Z
    }, */
    // Generate JWT token and set cookie (same as your manual login)
    const user = req.user as User;
    const jwtPayload: I_GlobalJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      lastPasswordChangedAt: new Date(),
    };

    setAccessToken(res, createCookie(jwtPayload, "Access"));
    setRefreshToken(res, createCookie(jwtPayload, "Refresh"));

    res.redirect(
      `${urlFrontEnd}/login?status=oauth_success?token=${createCookie(jwtPayload, "Access")}`,
    );
  },
);
