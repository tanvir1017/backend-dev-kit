import AppError from "../../../errors/appError";
import { whatsappContactRepository } from "../repository/whatsapp-contact.repository";

import { HttpStatusCode } from "axios";
import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import { T_WhatsappContactUpdate } from "../types/whatsapp-contact.types";

// ** get getWhatsappContact
const getWhatsappContact = async () => {
  return await whatsappContactRepository.getWhatsappContact();
};

// ** update whatsapp contact
const updateWhatsappContact = async (
  payload: T_WhatsappContactUpdate,
  whatsappImageFile?: Express.Multer.File,
) => {
  const whatsappContact = await whatsappContactRepository.getWhatsappContact();

  if (!whatsappContact && !whatsappImageFile) {
    throw new AppError(HttpStatusCode.NotAcceptable, "No imag file provided");
  }

  if (whatsappImageFile) {
    const { Location } =
      await bucketStorageService.uploadToDigitalOceanAWS(whatsappImageFile);
    await bucketStorageService.deleteFromDigitalOceanAWS(
      whatsappContact?.imageUrl as string,
    );
    payload.imageUrl = Location;
  }

  if (!whatsappContact) {
    return await whatsappContactRepository.createWhatsappContact({
      ...payload,
    });
  }

  return await whatsappContactRepository.updateWhatsappContact(
    whatsappContact?.id as string,
    { ...payload },
  );
};

export const whatsappContactService = {
  getWhatsappContact,
  updateWhatsappContact,
};
