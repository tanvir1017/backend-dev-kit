import { CartProduct } from "@prisma/client";
import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { orderServices } from "../service/orders.service";
import { T_AddToCartProps } from "../types/orders.types";

export const orderController = {
  // Get all orders(Product Lists)
  getAllProductLists: asyncHandler(async (req, res) => {
    const result = await orderServices.getAllProductListsFromDb(); // products -> orders
    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Product lists retrieved successfully",
      data: result,
    });
  }),

  // Product add to cart functionality
  addToCartProduct: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload; // logged in user
    const body = req.body as typeof req.body as T_AddToCartProps["body"];

    const result = await orderServices.addToCart({
      user,
      payload: body,
    });

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Product added to cart successfully",
      data: result,
    });
  }),

  // Remove product from the cart
  removeProductFromCart: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload; // logged in user
    const body = req.body as Pick<CartProduct, "id">;

    const result = await orderServices.removeCartProduct({
      user,
      cartProductId: body.id,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Product removed from cart successfully",
      data: result,
    });
  }),

  // Get logged in user carts
  getMyCarts: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload; // logged in user
    const query = req.query as typeof req.query & I_PaginationOptions;
    const result = await orderServices.getMyCartsFromDb({
      user,
      query,
    });

    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Retrieved my cart successfully",
      data: result,
    });
  }),

  // Add on service
  addonServiceOnOrder: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload; // logged in user
    const body = req.body as {
      addonServiceId: string[];
      orderId: string;
    };

    const result = await orderServices.addonServiceOnOrder({
      user,
      addonServiceId: body.addonServiceId,
      orderId: body.orderId,
    });

    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Addon service added successfully!",
      data: result,
    });
  }),

  // Remove add on services
  removeAddonService: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload; // logged in user

    const body = req.body as typeof req.body & {
      addonServiceId: string;
      orderId: string;
    };
    const result = await orderServices.removeAddonServiceFromOrder({
      user,
      addonServiceId: body.serviceId,
      orderId: body.orderId,
    });

    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Addon service removed successfully!",
      data: result,
    });
  }),
};
