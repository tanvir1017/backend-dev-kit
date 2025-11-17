// src/app/modules/favorites/validation/favorite.validation.ts
import { z } from "zod";

const createNewFavoriteSchema = z.object({
  body: z.object({
    taobao_num_iid: z.string({
      required_error: "Taobao product ID is required",
    }),
    main_photo: z.string({
      required_error: "Main photo URL is required",
    }),
    title: z.string({
      required_error: "Product title is required",
    }),
    descriptions: z.string({
      required_error: "Product description is required",
    }),
    price: z.string({
      required_error: "Product price is required",
    }),
  }),
});

export const favoriteValidation = {
  createNewFavoriteSchema,
};
