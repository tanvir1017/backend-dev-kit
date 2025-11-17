import { NormalOrHiddenStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import prisma from "../../../../lib/utils/prisma.utils";
import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import AppError from "../../../errors/appError";
import { advertisingRepository } from "../repository/advertising.repository";
import { T_UpdateAdvertising } from "../types/advertising.types";

// ** get Advertising
const getAdvertising = async () => {
  return await advertisingRepository.getAdvertising();
};

// ** update advertising
const updateAdvertising = async (
  payload: T_UpdateAdvertising,
  file: Express.Multer.File,
) => {
  const isAdAlreadyExist = await advertisingRepository.getAdvertising();
  // so if it is for the first time then image is required and id is not provided means there is no advertising exists
  if (!isAdAlreadyExist) {
    if (!file) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Advertising image is required",
      );
    }

    const { Location: link } =
      await bucketStorageService.uploadToDigitalOceanAWS(file);
    return await prisma.advertising.create({
      data: {
        link: payload.link,
        text: payload.text,
        status: payload.status as NormalOrHiddenStatus,
        advertisingImageUrl: link,
      },
    });
  } else {
    let link;
    if (file) {
      const { Location } =
        await bucketStorageService.uploadToDigitalOceanAWS(file);
      link = Location;
    }
    const result = await prisma.advertising.update({
      where: {
        id: isAdAlreadyExist.id,
      },
      data: {
        link: payload.link || isAdAlreadyExist.link,
        text: payload.text || isAdAlreadyExist.text,
        status:
          (payload.status as NormalOrHiddenStatus) || isAdAlreadyExist.status,
        advertisingImageUrl: link || isAdAlreadyExist.advertisingImageUrl,
      },
    });

    return result;
  }
};

export const advertisingService = {
  getAdvertising,
  updateAdvertising,
};
