import { redisCache } from "../../../../lib/redis/redis.utils";
import { convertToSeconds } from "../../../../lib/utils/TimeConvertor";
import { T_Sku } from "../types/orders.types";

/**
 * Redis Cache Key Generation for Cart Operations
 * Keys structure:
 * - cart:user:{userId} -> User's pending order cart items
 * - cart:order:{orderId} -> Order's cart items
 * - cart:lock:{userId} -> Lock to prevent race conditions
 */

export class CartCacheManager {
  private static readonly CACHE_TTL = convertToSeconds(30, "minutes"); // 30 minutes
  private static readonly LOCK_TTL = 10; // 10 seconds
  private static readonly LOCK_RETRY_DELAY = 100; // 100ms
  private static readonly LOCK_MAX_RETRIES = 50; // Max 5 seconds wait

  /**
   * Generate cache key for user's pending order
   */
  static getUserOrderCacheKey(userId: string): string {
    return `cart:user:${userId}:order`;
  }

  /**
   * Generate cache key for cart items
   */
  static getCartItemsCacheKey(orderId: string): string {
    return `cart:order:${orderId}:items`;
  }

  /**
   * Generate cache key for lock
   */
  static getLockKey(userId: string): string {
    return `cart:lock:${userId}`;
  }

  /**
   * Acquire lock to prevent race conditions using distributed lock pattern
   */
  static async acquireLock(userId: string): Promise<string> {
    const lockKey = this.getLockKey(userId);
    const lockValue = `${Date.now()}-${Math.random()}`;
    let retries = 0;

    while (retries < this.LOCK_MAX_RETRIES) {
      try {
        // Try to acquire lock with SET NX EX
        const lockAcquired = await redisCache.acquireLock(
          lockKey,
          lockValue,
          this.LOCK_TTL,
        );

        if (lockAcquired) {
          return lockValue;
        }

        retries++;
        await new Promise((resolve) =>
          setTimeout(resolve, this.LOCK_RETRY_DELAY),
        );
      } catch (error) {
        console.error("Lock acquisition error:", error);
        throw error;
      }
    }

    throw new Error(`Failed to acquire lock for user ${userId}`);
  }

  /**
   * Release lock
   */
  static async releaseLock(userId: string, lockValue: string): Promise<void> {
    const lockKey = this.getLockKey(userId);

    try {
      await redisCache.releaseLock(lockKey, lockValue);
    } catch (error) {
      console.error("Lock release error:", error);
    }
  }

  /**
   * Cache user's pending order information
   */
  static async cacheUserOrder(
    userId: string,
    orderData: {
      id: string;
      totalPrice: number;
      localDeliveryFee: number;
    },
  ): Promise<void> {
    const key = this.getUserOrderCacheKey(userId);

    try {
      await redisCache.set(key, orderData, this.CACHE_TTL);
    } catch (error) {
      console.error("Cache user order error:", error);
      // Don't throw - allow graceful fallback to DB
    }
  }

  /**
   * Get cached user order
   */
  static async getCachedUserOrder(userId: string): Promise<{
    id: string;
    totalPrice: number;
    localDeliveryFee: number;
  } | null> {
    const key = this.getUserOrderCacheKey(userId);

    try {
      return await redisCache.get(key);
    } catch (error) {
      console.error("Get cached user order error:", error);
      return null;
    }
  }

  /**
   * Cache cart items for an order
   */
  static async cacheCartItems(
    orderId: string,
    cartItems: Array<{
      id: string;
      taobao_num_iid: string;
      sku: T_Sku["body"][];
      quantity: number;
      price: number;
      deliveryFee: number;
    }>,
  ): Promise<void> {
    const key = this.getCartItemsCacheKey(orderId);

    try {
      await redisCache.set(key, cartItems, this.CACHE_TTL);
    } catch (error) {
      console.error("Cache cart items error:", error);
    }
  }

  /**
   * Get cached cart items
   */
  static async getCachedCartItems(orderId: string): Promise<Array<{
    id: string;
    taobao_num_iid: string;
    sku: T_Sku["body"][];
    quantity: number;
    price: number;
    deliveryFee: number;
  }> | null> {
    const key = this.getCartItemsCacheKey(orderId);

    try {
      return await redisCache.get(key);
    } catch (error) {
      console.error("Get cached cart items error:", error);
      return null;
    }
  }

  /**
   * Invalidate user order cache
   */
  static async invalidateUserOrderCache(userId: string): Promise<void> {
    const key = this.getUserOrderCacheKey(userId);

    try {
      await redisCache.del(key);
    } catch (error) {
      console.error("Invalidate user order cache error:", error);
    }
  }

  /**
   * Invalidate cart items cache
   */
  static async invalidateCartItemsCache(orderId: string): Promise<void> {
    const key = this.getCartItemsCacheKey(orderId);

    try {
      await redisCache.del(key);
    } catch (error) {
      console.error("Invalidate cart items cache error:", error);
    }
  }

  /**
   * Invalidate all cart-related cache for user
   */
  static async invalidateAllUserCartCache(
    userId: string,
    orderId?: string,
  ): Promise<void> {
    try {
      await Promise.all([
        this.invalidateUserOrderCache(userId),
        orderId ? this.invalidateCartItemsCache(orderId) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Invalidate all user cart cache error:", error);
    }
  }

  /**
   * Refresh cache after database update
   */
  static async refreshCartCache(
    userId: string,
    orderData: {
      id: string;
      totalPrice: number;
      localDeliveryFee: number;
    },
    cartItems: Array<{
      id: string;
      taobao_num_iid: string;
      sku: T_Sku["body"][];
      quantity: number;
      price: number;
      deliveryFee: number;
    }>,
  ): Promise<void> {
    try {
      await Promise.all([
        this.cacheUserOrder(userId, orderData),
        this.cacheCartItems(orderData.id, cartItems),
      ]);
    } catch (error) {
      console.error("Refresh cart cache error:", error);
    }
  }
}

export const cartCacheManager = new CartCacheManager();
