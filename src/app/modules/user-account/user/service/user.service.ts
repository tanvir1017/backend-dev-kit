import { OauthMethod, Profile, User } from "@prisma/client";

import { HttpStatusCode } from "axios";
import {
  hashPwd,
  validateEncryptedPassword,
} from "../../../../../lib/utils/encryption";
import { generateMemberId } from "../../../../../lib/utils/gen-member-id";
import { verificationOtp } from "../../../../emails/templates/verification-otp";
import AppError from "../../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../../interface/common.interface";
import { queueEmail } from "../../../../queue/queues/email/email-service";
import { createCookie } from "../../../auth/utils/auth.utils";
import generateOTP from "../../../auth/utils/genOtp.utils";
import { userRepository } from "../repository/user.repository";
import { T_ChangeRole, T_UserSchema } from "../types/user.types";

// ** Create user into db
const createUserIntoDb = async (payload: T_UserSchema["body"]) => {
  // generate the memberId
  const generatedMemberId = generateMemberId(payload.profile.firstName);

  // check is the user is exist or not
  const isUserAlreadyExist = await userRepository.getUserByMail({
    email: payload.email,
  });

  const { otp: gnOtp, token } = generateOTP(payload.email);

  if (isUserAlreadyExist && isUserAlreadyExist.isVerified) {
    throw new AppError(
      HttpStatusCode.Conflict,
      "User already exist & verified",
    );
  } else if (isUserAlreadyExist) {
    // update the user information, only update the password
    await userRepository.updateUserInfo(isUserAlreadyExist.id, {
      password: await hashPwd(payload.password),
      otp: gnOtp,
      otpExpires: token,
    });
    // send mail through the queue system
    await queueEmail({
      to: payload.email,
      subject: "Verify your email",
      html: verificationOtp(String(gnOtp)),
    });
  } else {
    // create the user
    const userPayload = {
      ...payload,
      otp: gnOtp,
      otpExpires: token,
      password: await hashPwd(payload.password),
    };
    const {
      user: { otp, ...result },
    } = await userRepository.createUser({
      payload: userPayload,
      memberId: generatedMemberId,
    });

    // send mail through the queue system
    await queueEmail({
      to: payload.email,
      subject: "Verify your email",
      html: verificationOtp(String(otp)),
    });

    return result;
  }
};

const getMyInfoFromDb = async (user: I_GlobalJwtPayload) => {
  return await userRepository.getUserByMail({
    email: user.email,
    select: {
      memberId: true,
      memberPoints: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          fullName: true,
          userImage: true,
        },
      },
      address: {
        select: {
          country: true,
          isDefault: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      //      address: true,
    },
  });
};

// ** Get all user from db ~ Only admin can see
const getAllUsersFromDb = async (
  query?: Record<string, any>,
): Promise<I_PaginationResponse<Omit<User, "password">[]>> => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = Number(page - 1) * limit || 0;

  // Get the total count of orders (not limited by pagination)
  const totalCount = await userRepository.getUsersCount();

  // Calculate totalPages for pagination
  const totalPages = Math.ceil(totalCount / limit);

  // getting only the verified users
  const result = await userRepository.getPaginatedUsers(limit, skip, query!);

  // pagination return data schema
  const paginationSchema: I_PaginationResponse<Omit<User, "password">[]> = {
    meta: {
      totalCount,
      totalPages,
      page,
      limit,
    },
    result,
  };
  return paginationSchema;
};

// ** Retrieve single user information by its id
const getSingeUserFromDb = async (id: string) => {
  // id is missing in params
  if (!id) {
    throw new AppError(HttpStatusCode.NotFound, "User id is required!");
  }

  const result = await userRepository.getUserById(id);

  // if there is now user exist by the id
  if (!result) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this id!",
    );
  }
  return result;
};

// ** Retrieve single user information by its email
const getSingeUserByEmailFromDb = async (email: string) => {
  // email is missing in params
  if (!email) {
    throw new AppError(HttpStatusCode.NotFound, "User email is required!");
  }

  const result = await userRepository.getUserByMail({ email });

  // if there is now user exist by the id
  if (!result) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this email!",
    );
  }
  return result;
};

// ** Retrieve single user information by its id
const getUserByEmailFromDb = async (email: string) => {
  // email is missing in params
  if (!email) {
    throw new AppError(HttpStatusCode.NotFound, "User email is required!");
  }

  const result = await userRepository.getUserByMail({ email });

  // if there is now user exist by the email
  if (!result) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this email!",
    );
  }
  return result;
};

// ** Delete user
const deleteUserInfoFromDb = async (id: string, payload: Partial<User>) => {
  // email is missing in params
  if (!id) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "Id is missing in order to update information!",
    );
  }

  const isUserExist = await userRepository.getUserById(id);

  // if there is now user exist by the email
  if (!isUserExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this email!",
    );
  }

  const deleteUser = await userRepository.deleteUserById(id);
  return deleteUser;
};

// ** Change role
const changeUserRoleFromDb = async (payload: T_ChangeRole["body"]) => {
  const isUserExist = await userRepository.getUserByMail({
    email: payload.email,
  });

  // if there is now user exist by the email
  if (!isUserExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this email!",
    );
  }

  // If user already have the role that comes from the payload then no need to change the role
  if (isUserExist.role === payload.role) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      "User already have this role!",
    );
  }

  const updateUserRole = await userRepository.changeUserRole(payload);
  return updateUserRole;
};

// Update user profile
// ** Update only user information
const updateUserProfileFromDb = async (
  id: string,
  payload: Partial<Profile>,
) => {
  // email is missing in params
  if (!id) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      "Id is missing in order to update information!",
    );
  }

  // getting user information by id to check if user exist or not
  const isUserExist = await userRepository.getUserById(id);

  // if there is now user exist by the email
  if (!isUserExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this email!",
    );
  }

  const updateUserInfo = await userRepository.updateUserProfile(id, payload);

  return updateUserInfo;
};

// Update user password
const changePassword = async ({
  user,
  payload,
}: {
  user: I_GlobalJwtPayload;
  payload: { currentPassword: string; newPassword: string };
}): Promise<{ accessToken: string; refreshToken: string }> => {
  // getting user information by id to check if user exist or not
  const isUserExist = await userRepository.getUserByIdFromDB(user.id);

  // if there is now user exist by the email
  if (!isUserExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this id!",
    );
  }

  // if user is blocked
  if (!isUserExist.authMethod.includes(OauthMethod.EMAIL_PASS)) {
    throw new AppError(
      HttpStatusCode.Forbidden,
      "This account is not eligible to change password!",
    );
  }

  // validate the password
  if (
    !(await validateEncryptedPassword(
      payload.currentPassword,
      isUserExist.password,
    ))
  ) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      "Credentials mismatch match!",
    );
  }

  let pwdChangDate = new Date();
  const newPayload: Partial<User> = {
    password: await hashPwd(payload.newPassword),
    lastPasswordChangedAt: pwdChangDate,
  };
  const { password, ...rest } = await userRepository.updateUserInfo(
    user.id,
    newPayload,
  );

  // All payload should include these data for consistency
  const jwtPayload: I_GlobalJwtPayload = {
    id: isUserExist.id,
    role: isUserExist.role,
    email: isUserExist.email,
    isBlocked: isUserExist.isBlocked,
    isVerified: isUserExist.isVerified,
    lastPasswordChangedAt: pwdChangDate,
  };

  const accessToken = createCookie(jwtPayload, "Access");

  // A token with  15 days of expiry
  const refreshToken = createCookie(jwtPayload, "Refresh");

  return {
    accessToken,
    refreshToken,
  };
};

// Update payment password
const updatePaymentPwd = async ({
  user,
  payload,
}: {
  user: I_GlobalJwtPayload;
  payload: { currentPassword: string; newPassword: string };
}): Promise<boolean> => {
  // getting user information by id to check if user exist or not
  const isUserExist = await userRepository.getUserByIdFromDB(user.id, {
    paymentPassword: {
      select: {
        id: true,
        password: true,
      },
    },
  });

  // if there is now user exist by the email
  if (!isUserExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "User doesn't exist by this id!",
    );
  }

  const pwdChangDate = new Date();

  console.log(
    "🚀 ~ updatePaymentPwd ~ payload:",
    isUserExist.paymentPassword?.password,
  );

  if (
    isUserExist.paymentPassword?.password === null &&
    payload.currentPassword === undefined
  ) {
    // create new payment password
    const paymentPassword = await hashPwd(payload.newPassword);
    console.log(
      "🚀 ~ updatePaymentPwd ~ paymentPassword:",
      payload.newPassword,
    );

    await userRepository.updatePaymentPwd({
      id: isUserExist.paymentPassword?.id,
      payload: {
        password: paymentPassword,
        lastPasswordChangedAt: pwdChangDate,
      },
    });

    return true;
  } else {
    // While user wants to update the existing password. Validate it first
    if (payload.currentPassword === undefined) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Current password is required!",
      );
    }

    if (
      !(await validateEncryptedPassword(
        payload.currentPassword,
        isUserExist.paymentPassword?.password!,
      ))
    ) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Credentials mismatch match!",
      );
    }
    const newPwd = await hashPwd(payload.newPassword);
    console.log("🚀 ~ updatePaymentPwd ~ newPwd:", newPwd);
    const newPayload: Partial<User> = {
      password: newPwd,
      lastPasswordChangedAt: pwdChangDate,
    };

    await userRepository.updatePaymentPwd({
      id: isUserExist.paymentPassword?.id!,
      payload: newPayload,
    });

    return false;
  }
};

export const userServices = {
  getAllUsersFromDb,
  getMyInfoFromDb,
  createUserIntoDb,
  getSingeUserFromDb,
  updateUserProfileFromDb,
  getUserByEmailFromDb,
  deleteUserInfoFromDb,
  getSingeUserByEmailFromDb,
  changeUserRoleFromDb,
  changePassword,
  updatePaymentPwd,
};
