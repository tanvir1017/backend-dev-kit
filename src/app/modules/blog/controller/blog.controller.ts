import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { blogService } from "../service/blog.service";

// ** get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const results = await blogService.getAllBlogs(req.query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all blogs success",
    data: results,
  });
});

// ** get blog by id
const getSingleBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await blogService.getSingleBlog(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single blog success",
    data: blog,
  });
});

// ** create new blog
const createNewBlog = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File;
  const blog = await blogService.createNewBlog(req.body, file);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Creating new blog success",
    data: blog,
  });
});

// ** update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await blogService.updateBlog(
    id,
    req.body,
    req.file as Express.Multer.File,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating blog success",
    data: blog,
  });
});

// ** get blog by id
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await blogService.deleteBlog(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Deleting blog success",
    data: null,
  });
});

export const blogController = {
  getAllBlogs,
  getSingleBlog,
  createNewBlog,
  updateBlog,
  deleteBlog,
};
