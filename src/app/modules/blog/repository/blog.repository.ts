import { Blog } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import { de } from "date-fns/locale";
import { T_NewBlog, T_UpdateBlog } from "../types/blog.types";

// ** get all blogs
const getAllBlogs = async (
  limit: number,
  skip: number,
  query?: Record<string, any>,
) => {
  return await prisma.blog.findMany({
    take: limit,
    skip,
  });
};

// ** get blog by id
const getSingleBlog = async (id: string) => {
  return await prisma.blog.findFirst({
    where: { id },
  });
};

// ** create new blog
const createNewBlog = async (payload: T_NewBlog) => {
  return await prisma.blog.create({
    data: payload,
  });
};

// ** update blog
const updateBlog = async (id: string, payload: T_UpdateBlog) => {
  return await prisma.blog.update({
    where: { id },
    data: payload,
  });
};

// ** get blog count
const getBlogCount = async () => {
  return await prisma.blog.count();
};

// ** delete blog
const deleteBlog = async (id: string) => {
  return await prisma.blog.delete({
    where: { id },
  });
};

export const blogRepository = {
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  createNewBlog,
  deleteBlog,
  getBlogCount,
};
