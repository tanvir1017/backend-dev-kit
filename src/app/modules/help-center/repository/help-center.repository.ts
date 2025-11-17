import { HelpCenter } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import { T_UpdateHelpCenter } from "../types/help-center.types";

// ** get help center info
const getHelpCenterInfo = async () => {
  return await prisma.helpCenter.findFirst();
};

// ** get help center info
const createHelpCenterInfo = async (
  payload: Omit<HelpCenter, "id" | "updatedAt">,
) => {
  return await prisma.helpCenter.create({
    data: payload,
  });
};

// ** update help center info
const updateHelpCenterInfo = async (
  id: string,
  payload: T_UpdateHelpCenter,
) => {
  return await prisma.helpCenter.update({
    where: { id },
    data: payload,
  });
};

export const helpCenterInfoRepository = {
  createHelpCenterInfo,
  getHelpCenterInfo,
  updateHelpCenterInfo,
};
