import { HttpStatusCode } from "axios";
import { GROUP_LISTS, permissionsList } from "../../../constant/permisson-list";
import AppError from "../../../errors/appError";

export const isValidPermissionKey = (
  permissionKey: keyof typeof permissionsList,
) => {
  // check permission key matched with system permissions
  if (!Object.values(permissionsList).includes(permissionKey)) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      `Invalid permission key name: ${permissionKey}`,
    );
  } else {
    return true;
  }
};

export const isValidGroupName = (groupName: keyof typeof GROUP_LISTS) => {
  // check permission key matched with system permissions
  if (!Object.values(GROUP_LISTS).includes(groupName)) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      `Invalid group name: ${groupName}`,
    );
  }

  return true;
};
