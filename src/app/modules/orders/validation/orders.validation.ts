import { ProductStatus } from "@prisma/client";
import { z } from "zod";

// add to cart product input validation schema
export const skuSchema = z.object({
  body: z.object({
    price: z.number().nonnegative().min(0).default(0),
    original_price: z.number().nonnegative().min(0).default(0),
    properties_name: z.string(),
    quantity: z
      .number({
        required_error: "Quantity is required!",
      })
      .int("Quantity must be an integer"),
    sku_id: z.string({
      required_error: "Sku id is required!",
    }),
  }),
});

const cartSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Product title is required!",
      })
      .trim(),
    shortDesc: z.string().trim().optional(),
    // quantity: z.number().min(1, {
    //   message: "Quantity must be at least 1",
    // }),
    // price: z.number().min(1, {
    //   message: "Quantity must be at least 1",
    // }),
    photos: z.array(z.string()).default([]),
    taobao_num_iid: z.string({
      required_error: "Taobao product id is required!",
    }),
    category_id: z.string({
      required_error: "Taobao product category id is required!",
    }),
    skus: z.array(skuSchema.shape.body),
    customerRemark: z.string().trim().optional(),
    orderStatus: z.enum([
      ...(Object.values(ProductStatus) as [string, ...string[]]),
    ]),
  }),
});

const createAddonSchema = z.object({
  body: z.object({
    orderId: z
      .string({
        required_error: "Order id must be provided!",
      })
      .min(24)
      .trim(),

    addonServiceId: z.array(
      z
        .string({
          required_error: "Addon service id must be provided!",
        })
        .min(24)
        .trim(),
    ),
  }),
});

export const addToCartValidation = {
  create: cartSchema,
  addOnSchema: createAddonSchema,
};
//////////////////////////// <- End -> ////////////////////////////////////////////
