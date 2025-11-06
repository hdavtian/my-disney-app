/**
 * Cache Service for Disney App
 * Provides localStorage-based caching with TTL (Time To Live) functionality
 * Cache duration: 2 hours
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

export class CacheService {
  private static readonly CACHE_PREFIX = "disney_";
  private static readonly DEFAULT_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  /**
   * Store data in cache with TTL
   */
  static set<T>(
    key: string,
    data: T,
    ttl: number = CacheService.DEFAULT_TTL
  ): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        expiry: Date.now() + ttl,
      };

      const cacheKey = `${CacheService.CACHE_PREFIX}${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));

      // Log cache operation in development
      if (import.meta.env.DEV) {
        console.log(
          `🔄 Cache SET: ${key} (expires in ${ttl / 1000 / 60} minutes)`
        );
      }
    } catch (error) {
      console.error("Cache set error:", error);
      // Gracefully handle localStorage errors (quota exceeded, etc.)
    }
  }

  /**
   * Retrieve data from cache if not expired
   */
  static get<T>(key: string): T | null {
    try {
      const cacheKey = `${CacheService.CACHE_PREFIX}${key}`;
      const item = localStorage.getItem(cacheKey);

      if (!item) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(item);

      // Check if cache has expired
      if (Date.now() > cacheItem.expiry) {
        CacheService.remove(key);

        if (import.meta.env.DEV) {
          console.log(`⏰ Cache EXPIRED: ${key}`);
        }

        return null;
      }

      if (import.meta.env.DEV) {
        const remainingTime = Math.round(
          (cacheItem.expiry - Date.now()) / 1000 / 60
        );
        console.log(
          `✅ Cache HIT: ${key} (${remainingTime} minutes remaining)`
        );
      }

      return cacheItem.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Remove specific item from cache
   */
  static remove(key: string): void {
    try {
      const cacheKey = `${CacheService.CACHE_PREFIX}${key}`;
      localStorage.removeItem(cacheKey);

      if (import.meta.env.DEV) {
        console.log(`🗑️ Cache REMOVE: ${key}`);
      }
    } catch (error) {
      console.error("Cache remove error:", error);
    }
  }

  /**
   * Clear all Disney app cache
   */
  static clear(): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CacheService.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      if (import.meta.env.DEV) {
        console.log(`🧹 Cache CLEARED: ${keysToRemove.length} items removed`);
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    totalItems: number;
    totalSize: string;
    items: Array<{ key: string; size: string; expiresIn: string }>;
  } {
    const items: Array<{ key: string; size: string; expiresIn: string }> = [];
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CacheService.CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const size = new Blob([item]).size;
            totalSize += size;

            try {
              const cacheItem: CacheItem<any> = JSON.parse(item);
              const expiresIn = Math.max(
                0,
                Math.round((cacheItem.expiry - Date.now()) / 1000 / 60)
              );

              items.push({
                key: key.replace(CacheService.CACHE_PREFIX, ""),
                size: `${(size / 1024).toFixed(1)} KB`,
                expiresIn: `${expiresIn} min`,
              });
            } catch {
              // Skip malformed cache items
            }
          }
        }
      }
    } catch (error) {
      console.error("Cache stats error:", error);
    }

    return {
      totalItems: items.length,
      totalSize: `${(totalSize / 1024).toFixed(1)} KB`,
      items,
    };
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = "cache_test";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export default CacheService;
