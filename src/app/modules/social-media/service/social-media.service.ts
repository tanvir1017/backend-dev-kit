import { SocialMedia } from "@prisma/client";
import { HttpStatusCode } from "axios";

import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import AppError from "../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../interface/common.interface";
import { Logger } from "../../logger/utils/logger.utils";
import { socialMediaRepository } from "../repository/social-media.repository";

// ** get all social media
const getAllSocialMedia = async (query: I_PaginationOptions) => {
  const { limit, skip, page } = calculatePagination(query);

  // get total count of contact us
  const totalCount = await socialMediaRepository.getSocialMediaCount();

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const result = await socialMediaRepository.getAllSocialMedia(
    limit,
    skip,
    query!,
  );

  const paginationSchema: I_PaginationResponse<SocialMedia[]> = {
    meta: {
      totalCount,
      totalPages,
      page,
      limit,
    },
    result,
  };

  return paginationSchema;
};

// ** get social media by id
const getSocialMediaById = async (id: string) => {
  const socialMediaExist = await socialMediaRepository.getSocialMediaById(id);

  if (!socialMediaExist) {
    throw new AppError(HttpStatusCode.NotFound, "Social media not found");
  }
  return await socialMediaRepository.getSocialMediaById(id);
};

// ** create new social media
const createSocialMedia = async (
  payload: SocialMedia,
  file: Express.Multer.File,
  user: I_GlobalJwtPayload,
) => {
  if (!file) {
    throw new AppError(HttpStatusCode.NotAcceptable, "Image file not provided");
  }

  const logger = new Logger({
    email: user.email,
    id: user.id,
    role: user.role,
  });

  //const imageUrl = await constructUrlAndImageUploaderUtil(file, "social-media");
  const { Location: imageUrl } =
    await bucketStorageService.uploadToDigitalOceanAWS(file);

  const createSocialMedia = await socialMediaRepository.createSocialMedia({
    ...payload,
    imageUrl,
  });

  await logger.create({
    module: "SocialMedia",
    description: `Added enw social media. ID: ${createSocialMedia.id}. Name: ${createSocialMedia.title}`,
    entityId: createSocialMedia.id,
    data: createSocialMedia,
  });

  return createSocialMedia;
};

// ** update social media
const updateSocialMedia = async (
  id: string,
  payload: Partial<SocialMedia>,
  file: Express.Multer.File,
  user: I_GlobalJwtPayload,
) => {
  const socialMediaExist = await socialMediaRepository.getSocialMediaById(id);

  if (!socialMediaExist) {
    throw new AppError(HttpStatusCode.NotFound, "Social media not found");
  }

  const logger = new Logger({
    email: user.email,
    id: user.id,
    role: user.role,
  });

  let socialMediaUrl;

  if (file) {
    //const url = await constructUrlAndImageUploaderUtil(file, "social-media");
    const { Location: url } =
      await bucketStorageService.uploadToDigitalOceanAWS(file);

    // delete old file
    //await deleteFileByUrl(socialMediaExist.imageUrl);
    await bucketStorageService.deleteFromDigitalOceanAWS(
      socialMediaExist.imageUrl,
    );
    socialMediaUrl = url;
  }

  const response = await socialMediaRepository.updateSocialMedia(id, {
    ...payload,
    imageUrl: socialMediaUrl || socialMediaExist.imageUrl,
  });

  await logger.update({
    description: `Social media information updated for - ID:${id}`,
    entityId: id,
    module: "SocialMedia",
    newData: response,
    oldData: socialMediaExist,
  });

  return response;
};

// ** delete social media
const deleteSocialMedia = async (id: string, user: I_GlobalJwtPayload) => {
  const socialMediaExist = await socialMediaRepository.getSocialMediaById(id);

  if (!socialMediaExist) {
    throw new AppError(HttpStatusCode.NotFound, "Social media not found");
  }

  const logger = new Logger({
    email: user.email,
    id: user.id,
    role: user.role,
  });

  // delete old file
  await bucketStorageService.deleteFromDigitalOceanAWS(
    socialMediaExist.imageUrl,
  );

  await socialMediaRepository.deleteSocialMedia(id);

  // adding logger to it
  await logger.delete({
    description: `Deleted social media - ID:${id}`,
    entityId: id,
    module: "SocialMedia",
    deletedData: socialMediaExist,
  });

  return null;
};

export const socialMediaService = {
  getAllSocialMedia,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  getSocialMediaById,
};
