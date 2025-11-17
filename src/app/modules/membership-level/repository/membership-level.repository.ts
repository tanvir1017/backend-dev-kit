import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import {
  T_MembershipLevel,
  T_UpdateMembershipLevel,
} from "../types/membership-level.types";

// ** get all membership levels
const getAllMembershipLevels = async <
  T extends Prisma.MemberShipLevelFindManyArgs,
>(
  payload: T,
) => {
  return prisma.memberShipLevel.findMany(payload) as Promise<
    Prisma.MemberShipLevelGetPayload<T>[]
  >;
};

// ** get single membership level
const getSingleMembershipLevel = async (id: string) => {
  return await prisma.memberShipLevel.findUnique({
    where: { id },
  });
};

// ** create new membership Level
const createNewMembershipLevel = async (payload: T_MembershipLevel) => {
  return await prisma.memberShipLevel.create({
    data: payload,
  });
};

// ** update membership Level
const updateMembershipLevel = async (
  id: string,
  payload: T_UpdateMembershipLevel,
) => {
  return await prisma.memberShipLevel.update({
    where: { id },
    data: payload,
  });
};

// ** get membership Level count
const getMembershipLevelCount = async () => {
  return await prisma.memberShipLevel.count();
};

// ** User's membership level
const getUsersMembershipLevel = async <T extends Prisma.UserFindManyArgs>(
  payload: T,
) => {
  return prisma.user.findMany(payload) as Promise<Prisma.UserGetPayload<T>[]>;
};

// ** delete membership Level
const deleteMembershipLevel = async (id: string) => {
  return await prisma.memberShipLevel.delete({
    where: { id },
  });
};

export const membershipLevelRepository = {
  getAllMembershipLevels,
  getSingleMembershipLevel,
  getMembershipLevelCount,
  createNewMembershipLevel,
  updateMembershipLevel,
  deleteMembershipLevel,
  getUsersMembershipLevel,
};
