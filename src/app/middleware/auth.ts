import env from "../config/clean-env";

import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../lib/utils/verify-token.utils";
import { GROUP_LISTS, permissionsList } from "../constant/permisson-list";
import AppError from "../errors/appError";
import { I_GlobalJwtPayload } from "../interface/common.interface";
import { openFGAService } from "../modules/openFGA/service/openFGA.service";
import { fga } from "../modules/openFGA/utils/openfga";
import { userRepository } from "../modules/user-account/user/repository/user.repository";

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Return void instead of Response
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Authorization header missing",
      );
    }

    const token = authorization.split(" ")[1];

    // if token is available or not
    if (!token) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Token is missing from header",
      );
    }

    // Verify token
    const decoded = verifyToken(
      token,
      env.JWT_ACCESS_TOKEN,
    ) as I_GlobalJwtPayload;

    const user = await userRepository.getUserByIdFromDB(decoded.id);

    // check if user exists in DB by id
    if (!user) {
      throw new AppError(HttpStatusCode.NotFound, "user doesn't exist");
    }

    // For OAuth users, no password check needed
    if (
      user.authMethod === "EMAIL_PASS" &&
      decoded.iat! < new Date(user.lastPasswordChangedAt!).getTime() / 1000
    ) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "Password has been changed, please login again",
      );
    }

    req.user = decoded;
    next();
  } catch (error) {
    // Don't return the response, just send it
    throw new AppError(HttpStatusCode.BadRequest, (error as Error).message);
  }
};

// Require permission middleware will take a permission key on the request
export const requirePermission = (
  permissionKey: keyof typeof permissionsList,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id; // Assuming you have user in request from auth middleware

    try {
      const hasAccess = await openFGAService.hasPermission(
        userId,
        permissionKey,
      );

      if (!hasAccess) {
        throw new AppError(
          HttpStatusCode.Forbidden,
          `User ${userId} does not have permission: ${permissionsList[permissionKey]}`,
        );
      }

      next();
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Permission check failed. Error: ${(error as Error).message}`,
      );
    }
  };
};

// Require group management
export const requireGroupManagement = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = req.user;
    const { groupName } = req.body;
    //console.log(req.user);
    // check group name matched with system group
    if (!Object.keys(GROUP_LISTS).includes(groupName)) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Invalid group name: ${groupName}:${GROUP_LISTS[`${groupName as keyof typeof GROUP_LISTS}`]}`,
      );
    }

    // Check if user can manage this specific group
    const { allowed } = await fga.check({
      user: `user:${currentUser.id}`,
      relation: "can_manage", // ✅ Use your existing can_manage relation
      object: `group:${groupName}`,
    });
    console.log("🚀 ~ allowed:", allowed);

    console.log("🚀 ~ requireGroupManagement ~ currentUser:", currentUser);

    if (!allowed && currentUser.role === "SUPER_ADMIN") {
      // make the admin can_manage permission to th the group
      const can_mange = await fga.write({
        writes: [
          {
            user: `user:${currentUser.id}`,
            relation: "can_manage",
            object: `group:${groupName}`,
          },
        ],
      });

      console.log("🚀 ~ can_mange:", can_mange);
      console.log("✅ Admin can now manage the group:", groupName);
    } else if (!allowed) {
      throw new AppError(HttpStatusCode.Forbidden, "Access denied");
    }

    next();
  } catch (error) {
    throw new AppError(
      HttpStatusCode.InternalServerError,
      `Error checking group: ${(error as Error).message}`,
    );
  }
};

/* 
router.get('/', requirePermission(permissionsList.PRODUCT_LIST), getProducts);
*/

export const requireAnyPermission = (permissionKeys: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;

      for (const permissionKey of permissionKeys) {
        const hasAccess = await openFGAService.hasPermission(
          userId,
          permissionKey as keyof typeof permissionsList,
        );
        if (hasAccess) {
          return next();
        }
      }

      res.status(403).json({
        error: "Access denied",
        message: `Required any of: ${permissionKeys.join(", ")}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

/*
 Usage
router.get('/reports', 
  requireAnyPermission([permissionsList.STATISTICS, permissionsList.ADMIN_TIPS]), 
  getReports
);
 */
