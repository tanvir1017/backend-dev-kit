import { OrderStatus, WarehouseName } from "@prisma/client";
import { z } from "zod";

const createNewDiyOrderSchema = z.object({
  body: z
    .object({
      productLink: z
        .string({
          required_error: "Product link is required",
        })
        .url("Please provide a valid URL"),
      productName: z
        .string({
          required_error: "Product name is required",
        })
        .min(1, "Product name is required"),
      remark: z.string().optional(),
      price: z
        .number({
          required_error: "Product price is required",
        })
        .min(0, "Product price cannot be negative"),
      quantity: z.number().min(1, "Quantity must be greater than 0").default(1),
      warehouse: z.enum([...Object.values(WarehouseName)] as [
        string,
        ...string[],
      ]),
      domesticFee: z
        .number({
          required_error: "Delivery fee is required",
        })
        .min(0, "Delivery fee cannot be negative"),
    })
    .strict(),
});

const updateDiyOrderSchema = z.object({
  body: z
    .object({
      productLink: z.string().url("Please provide a valid URL").optional(),
      productName: z.string().min(1, "Product name is required").optional(),
      remark: z.string().optional(),
      productPrice: z
        .number()
        .min(0, "Product price cannot be negative")
        .optional(),
      warehouse: z.string().optional(),
      deliveryFee: z
        .number()
        .min(0, "Delivery fee cannot be negative")
        .optional(),
      total: z.number().min(0, "Total amount cannot be negative").optional(),
      pictureUrl: z.string().optional(),
      status: z
        .enum([...(Object.values(OrderStatus) as [string, ...string[]])])
        .optional(),
    })
    .strict(),
});

const calculateTotalSchema = z.object({
  body: z.object({
    productPrice: z.number().min(0, "Product price cannot be negative"),
    deliveryFee: z.number().min(0, "Delivery fee cannot be negative"),
  }),
});

export const diyOrderValidation = {
  createNewDiyOrderSchema,
  updateDiyOrderSchema,
  calculateTotalSchema,
};
