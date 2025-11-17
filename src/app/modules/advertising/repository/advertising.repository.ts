import prisma from "../../../../lib/utils/prisma.utils";
import { T_UpdateAdvertising } from "../types/advertising.types";

// ** get advertising
const getAdvertising = async () => {
  return await prisma.advertising.findFirst();
};

// ** update Advertising
const updateAdvertising = async (
  id: string,
  payload: T_UpdateAdvertising & {
    advertisingImageUrl: string;
  },
) => {
  return await prisma.advertising.update({
    where: { id },
    data: payload,
  });
};

export const advertisingRepository = {
  getAdvertising,
  updateAdvertising,
};
