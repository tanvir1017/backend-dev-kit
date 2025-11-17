import { UserRole } from "@prisma/client";
import { HttpStatusCode } from "axios";
import {
  hashPwd,
  validateEncryptedPassword,
} from "../../../../../lib/utils/encryption";
import formatDateWithDateFns from "../../../../../lib/utils/format-date";
import { generateMemberId } from "../../../../../lib/utils/gen-member-id";
import { dashUserCreationTemplate } from "../../../../emails/templates/dash-user-creation";
import AppError from "../../../../errors/appError";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import { queueEmail } from "../../../../queue/queues/email/email-service";
import { T_ReqSourceType } from "../../../auth/types/auth.types";
import { createCookie } from "../../../auth/utils/auth.utils";
import { dashUserRepository } from "../repository/dashboard-user.repository";
import { T_DashUserSchema } from "../types/dashboard-user.types";
import generatePassword from "../utils/generate-random-pwd";

// const getMyInfoFromDb = async (user: I_GlobalJwtPayload) => {
//   return await dashUserRepository.getUserByMail({
//     email: user.email,
//     select: {
//       memberId: true,
//       memberPoints: true,
//       email: true,
//       profile: {
//         select: {
//           firstName: true,
//           lastName: true,
//           fullName: true,
//           userImage: true,
//         },
//       },
//       address: {
//         select: {
//           country: true,
//           isDefault: true,
//         },
//       },
//       createdAt: true,
//       updatedAt: true,
//       //      address: true,
//     },
//   });
// };

// // ** Retrieve single user information by its id
// const getSingeUserFromDb = async (id: string) => {
//   // id is missing in params
//   if (!id) {
//     throw new AppError(HttpStatusCode.NotFound, "User id is required!");
//   }

//   const result = await dashUserRepository.getUserById(id);

//   // if there is now user exist by the id
//   if (!result) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this id!",
//     );
//   }
//   return result;
// };

// // ** Retrieve single user information by its email
// const getSingeUserByEmailFromDb = async (email: string) => {
//   // email is missing in params
//   if (!email) {
//     throw new AppError(HttpStatusCode.NotFound, "User email is required!");
//   }

//   const result = await dashUserRepository.getUserByMail({ email });

//   // if there is now user exist by the id
//   if (!result) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this email!",
//     );
//   }
//   return result;
// };

// // ** Retrieve single user information by its id
// const getUserByEmailFromDb = async (email: string) => {
//   // email is missing in params
//   if (!email) {
//     throw new AppError(HttpStatusCode.NotFound, "User email is required!");
//   }

//   const result = await dashUserRepository.getUserByMail({ email });

//   // if there is now user exist by the email
//   if (!result) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this email!",
//     );
//   }
//   return result;
// };

// // ** Delete user
// const deleteUserInfoFromDb = async (id: string, payload: Partial<User>) => {
//   // email is missing in params
//   if (!id) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "Id is missing in order to update information!",
//     );
//   }

//   const isUserExist = await dashUserRepository.getUserById(id);

//   // if there is now user exist by the email
//   if (!isUserExist) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this email!",
//     );
//   }

//   const deleteUser = await dashUserRepository.deleteUserById(id);
//   return deleteUser;
// };

// // ** Change role
// const changeUserRoleFromDb = async (payload: T_ChangeRole["body"]) => {
//   const isUserExist = await dashUserRepository.getUserByMail({
//     email: payload.email,
//   });

//   // if there is now user exist by the email
//   if (!isUserExist) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this email!",
//     );
//   }

//   // If user already have the role that comes from the payload then no need to change the role
//   if (isUserExist.role === payload.role) {
//     throw new AppError(
//       HttpStatusCode.BadRequest,
//       "User already have this role!",
//     );
//   }

//   const updateUserRole = await dashUserRepository.changeUserRole(payload);
//   return updateUserRole;
// };

// // Update user profile
// // ** Update only user information
// const updateUserProfileFromDb = async (
//   id: string,
//   payload: Partial<Profile>,
// ) => {
//   // email is missing in params
//   if (!id) {
//     throw new AppError(
//       HttpStatusCode.BadRequest,
//       "Id is missing in order to update information!",
//     );
//   }

//   // getting user information by id to check if user exist or not
//   const isUserExist = await dashUserRepository.getUserById(id);

//   // if there is now user exist by the email
//   if (!isUserExist) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this email!",
//     );
//   }

//   const updateUserInfo = await dashUserRepository.updateUserProfile(
//     id,
//     payload,
//   );

//   return updateUserInfo;
// };

// // Update user password
// const changePassword = async ({
//   user,
//   payload,
// }: {
//   user: I_GlobalJwtPayload;
//   payload: { currentPassword: string; newPassword: string };
// }): Promise<{ accessToken: string; refreshToken: string }> => {
//   // getting user information by id to check if user exist or not
//   const isUserExist = await dashUserRepository.getUserByIdFromDB(user.id);

//   // if there is now user exist by the email
//   if (!isUserExist) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this id!",
//     );
//   }

//   // if user is blocked
//   if (!isUserExist.authMethod.includes(OauthMethod.EMAIL_PASS)) {
//     throw new AppError(
//       HttpStatusCode.Forbidden,
//       "This account is not eligible to change password!",
//     );
//   }

//   // validate the password
//   if (
//     !(await validateEncryptedPassword(
//       payload.currentPassword,
//       isUserExist.password,
//     ))
//   ) {
//     throw new AppError(
//       HttpStatusCode.BadRequest,
//       "Credentials mismatch match!",
//     );
//   }

//   let pwdChangDate = new Date();
//   const newPayload: Partial<User> = {
//     password: await hashPwd(payload.newPassword),
//     lastPasswordChangedAt: pwdChangDate,
//   };
//   const { password, ...rest } = await dashUserRepository.updateUserInfo(
//     user.id,
//     newPayload,
//   );

//   // All payload should include these data for consistency
//   const jwtPayload: I_GlobalJwtPayload = {
//     id: isUserExist.id,
//     role: isUserExist.role,
//     email: isUserExist.email,
//     isBlocked: isUserExist.isBlocked,
//     isVerified: isUserExist.isVerified,
//     lastPasswordChangedAt: pwdChangDate,
//   };

//   const accessToken = createCookie(jwtPayload, "Access");

//   // A token with  15 days of expiry
//   const refreshToken = createCookie(jwtPayload, "Refresh");

//   return {
//     accessToken,
//     refreshToken,
//   };
// };

// // Update payment password
// const updatePaymentPwd = async ({
//   user,
//   payload,
// }: {
//   user: I_GlobalJwtPayload;
//   payload: { currentPassword: string; newPassword: string };
// }): Promise<boolean> => {
//   // getting user information by id to check if user exist or not
//   const isUserExist = await dashUserRepository.getUserByIdFromDB(user.id, {
//     paymentPassword: {
//       select: {
//         id: true,
//         password: true,
//       },
//     },
//   });

//   // if there is now user exist by the email
//   if (!isUserExist) {
//     throw new AppError(
//       HttpStatusCode.NotFound,
//       "User doesn't exist by this id!",
//     );
//   }

//   const pwdChangDate = new Date();

//   console.log(
//     "🚀 ~ updatePaymentPwd ~ payload:",
//     isUserExist.paymentPassword?.password,
//   );

//   if (
//     isUserExist.paymentPassword?.password === null &&
//     payload.currentPassword === undefined
//   ) {
//     // create new payment password
//     const paymentPassword = await hashPwd(payload.newPassword);
//     console.log(
//       "🚀 ~ updatePaymentPwd ~ paymentPassword:",
//       payload.newPassword,
//     );

//     await dashUserRepository.updatePaymentPwd({
//       id: isUserExist.paymentPassword?.id,
//       payload: {
//         password: paymentPassword,
//         lastPasswordChangedAt: pwdChangDate,
//       },
//     });

//     return true;
//   } else {
//     // While user wants to update the existing password. Validate it first
//     if (payload.currentPassword === undefined) {
//       throw new AppError(
//         HttpStatusCode.BadRequest,
//         "Current password is required!",
//       );
//     }

//     if (
//       !(await validateEncryptedPassword(
//         payload.currentPassword,
//         isUserExist.paymentPassword?.password!,
//       ))
//     ) {
//       throw new AppError(
//         HttpStatusCode.BadRequest,
//         "Credentials mismatch match!",
//       );
//     }
//     const newPwd = await hashPwd(payload.newPassword);
//     console.log("🚀 ~ updatePaymentPwd ~ newPwd:", newPwd);
//     const newPayload: Partial<User> = {
//       password: newPwd,
//       lastPasswordChangedAt: pwdChangDate,
//     };

//     await dashUserRepository.updatePaymentPwd({
//       id: isUserExist.paymentPassword?.id!,
//       payload: newPayload,
//     });

//     return false;
//   }
// };

class DashboardUserService {
  constructor() {}

  /**
   * Creating user from dashboard. The basic functionality will be
   *
   * 🦜 CLIENTS REQUIREMENTS:
   * As the admin, you will create acc-ounts for buyers and warehouse staff directly from the admin panel. They will receive an ema-il with their login credentials, including a temporary pas-sword. Upon their first login, they’ll be prompted to change their passwo-rd. After that, they can sign in, sign out, and perform their tasks as needed. This approach centralizes control with the admin for acco-unt creation.
   *
   * 👾👾 => Thought process
   *
   * System need to detect the user information is valid by the zod
   * Admin will create the user information, a random password will be generated and send to the user[Warehouse stuff | Purchasing agent ] by email
   * With that information they will try to login
   ** - But system need to make sure this person password needs to be changed. We'll
   ** have to track the login time
   * If the user is logged in for the first time then force them to change the password, else ignore the things
   * There need to be a mechanism to track who created this user
   *
   */

  async createDashboardUserIntoDb({
    payload,
    user,
  }: {
    user: I_GlobalJwtPayload;
    payload: T_DashUserSchema["body"];
  }) {
    const { profile, address, ...rest } = payload;
    if (
      !(["PURCHASING_AGENT", "WAREHOUSE_STAFF"] as UserRole[]).includes(
        payload.role as UserRole,
      )
    ) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `"Invalid role ${payload.role}`,
      );
    }
    // check is the user is exist or not
    const isUserAlreadyExist = await dashUserRepository.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (isUserAlreadyExist) {
      throw new AppError(HttpStatusCode.Conflict, "User already exist!");
    }
    // generate the memberId
    const suffix =
      (payload.role as UserRole) === "WAREHOUSE_STAFF"
        ? "WS"
        : payload.role === "PURCHASING_AGENT"
          ? "PA"
          : "N/A";

    const generatedMemberId = generateMemberId(
      `${suffix}-${payload.profile.firstName}`,
    );

    // Step, make a random password
    const pwd = generatePassword(10);
    payload.password = await hashPwd(pwd);
    payload.createdById = user.id;

    // now create the account
    const userPayload = {
      ...payload,
      profile,
      address,
    };

    const createUser = await dashUserRepository.createDashUser({
      payload: userPayload,
      memberId: generatedMemberId,
    });

    // Send email to the created uer
    await queueEmail({
      to: payload.email,
      subject: "Verify your email",
      html: dashUserCreationTemplate({
        createdAt: formatDateWithDateFns(createUser.user.createdAt!, "utc")!,
        secretPassword: pwd,
        userEmail: payload.email,
        userRole: payload.role,
      }),
    });

    return createUser;

    // if (isUserAlreadyExist && isUserAlreadyExist.isVerified) {
    //   throw new AppError(
    //     HttpStatusCode.Conflict,
    //     "User already exist & verified",
    //   );
    // } else if (isUserAlreadyExist) {
    //   // update the user information, only update the password
    //   await userRepository.updateUserInfo(isUserAlreadyExist.id, {
    //     password: await hashPwd(payload.password),
    //     otp: gnOtp,
    //     otpExpires: token,
    //   });
    //   // send mail through the queue system
    //   await queueEmail({
    //     to: payload.email,
    //     subject: "Verify your email",
    //     html: verificationOtp(String(gnOtp)),
    //   });
    // } else {
    //   // create the user
    //   const userPayload = {
    //     ...payload,
    //     otp: gnOtp,
    //     otpExpires: token,
    //     password: await hashPwd(payload.password),
    //   };
    //   const {
    //     user: { otp, ...result },
    //   } = await userRepository.createUser({
    //     payload: userPayload,
    //     memberId: generatedMemberId,
    //   });

    //   // send mail through the queue system
    //   await queueEmail({
    //     to: payload.email,
    //     subject: "Verify your email",
    //     html: verificationOtp(String(otp)),
    //   });

    //   return result;
    // }
  }

  async loginDashUser({
    payload,
    reqSource,
  }: {
    payload: { email: string; password: string };
    reqSource: T_ReqSourceType;
  }) {
    console.log(
      "🚀 ~ DashboardUserService ~ loginDashUser ~ reqSource:",
      reqSource,
    );
    if (reqSource !== "dash") {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "You are not allowed to login here!",
      );
    }
    // check if the user is exist and has dashboard access
    const isUserExist = await dashUserRepository.findUnique({
      where: {
        email: payload.email,
        isBlocked: false,
        role: {
          notIn: ["MEMBER"],
        },
      },
    });

    if (!isUserExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "User credential mismatch or not allowed to login here!",
      );
    }

    // validate the password
    if (
      !(await validateEncryptedPassword(payload.password, isUserExist.password))
    ) {
      throw new AppError(HttpStatusCode.BadRequest, "Credentials mismatch!");
    }

    // If this user is logging for the first time then make him `isVerified: true`
    if (!isUserExist.isVerified && isUserExist.totalLogIn <= 1) {
      await dashUserRepository.updateUserInfo({
        where: {
          id: isUserExist.id,
        },
        data: {
          isVerified: true,
          totalLogIn: {
            increment: 1, // increment the total log in
          },
          lastLoggedIn: new Date(),
        },
      });
    }

    // All payload should include these data for consistency
    const jwtPayload: I_GlobalJwtPayload = {
      id: isUserExist.id,
      role: isUserExist.role,
      email: isUserExist.email,
      isBlocked: isUserExist.isBlocked,
      isVerified: isUserExist.isVerified,
      lastPasswordChangedAt: isUserExist.lastPasswordChangedAt,
    };

    const accessToken = createCookie(jwtPayload, "Access");

    // A token with  15 days of expiry
    const refreshToken = createCookie(jwtPayload, "Refresh");

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const dashUserService = new DashboardUserService();
export default DashboardUserService;
