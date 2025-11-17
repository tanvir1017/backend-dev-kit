import { helpCenterInfoRepository } from "../repository/help-center.repository";
import { T_UpdateHelpCenter } from "../types/help-center.types";

// ** get help center info
const getHelpCenterInfo = async () => {
  let helpCenterInfo = await helpCenterInfoRepository.getHelpCenterInfo();

  if (!helpCenterInfo) {
    const newInfo = await helpCenterInfoRepository.createHelpCenterInfo({
      email: "example@gmail.com",
      whatsAppNumber: "015487457...",
    });

    helpCenterInfo = newInfo;
  }

  return helpCenterInfo;
};

const updateHelpCenterInfo = async (payload: T_UpdateHelpCenter) => {
  let helpCenterInfo = await helpCenterInfoRepository.getHelpCenterInfo();

  if (!helpCenterInfo) {
    return await helpCenterInfoRepository.createHelpCenterInfo({
      email: payload.email as string,
      whatsAppNumber: payload.whatsAppNumber as string,
    });
  } else {
    return await helpCenterInfoRepository.updateHelpCenterInfo(
      helpCenterInfo.id,
      payload,
    );
  }
};

export const helpCenterInfoService = {
  getHelpCenterInfo,
  updateHelpCenterInfo,
};
