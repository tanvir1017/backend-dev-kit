import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { openFGAService } from "../service/openFGA.service";

export const openFGAControllers = {
  // assign user to a group
  assignUserToGroup: asyncHandler(async (req, res) => {
    const { userId, groupName } = req.body;

    const result = await openFGAService.addUserToGroup(userId, groupName);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `User assigned to ${groupName}-group successfully`,
      data: result,
    });
  }),

  // check user has specific permission
  checkUserPermission: asyncHandler(async (req, res) => {
    const { userId, permissionKey } = req.body;

    const result = await openFGAService.hasPermission(userId, permissionKey);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `User:${userId} has ${result ? " permission" : " no permission"} over ${permissionKey}`,
      data: result,
    });
  }),

  // revoke user from a group
  removeUserFromGroup: asyncHandler(async (req, res) => {
    const { userId, groupName } = req.body;

    const result = await openFGAService.removeUserFromGroup(userId, groupName);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `User revoked from ${groupName}-group successfully`,
      data: result,
    });
  }),

  /////////////// GROUP PERMISSION ////////////////////
  ////////////////////////////////////////////////////
  // Grant user permission to a group
  grantUserPermissionToGroup: asyncHandler(async (req, res) => {
    const { permissionKey, groupName } = req.body;
    const result = await openFGAService.grantPermissionToGroup({
      groupName,
      permissionKey,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `${groupName}-group has ${result ? " permission" : " no permission"} over ${permissionKey}`,
      data: result,
    });
  }),

  // Check group has specific permission
  checkGroupPermission: asyncHandler(async (req, res) => {
    const { permissionKey, groupName } = req.body;
    const result = await openFGAService.checkGroupPermission({
      groupName,
      permissionKey,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `${groupName}-group has ${result ? " permission" : " no permission"} over ${permissionKey}`,
      data: result,
    });
  }),

  // Check group has specific permission
  revokePermissionFromGroup: asyncHandler(async (req, res) => {
    const { permissionKey, groupName } = req.body;
    const result = await openFGAService.revokePermissionFromGroup({
      groupName,
      permissionKey,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Revoke permission from ${groupName}-group successfully`,
      data: result,
    });
  }),

  /////////////// USERS GROUP /////////////////////////
  ////////////////////////////////////////////////////
  // Get all groups where logged in user belongs to (FIXED SDK SYNTAX)
  getMyGroups: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    console.log("🚀 ~ user:", user);

    const result = await openFGAService.getUserGroups(user.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Get all groups a user belongs to (FIXED SDK SYNTAX)`,
      data: result,
    });
  }),

  // Get all groups a user belongs to (FIXED SDK SYNTAX)
  getGroupUsers: asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const result = await openFGAService.getUserGroups(userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Get all groups a user belongs to (FIXED SDK SYNTAX)`,
      data: result,
    });
  }),

  // Get my permissions
  getMyPermissions: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const result = await openFGAService.getUserPermissions(user.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Permission retrieved successful`,
      data: result,
    });
  }),

  // Get user permissions
  getUserPermissions: asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const result = await openFGAService.getUserPermissions(userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Get user permissions`,
      data: result,
    });
  }),

  // Get user permissions
  getGroupsWithPermissions: asyncHandler(async (req, res) => {
    const { permissionKey } = req.body;

    const result = await openFGAService.getGroupsWithPermission(permissionKey);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Get groups with permission`,
      data: result,
    });
  }),
};
