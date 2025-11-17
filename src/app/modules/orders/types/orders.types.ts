import { CartProduct, Order } from "@prisma/client";
import { z } from "zod";
import {
  I_GlobalJwtPayload,
  T_PrismaModelOmittedProp,
} from "../../../interface/common.interface";
import {
  addToCartValidation,
  skuSchema,
} from "../validation/orders.validation";

export type T_AddToCartProps = z.infer<typeof addToCartValidation.create>;

export type T_Sku = z.infer<typeof skuSchema>;

export type T_CreateOrderPayload = Omit<Order, T_PrismaModelOmittedProp>;

export type T_CartPayload = Omit<CartProduct, T_PrismaModelOmittedProp>;

export type T_CartsReturnTypes = {
  cart: CartProduct;
};

export type T_AddonServiceProps = {
  orderId: string;
  addonServiceId: string[];
  user: I_GlobalJwtPayload;
};
