import { z } from "zod";
import { blogValidationSchema } from "../validation/blog.validation";

export type T_NewBlog = z.infer<
  typeof blogValidationSchema.newBlogSchema
>["body"] & {
  blogThumbnailUrl: string;
};

export type T_UpdateBlog = z.infer<
  typeof blogValidationSchema.updateBlogSchema
>["body"] & {
  blogThumbnailUrl?: string;
};
