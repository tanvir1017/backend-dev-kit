import { Router } from "express";
import { fileUploader } from "../../../../lib/utils/file-uploader";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { blogController } from "../controller/blog.controller";
import { blogValidationSchema } from "../validation/blog.validation";

const router = Router();

// ** get all blogs
router.route("/").get(blogController.getAllBlogs);

// ** get blog by id
router.route("/:id").get(blogController.getSingleBlog);

// ** create blog
router
  .route("/")
  .post(
    fileUploader.uploadSingle,
    sanitizeInputData(blogValidationSchema.newBlogSchema),
    blogController.createNewBlog,
  );

// ** update blog
router
  .route("/:id")
  .patch(
    fileUploader.uploadSingle,
    sanitizeInputData(blogValidationSchema.updateBlogSchema),
    blogController.updateBlog,
  );

// ** delete blog
router.route("/:id").delete(blogController.deleteBlog);

export const BlogRoutes = router;
