import {
  Gender,
  PaymentPassword,
  Prisma,
  Profile,
  User,
  UserRole,
} from "@prisma/client";

import prisma from "../../../../../lib/utils/prisma.utils";
import { T_ChangeRole, T_UserSchema } from "../types/user.types";

// ** Get the user by mail address
const getUserByMail = async ({
  email,
  omitPwd,
  select,
  include,
}: {
  email: string;
  omitPwd?: boolean;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}) => {
  const result = await prisma.user.findUnique({
    where: {
      email,
    },
    ...(omitPwd && {
      omit: {
        password: omitPwd ?? true,
      },
    }),
    ...(select && { select }),
    ...(include && { include }),
  });
  return result;
};

// ** Get the user by mail address and role
const getUserByMailAndRole = async (payload: {
  email: string;
  role: UserRole;
}) => {
  return await prisma.user.findUnique({
    where: {
      email: payload.email,
      role: payload.role,
    },
    omit: {
      password: true,
    },
  });
};

// ** Get the user by useId
const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });
};

// ** get specific user by id with password
const getUserByIdFromDB = async (
  id: string,
  select: Prisma.UserSelect = { id: true },
) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select,
  });
};

// ** Get the user total count
const getUsersCount = async () => {
  return await prisma.user.count();
};

// ** Get all users with pagination
const getPaginatedUsers = async (
  limit: number,
  skip: number,
  query: Record<string, any>,
) => {
  // Build dynamic where clause
  //let whereClause: Record<string, any> = {};

  // if there is any query parameter in the req.query object then dynamically adding them on the where clause.

  /*
   * Most probably the query parameter will be
   ** `isVerified`
   ** `isBlocked`
   */
  /* Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      whereClause[key] = value;
    }
  }); */

  return await prisma.user.findMany({
    take: limit,
    skip,
    where: {
      isVerified: true,
      isBlocked: false,
    },
    omit: {
      password: true,
    },
  });
};

/**
 * Creating a user.
 * @payload - contain all user information. ``
 * @role {enum} - by default every created user is `MEMBER`
 */
const createUser = async ({
  payload,
  memberId,
}: {
  payload: T_UserSchema["body"];
  memberId: string;
}) => {
  // when creating a `user` create a `profile`  collections also
  const { profile, address, ...user } = payload;

  // In a single route creating `user`, `address` and `profile`.
  const createUserProfileAndAddress = await prisma.$transaction(async (tx) => {
    // creating user and profile
    const createUserAndProfile = await tx.user.create({
      data: {
        email: user.email,
        password: user.password,
        memberId,
        role: UserRole.MEMBER,
        otp: payload.otp,
        otpExpires: payload.otpExpires,

        // create the profile
        profile: {
          create: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            fullName: `${profile.firstName} ${profile.lastName}`,
            gender: profile.gender as Gender,
          },
        },

        // create the payment pass
        paymentPassword: {
          create: {
            isRequirePwd: false,
          },
        },
      },

      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            gender: true,
          },
        },
      },
      // Reducing the response object to minimize latency
      omit: {
        lastPasswordChangedAt: true,
        isVerified: true,
        isBlocked: true,
        authMethod: true,
        // otp: true,
        otpExpires: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    // creating address
    const createAddress = await tx.address.create({
      data: {
        country: address.country,
        userId: createUserAndProfile.id,
      },
    });

    return {
      user: {
        ...createUserAndProfile,
        address: {
          country: createAddress.country,
        },
      },
    };
  });

  return createUserProfileAndAddress;
};

// ** Update the user role
const updateUserRole = async (email: string, role: UserRole) => {
  return await prisma.user.update({
    where: {
      email,
    },
    data: {
      role: role,
    },
    omit: {
      password: true,
    },
  });
};

// ** Delete the user by userId
const deleteUserById = async (id: string) => {
  return await prisma.user.delete({
    where: {
      id,
    },
  });
};

// ** Change role by email
const changeUserRole = async (payload: T_ChangeRole["body"]) => {
  return await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      role: payload.role as UserRole,
    },
  });
};

// Update user information
const updateUserInfo = async (
  id: string,
  payload: Partial<User>,
  tx = prisma as Prisma.TransactionClient,
) => {
  return await tx.user.update({
    where: {
      id,
    },
    data: payload,
  });
};

// User profile repository
const updateUserProfile = async (id: string, profile: Partial<Profile>) => {};

// update payment password
const updatePaymentPwd = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<PaymentPassword>;
}) => {
  await prisma.paymentPassword.update({
    where: {
      id,
    },
    data: payload,
  });
};

export const userRepository = {
  createUser,
  updateUserProfile,
  getUserByMail,
  getUserByMailAndRole,
  updateUserRole,
  getUserById,
  deleteUserById,
  getUsersCount,
  getPaginatedUsers,
  getUserByIdFromDB,
  changeUserRole,
  updateUserInfo,
  updatePaymentPwd,
};
