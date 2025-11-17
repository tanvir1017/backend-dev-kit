import { orderRepository } from "../repository/orders.repository";
import { T_Sku } from "../types/orders.types";
import { CartCacheManager } from "../utils/cart-cache.utils";

/**
 * Get user's current order with caching
 * Falls back to database if cache misses
 */
export const getUserOrderWithCacheService = async (userId: string) => {
  try {
    // Try cache first
    const cachedOrder = await CartCacheManager.getCachedUserOrder(userId);

    if (cachedOrder) {
      console.log(`[Cache HIT] Order retrieved from Redis for user ${userId}`);
      return cachedOrder;
    }

    // Cache miss - fetch from database
    console.log(
      `[Cache MISS] Order not in cache, fetching from DB for user ${userId}`,
    );
    const order = await orderRepository.getSingleOrderByUserID(userId, {
      id: true,
      totalPrice: true,
      localDeliveryFee: true,
    });

    if (order) {
      // Cache for future requests
      await CartCacheManager.cacheUserOrder(userId, {
        id: order.id,
        totalPrice: order.totalPrice,
        localDeliveryFee: order.localDeliveryFee,
      });
    }

    return order;
  } catch (error) {
    console.error("Get user order with cache error:", error);
    // Fallback to direct database query
    return await orderRepository.getSingleOrderByUserID(userId, {
      id: true,
      totalPrice: true,
      localDeliveryFee: true,
    });
  }
};

/**
 * Get cart items for an order with caching
 * Falls back to database if cache misses
 */
export const getCartItemsWithCacheService = async (
  orderId: string,
  includeOrder = false,
) => {
  try {
    // Try cache first
    const cachedItems = await CartCacheManager.getCachedCartItems(orderId);

    if (cachedItems && cachedItems.length > 0) {
      console.log(
        `[Cache HIT] Cart items retrieved from Redis for order ${orderId}`,
      );
      return cachedItems;
    }

    // Cache miss - fetch from database
    console.log(
      `[Cache MISS] Cart items not in cache, fetching from DB for order ${orderId}`,
    );
    const cartItems = await orderRepository.getCatProduct({
      whereClause: { orderId },
    });

    if (cartItems) {
      // Cache for future requests
      const itemsToCache = [
        {
          id: cartItems.id,
          taobao_num_iid: cartItems.taobao_num_iid,
          sku: cartItems.sku as T_Sku["body"][],
          quantity: cartItems.quantity,
          price: cartItems.price,
          deliveryFee: cartItems.deliveryFee,
        },
      ];

      await CartCacheManager.cacheCartItems(orderId, itemsToCache);
    }

    return cartItems;
  } catch (error) {
    console.error("Get cart items with cache error:", error);
    // Fallback to direct database query
    return await orderRepository.getCatProduct({
      whereClause: { orderId },
    });
  }
};

/**
 * Invalidate cart cache on significant changes (checkout, payment, etc)
 */
export const invalidateCartCacheService = async (
  userId: string,
  orderId?: string,
) => {
  try {
    await CartCacheManager.invalidateAllUserCartCache(userId, orderId);
    console.log(`[Cache INVALIDATED] Cart cache cleared for user ${userId}`);
  } catch (error) {
    console.error("Invalidate cart cache error:", error);
  }
};
