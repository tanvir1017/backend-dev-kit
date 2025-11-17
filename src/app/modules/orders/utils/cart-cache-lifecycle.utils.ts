import { CartCacheManager } from "./cart-cache.utils";

/**
 * Middleware/Interceptor for cache lifecycle management
 * Use this to automatically handle cache invalidation on critical operations
 */

export class CartCacheLifecycleManager {
  /**
   * Called after successful checkout
   * Invalidates all cart cache for the user
   */
  static async onCheckoutSuccess(userId: string, orderId: string) {
    try {
      console.log(
        `[Cache] Checkout completed for user ${userId}. Invalidating cache...`,
      );
      await CartCacheManager.invalidateAllUserCartCache(userId, orderId);
    } catch (error) {
      console.error("Checkout cache invalidation error:", error);
    }
  }

  /**
   * Called after successful payment
   * Invalidates order cache
   */
  static async onPaymentSuccess(userId: string, orderId: string) {
    try {
      console.log(
        `[Cache] Payment successful for user ${userId}. Invalidating order cache...`,
      );
      await CartCacheManager.invalidateUserOrderCache(userId);
      await CartCacheManager.invalidateCartItemsCache(orderId);
    } catch (error) {
      console.error("Payment cache invalidation error:", error);
    }
  }

  /**
   * Called when order is placed
   * Clears pending cart cache and creates new cache for the order
   */
  static async onOrderPlaced(
    userId: string,
    orderData: {
      id: string;
      totalPrice: number;
      localDeliveryFee: number;
    },
  ) {
    try {
      console.log(`[Cache] Order placed for user ${userId}. Updating cache...`);
      // Invalidate old pending order cache
      await CartCacheManager.invalidateUserOrderCache(userId);

      // Cache new order
      await CartCacheManager.cacheUserOrder(userId, orderData);
    } catch (error) {
      console.error("Order placement cache error:", error);
    }
  }

  /**
   * Called when order is modified (quantity change, item addition/removal)
   * Refreshes cache with updated data
   */
  static async onOrderModified(
    userId: string,
    orderData: {
      id: string;
      totalPrice: number;
      localDeliveryFee: number;
    },
    cartItems: Array<{
      id: string;
      taobao_num_iid: string;
      sku: any[];
      quantity: number;
      price: number;
      deliveryFee: number;
    }>,
  ) {
    try {
      console.log(
        `[Cache] Order modified for user ${userId}. Refreshing cache...`,
      );
      await CartCacheManager.refreshCartCache(userId, orderData, cartItems);
    } catch (error) {
      console.error("Order modification cache error:", error);
    }
  }

  /**
   * Called when entire cart is cleared
   * Clears all cart cache
   */
  static async onCartCleared(userId: string) {
    try {
      console.log(`[Cache] Cart cleared for user ${userId}. Clearing cache...`);
      // Get all user orders and invalidate cache
      await CartCacheManager.invalidateUserOrderCache(userId);
    } catch (error) {
      console.error("Cart clearing cache error:", error);
    }
  }

  /**
   * Called on any cache error to ensure consistency
   * Force clear all cache for user
   */
  static async onCacheError(userId: string, orderId?: string) {
    try {
      console.warn(
        `[Cache] Error detected. Force clearing cache for user ${userId}...`,
      );
      await CartCacheManager.invalidateAllUserCartCache(userId, orderId);
    } catch (error) {
      console.error("Force cache clear error:", error);
    }
  }

  /**
   * Simulate cache invalidation for testing
   * ONLY FOR DEVELOPMENT/TESTING
   */
  static async clearAllUserCaches(userId: string) {
    try {
      console.log(`[Cache] CLEARING ALL CACHES FOR USER ${userId}`);
      await CartCacheManager.invalidateUserOrderCache(userId);
      // Add any other cache clearing operations here
    } catch (error) {
      console.error("Clear all caches error:", error);
    }
  }
}

export const cartCacheLifecycleManager = new CartCacheLifecycleManager();
