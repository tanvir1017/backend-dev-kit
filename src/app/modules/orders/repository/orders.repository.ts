import { OrderAddons, Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import { T_CartPayload, T_CreateOrderPayload } from "../types/orders.types";

export const orderRepository = {
  // Get all orderServices
  getAllProductLists: async (select?: Prisma.OrderSelect) => {
    return await prisma.order.findMany({
      select,
    });
  },
  // get single order
  getSingleOrderByUserID: async (
    userId: string,
    select: Prisma.OrderSelect = {
      id: true,
    },
  ) => {
    return await prisma.order.findFirst({
      where: {
        userId: userId,
        orderStatus: "PAYMENT_PENDING",
      },
      select,
    });
  },

  /**
   * Get single order by its orderI
   */
  getSingleOrderByID: async (
    whereClause: Prisma.OrderWhereUniqueInput,
    select: Prisma.OrderSelect = {
      id: true,
    },
  ) => {
    return await prisma.order.findUnique({
      where: whereClause,
      select,
    });
  },

  // Create order
  createOrder: async (
    payload: T_CreateOrderPayload,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.order.create({
      data: payload,
    });
  },

  // Update the order
  updateOrder: async (
    {
      payload,
      orderId,
    }: {
      payload: Partial<T_CreateOrderPayload>;
      orderId: string;
    },
    tx: Prisma.TransactionClient = prisma,
  ) => {
    return await tx.order.update({
      where: {
        id: orderId,
      },
      data: payload,
    });
  },

  ////////////////////////////////////////////////////////////////////////////////////
  // // // // // // // _>  Cart
  ////////////////////////////////////////////////////////////////////////////////////

  // Get the cart product
  getCatProduct: async ({
    whereClause,
    includes = {},
  }: {
    whereClause:
      | Prisma.CartProductWhereUniqueInput
      | Prisma.CartProductWhereInput;
    includes?: Prisma.CartProductInclude;
  }) => {
    const result = await prisma.cartProduct.findFirst({
      where: whereClause,
      include: includes,
    });

    return result;
  },

  // Get single cart
  getSingleCart: async ({
    cartProdId,
    includes,
  }: {
    cartProdId: string;
    includes: Prisma.CartProductInclude;
  }): Promise<Prisma.CartProductGetPayload<{ include: typeof includes }>> => {
    const result = await prisma.cartProduct.findUnique({
      where: {
        id: cartProdId,
      },
      ...(includes && {
        include: includes,
      }),
    });

    return result!;
  },

  // create cart
  createCart: async (
    payload: Omit<T_CartPayload, "storageId" | "packagesId">,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.cartProduct.create({
      data: payload,
    });
  },
  // Update cart
  updateCart: async (
    { cartId, payload }: { cartId: string; payload: Partial<T_CartPayload> },
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.cartProduct.update({
      where: {
        id: cartId,
      },
      data: payload,
    });
  },

  // create cart
  removeCartProduct: async (id: string) => {
    return await prisma.cartProduct.delete({
      where: {
        id,
      },
    });
  },

  // delete cart within transaction
  deleteCart: async (
    { cartId }: { cartId: string },
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.cartProduct.delete({
      where: {
        id: cartId,
      },
    });
  },

  // retrieve  logged in user cart
  myCarts: async <T extends Prisma.CartProductFindManyArgs>(args: T) => {
    return await prisma.cartProduct.findMany({
      ...args,
    });
  },

  // create order-addons
  createOrderAddons: async ({
    payload,
    tx = prisma,
  }: {
    payload: Pick<OrderAddons, "orderId" | "serviceId">;
    tx: Prisma.TransactionClient;
  }) => {
    return await tx.orderAddons.create({
      data: {
        orderId: payload.orderId,
        serviceId: payload.serviceId,
      },
    });
  },

  // create order-addons
  createManyOrderAddons: async ({
    payload,
    tx = prisma,
  }: {
    payload: Pick<OrderAddons, "orderId" | "serviceId">;
    tx: Prisma.TransactionClient;
  }) => {
    return await tx.orderAddons.createMany({ data: payload });
  },

  // Get add-on by order id and service id
  getSingleOrderAddons: async (
    payload: Pick<OrderAddons, "orderId" | "serviceId">,
  ) => {
    return await prisma.orderAddons.findFirst({
      where: {
        orderId: payload.orderId,
        serviceId: payload.serviceId,
      },
    });
  },

  // remove add-ons
  removeOrderAddons: async (payload: Pick<OrderAddons, "id">) => {
    return await prisma.orderAddons.delete({
      where: {
        id: payload.id,
      },
    });
  },
};
