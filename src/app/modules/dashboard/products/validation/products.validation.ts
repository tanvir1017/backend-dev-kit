import { GoodTypes, ProductStatus } from "@prisma/client";
import { z } from "zod";

const changeProductStatus = z.object({
  body: z.object({
    status: z.nativeEnum(ProductStatus, { message: "Status is required!" }),
    productId: z
      .string({
        required_error: "Product id must be provided!",
      })
      .min(24)
      .max(24),
  }),
});

const qcDetailsSchema = z.object({
  body: z.object({
    length: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative(),
    width: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative(),
    height: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative(),
    weight: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative(),
    typeOfGoods: z.nativeEnum(GoodTypes),
    notifyUser: z.boolean({
      required_error: "Notify user is required! It only accept true or false",
    }),
    remark: z.string().optional(),
    cartProductId: z
      .string({
        required_error: "Cart product ID is required!",
      })
      .min(24)
      .max(24),
  }),
});

const updateQcDetailsSchema = z.object({
  body: z.object({
    length: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative()
      .optional(),
    width: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative()
      .optional(),
    height: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative()
      .optional(),
    weight: z
      .number({
        required_error: "Length is required!",
      })
      .nonnegative()
      .optional(),
    typeOfGoods: z.nativeEnum(GoodTypes).optional(),
    notifyUser: z
      .boolean({
        required_error: "Notify user is required! It only accept true or false",
      })
      .optional(),
    remark: z.string().optional().optional(),
  }),
});

export const productValidation = {
  changeProductStatus,
  qcDetails: qcDetailsSchema,
  updateQcDetailsSchema,
};
//////////////////////////// <- End -> ////////////////////////////////////////////
