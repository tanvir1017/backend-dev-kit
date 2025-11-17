import { Router } from "express";
import { authenticate, requireGroupManagement } from "../../../middleware/auth";
import { openFGAControllers } from "../controller/openFGA.controller";

const openFGARouter: Router = Router();

// Assign user to a group
openFGARouter.post(
  "/assign-user-to-group",
  authenticate,
  requireGroupManagement,
  openFGAControllers.assignUserToGroup,
);

// Check user has specific permission or not
openFGARouter.post(
  "/has-permission",
  authenticate,
  openFGAControllers.checkUserPermission,
);

// Remove user from a group
openFGARouter.patch(
  "/remove-user-from-group",
  authenticate,
  requireGroupManagement,
  openFGAControllers.removeUserFromGroup,
);

// Grant user permission to group
openFGARouter.patch(
  "/grant-permission-to-group",
  authenticate,
  requireGroupManagement,
  openFGAControllers.grantUserPermissionToGroup,
);

// Check group has specific permission
openFGARouter.post(
  "/has-group-permission",
  authenticate,
  openFGAControllers.checkGroupPermission,
);

// Check group has specific permission
openFGARouter.patch(
  "/remove-group-permission",
  authenticate,
  requireGroupManagement,
  openFGAControllers.revokePermissionFromGroup,
);

/////////////// USERS GROUP /////////////////////////
////////////////////////////////////////////////////

// Check group has specific permission
openFGARouter.get(
  "/get-my-group",
  authenticate,
  openFGAControllers.getMyGroups,
);

// Check group has specific permission
openFGARouter.post(
  "/get-users-group",
  authenticate,
  openFGAControllers.getGroupUsers,
);

// Get my permissions
openFGARouter.get(
  "/get-my-permissions",
  authenticate,
  openFGAControllers.getMyPermissions,
);

// Get user permissions
openFGARouter.post(
  "/get-user-permissions",
  authenticate,
  openFGAControllers.getUserPermissions,
);

// Get group with permissions
openFGARouter.post(
  "/get-groups-with-permissions",
  authenticate,
  openFGAControllers.getGroupsWithPermissions,
);

export const openFGARoutes = openFGARouter;
