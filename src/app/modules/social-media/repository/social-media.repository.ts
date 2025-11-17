import { SocialMedia } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

// ** get all social media links
const getAllSocialMedia = async (
  limit: number,
  skip: number,
  query?: Record<string, any>,
) => {
  return await prisma.socialMedia.findMany({
    take: limit,
    skip,
  });
};

// ** get social media by id
const getSocialMediaById = async (id: string) => {
  return await prisma.socialMedia.findFirst({
    where: {
      id,
    },
  });
};

// ** insert social media into db
const createSocialMedia = async (payload: SocialMedia) => {
  return await prisma.socialMedia.create({
    data: payload,
  });
};

// ** get social media count
const getSocialMediaCount = async () => {
  return await prisma.socialMedia.count();
};

// ** update social media
const updateSocialMedia = async (id: string, payload: Partial<SocialMedia>) => {
  return await prisma.socialMedia.update({
    where: { id },
    data: payload,
  });
};

// ** delete social media
const deleteSocialMedia = async (id: string) => {
  return await prisma.socialMedia.delete({
    where: { id },
  });
};

export const socialMediaRepository = {
  getAllSocialMedia,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  getSocialMediaCount,
  getSocialMediaById,
};
