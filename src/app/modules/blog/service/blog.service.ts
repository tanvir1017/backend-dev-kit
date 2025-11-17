import { Blog } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { blogRepository } from "../repository/blog.repository";
import { T_NewBlog, T_UpdateBlog } from "../types/blog.types";

// ** get all blogs
const getAllBlogs = async (query?: Record<string, any>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = Number(page - 1) * limit || 0;

  // get total count of contact us
  const totalCount = await blogRepository.getBlogCount();

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const result = await blogRepository.getAllBlogs(limit, skip, query!);

  const paginationSchema: I_PaginationResponse<Blog[]> = {
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

// ** get blog by id
const getSingleBlog = async (id: string) => {
  const blogExist = await blogRepository.getSingleBlog(id);

  if (!blogExist) {
    throw new AppError(HttpStatusCode.NotFound, "Blog not found");
  }

  return blogExist;
};

// ** create new blog
const createNewBlog = async (payload: T_NewBlog, file: Express.Multer.File) => {
  if (!file) {
    throw new AppError(
      HttpStatusCode.NotAcceptable,
      "Blog thumbnail not provided",
    );
  }

  const { Location } = await bucketStorageService.uploadToDigitalOceanAWS(file);
  return await blogRepository.createNewBlog({
    ...payload,
    blogThumbnailUrl: Location,
  });
};

// ** update blog
const updateBlog = async (
  id: string,
  payload: T_UpdateBlog,
  file: Express.Multer.File,
) => {
  const blogExist = await blogRepository.getSingleBlog(id);

  if (!blogExist) {
    throw new AppError(HttpStatusCode.NotFound, "Blog not found");
  }

  let fileUrl;

  if (file) {
    const { Location } =
      await bucketStorageService.uploadToDigitalOceanAWS(file);
    await bucketStorageService.deleteFromDigitalOceanAWS(
      blogExist.blogThumbnailUrl,
    );
    fileUrl = Location;
  }

  return await blogRepository.updateBlog(id, {
    ...payload,
    blogThumbnailUrl: fileUrl || blogExist.blogThumbnailUrl,
  });
};

// ** delete blog
const deleteBlog = async (id: string) => {
  const blogExist = await blogRepository.getSingleBlog(id);

  if (!blogExist) {
    throw new AppError(HttpStatusCode.NotFound, "Blog not found");
  }

  return await blogRepository.deleteBlog(id);
};

export const blogService = {
  getAllBlogs,
  getSingleBlog,
  createNewBlog,
  updateBlog,
  deleteBlog,
};
