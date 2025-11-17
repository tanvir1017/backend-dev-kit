import { ClientWriteResponse } from "@openfga/sdk";
import { HttpStatusCode } from "axios";
import { GROUP_LISTS, permissionsList } from "../../../constant/permisson-list";
import AppError from "../../../errors/appError";
import { T_GroupKey, T_PermissionKey } from "../types/openFGA.types";
import { fga } from "../utils/openfga";
import { isValidGroupName, isValidPermissionKey } from "../utils/openFGA.utils";

export const openFGAService = {
  permissionWrites: ({
    permissionLists,
    groupList,
  }: {
    permissionLists: typeof permissionsList;
    groupList: typeof GROUP_LISTS;
  }) => {
    const permissionWrites = Object.values(permissionLists).map(
      (permissionKey) => ({
        user: `group:${groupList.SUPER_ADMINS}`,
        relation: "granted",
        object: `permission:${permissionKey}`,
      }),
    );
    return permissionWrites;
  },
  // Initialize with all permissions and super admin access
  async initializeSystem(): Promise<ClientWriteResponse> {
    console.log("Initializing OpenFGA system...");
    const permissionWrites = this.permissionWrites({
      permissionLists: permissionsList,
      groupList: GROUP_LISTS,
    });
    const isWrote = await fga.write({
      writes: permissionWrites,
    });
    console.log("✅ All permissions granted to super_admins");
    return isWrote;
  },

  // Add user to group
  addUserToGroup: async (
    userId: string,
    groupName: keyof typeof GROUP_LISTS,
  ): Promise<boolean> => {
    // check group name matched with system group
    if (!Object.keys(GROUP_LISTS).includes(groupName)) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Invalid group name: ${groupName}:${GROUP_LISTS[`${groupName}`]}`,
      );
    }

    try {
      await fga.write({
        writes: [
          {
            user: `user:${userId}`,
            relation: "member",
            object: `group:${GROUP_LISTS[`${groupName}`]}`,
          },
        ],
      });
      return true;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error adding user to group: ${error}`,
      );
    }
  },

  // Check if user has specific permission <-> Direct Permission
  hasDirectPermission: async (
    userId: string,
    permissionKey: keyof typeof permissionsList,
  ): Promise<boolean> => {
    try {
      const result = await fga.check({
        user: `user:${userId}`,
        relation: "granted",
        object: `permission:${permissionsList[permissionKey]}`,
      });

      return result.allowed as boolean;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Permission check error: ${(error as Error).message}`,
      );
    }
  },

  // check user permissions though the group

  /* While a user will only assigned in one group and will have the permission of the group */
  hasPermission: async (
    userId: string,
    permissionKey: keyof typeof permissionsList,
  ): Promise<boolean> => {
    //console.log("🔍 Checking user permissions...");

    try {
      const permissionValue = permissionsList[permissionKey];

      // 1. Get all groups the user belongs to
      const userGroups = await openFGAService.getUserGroups(userId);

      // console.log(`👥 User ${userId} is in groups:`, userGroups);

      // If user is in no groups, they have no permissions
      if (userGroups.length === 0) {
        return false;
      }

      // 2. Check each group for the required permission
      for (const groupName of userGroups) {
        const groupHasPermission = await fga.check({
          user: `group:${groupName}`,
          relation: "granted",
          object: `permission:${permissionValue}`,
        });

        // console.log(
        //   `🔍 Group ${groupName} has ${permissionValue}:`,
        //   groupHasPermission.allowed,
        // );

        if (groupHasPermission.allowed) {
          console.log(`✅ Access granted through group: ${groupName}`);
          return true;
        }
      }

      // 3. No group has the permission
      //console.log(`❌ No access to ${permissionValue} through any group`);
      return false;
    } catch (error) {
      console.error("Permission check error:", error);
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Permission check error: ${(error as Error).message}`,
      );
    }
  },

  // Remove user from group
  removeUserFromGroup: async (
    userId: string,
    groupName: keyof typeof GROUP_LISTS,
  ): Promise<boolean> => {
    // check group name matched with system group
    isValidGroupName(groupName);

    try {
      await fga.write({
        deletes: [
          {
            user: `user:${userId}`,
            relation: "member",
            object: `group:${groupName}`,
          },
        ],
      });
      return true;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error removing user from group: ${error}`,
      );
    }
  },

  // Grant permission to a group (Admin action)
  grantPermissionToGroup: async ({
    permissionKey,
    groupName,
  }: {
    permissionKey: T_PermissionKey;
    groupName: T_GroupKey;
  }): Promise<boolean> => {
    // check the permission key and group name
    isValidGroupName(groupName);
    isValidPermissionKey(permissionKey);

    try {
      const grantPermission: ClientWriteResponse = await fga.write({
        writes: [
          {
            user: `group:${groupName}`,
            relation: "granted",
            object: `permission:${permissionKey}`,
          },
        ],
      });

      // if grant permission failed
      if (grantPermission.writes[0].status !== "success") {
        throw new AppError(
          HttpStatusCode.InternalServerError,
          "Failed to grant permission to group",
        );
      }

      return true;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `error: ${(error as Error).message}`,
      );
    }
  },

  // Revoke permission from a group (Admin action)
  revokePermissionFromGroup: async ({
    permissionKey,
    groupName,
  }: {
    permissionKey: T_PermissionKey;
    groupName: T_GroupKey;
  }): Promise<boolean> => {
    // check the permission key and group name
    isValidGroupName(groupName);
    isValidPermissionKey(permissionKey);
    try {
      await fga.write({
        deletes: [
          {
            user: `group:${groupName}`,
            relation: "granted",
            object: `permission:${permissionKey}`,
          },
        ],
      });
      return true;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error revoking permission from group. Error: ${(error as Error).message}`,
      );
    }
  },

  // Get all groups a user belongs to (FIXED SDK SYNTAX)
  getUserGroups: async (userId: string): Promise<string[]> => {
    try {
      // // check id is exist
      // if (!userId) {
      //   throw new AppError(HttpStatusCode.BadRequest, "User id is required");
      // }
      // // check if user exist
      // const isValidUser = await userServices.getSingeUserFromDb(userId);

      // if (!isValidUser) {
      //   throw new AppError(HttpStatusCode.NotFound, "User not found");
      // }

      const response = await fga.read({
        user: `user:${userId}`,
        relation: "member",
        object: "group:", // This gets all groups the user is member of
      });
      //      console.dir({ userId, groups: response }, { depth: null, colors: true });

      return (
        response.tuples?.map(
          (tuple) => tuple.key?.object?.replace("group:", "") || "",
        ) || ["No group found"]
      );
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error getting user groups: ${error}`,
      );
    }
  },

  // Get all permissions a user has
  getUserPermissions: async (userId: string): Promise<string[]> => {
    try {
      const response = await fga.read({
        user: `user:${userId}`,
        relation: "granted",
        object: "permission:", // This gets all permissions the user has
      });

      return (
        response.tuples?.map(
          (tuple) => tuple.key?.object?.replace("permission:", "") || "",
        ) || []
      );
    } catch (error) {
      console.error("Error getting user permissions:", error);
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error getting user permissions: ${error}`,
      );
    }
  },

  // Get all users in a group
  getGroupUsers: async (groupName: T_GroupKey): Promise<string[]> => {
    // check group name matched with system group
    isValidGroupName(groupName);
    try {
      const response = await fga.read({
        user: "user:",
        relation: "member",
        object: `group:${groupName}`,
      });

      return (
        response.tuples?.map(
          (tuple) => tuple.key?.user?.replace("user:", "") || "",
        ) || []
      );
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error getting group users: ${(error as Error).message}`,
      );
    }
  },

  // Get all groups that have a specific permission
  getGroupsWithPermission: async (
    permissionKey: T_PermissionKey,
  ): Promise<string[]> => {
    // check the permission key
    isValidPermissionKey(permissionKey);
    try {
      const response = await fga.read({
        user: "group:",
        relation: "granted",
        object: `permission:${permissionKey}`,
      });

      return (
        response.tuples?.map(
          (tuple) =>
            tuple.key?.user?.replace("group:", "").replace("", "") || "",
        ) || []
      );
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error getting groups with permission: ${(error as Error).message}`,
      );
    }
  },

  // Check if a group has a specific permission
  checkGroupPermission: async ({
    permissionKey,
    groupName,
  }: {
    permissionKey: T_PermissionKey;
    groupName: T_GroupKey;
  }): Promise<boolean> => {
    // check the permission key and group name
    isValidGroupName(groupName);
    isValidPermissionKey(permissionKey);
    try {
      const { allowed } = await fga.check({
        user: `group:${groupName}`,
        relation: "granted",
        object: `permission:${permissionKey}`,
      });
      return allowed as boolean;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error checking group permission: ${(error as Error).message}`,
      );
    }
  },
};
