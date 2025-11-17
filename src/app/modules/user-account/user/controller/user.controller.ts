import { Request, Response } from "express";

import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../../lib/utils/async-handler";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import {
  setAccessToken,
  setRefreshToken,
} from "../../../auth/utils/auth.utils";
import { userServices } from "../service/user.service";
import { T_UserSchema } from "../types/user.types";

// ** Crate a user
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as T_UserSchema["body"];
  const result = await userServices.createUserIntoDb(body);

  sendResponse(res, {
    statusCode: HttpStatusCode.Created,
    message:
      "You've successfully registered! Please check your mail for verification code!",
    success: true,
    data: result,
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as I_GlobalJwtPayload;

  const result = await userServices.getMyInfoFromDb(user);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "All users retrieved successfully",
    success: true,
    data: result,
  });
});

// ** retrieve all the users from db
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsersFromDb(req.query);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "All users retrieved successfully",
    success: true,
    data: result,
  });
});

// ** retrieve single user from db
const getSingleUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userServices.getSingeUserFromDb(id);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "User retrieved successfully",
    success: true,
    data: result,
  });
});

// ** retrieve single user from db by mail
const getSingleUserByMail = asyncHandler(
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const result = await userServices.getSingeUserByEmailFromDb(email);

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "User retrieved successfully",
      success: true,
      data: result,
    });
  },
);

// ** Update profile information
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId; // which user information need to be updated
  const body = req.body;
  const result = await userServices.updateUserProfileFromDb(userId, body);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "User information updated successfully",
    success: true,
    data: result,
  });
});

// ** Delete users
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await userServices.deleteUserInfoFromDb(userId, req.body);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "User deleted successfully!",
    success: true,
    data: result,
  });
});

// ** Change users role
const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    email: string;
    role: string;
  };
  const result = await userServices.changeUserRoleFromDb(body);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "User deleted successfully!",
    success: true,
    data: result,
  });
});

// ** Change users role
const changePwd = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as I_GlobalJwtPayload; // logged in user
  const body = req.body as {
    currentPassword: string;
    newPassword: string;
  };
  const { accessToken, refreshToken } = await userServices.changePassword({
    user,
    payload: body,
  });

  // before sending response set the `access` token and `refresh` token into browser cookie
  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);

  sendResponse(res, {
    statusCode: HttpStatusCode.Created,
    message: "Password changed successfully!",
    success: true,
    data: accessToken,
  });
});

// ** Change users role
const updatePaymentPwd = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as I_GlobalJwtPayload;

  const body = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const result = await userServices.updatePaymentPwd({
    user,
    payload: body,
  });

  sendResponse(res, {
    statusCode: result ? HttpStatusCode.Created : HttpStatusCode.Ok,
    message: `Payment Password ${!result ? "updated" : "created"} Successfully!`,
    success: true,
    data: null,
  });
});

// ** Change users role
const forgetPaymentPwd = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as I_GlobalJwtPayload;

  const body = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const result = await userServices.updatePaymentPwd({
    user,
    payload: body,
  });

  sendResponse(res, {
    statusCode: result ? HttpStatusCode.Created : HttpStatusCode.Ok,
    message: `Payment Password ${!result ? "updated" : "created"} Successfully!`,
    success: true,
    data: null,
  });
});

export const userControllers = {
  createUser,
  updateUserProfile,
  getMe,
  getAllUsers,
  getSingleUser,
  deleteUser,
  getSingleUserByMail,
  changeRole,
  changePwd,
  updatePaymentPwd,
  forgetPaymentPwd,
};
