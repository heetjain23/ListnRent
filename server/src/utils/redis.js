import { getRedisClient } from "../config/redis.js";

// Constants for expiration times (in seconds)
export const CACHE_EXPIRY = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
};

/**
 * Get value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
export const getCache = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value to Redis cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiryTime - Expiration time in seconds
 */
export const setCache = async (key, value, expiryTime = CACHE_EXPIRY.MEDIUM) => {
  try {
    const client = getRedisClient();
    await client.setEx(key, expiryTime, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key
 */
export const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
};

/**
 * Delete multiple cache keys
 * @param {string[]} keys - Array of cache keys
 */
export const deleteMultipleCache = async (keys) => {
  try {
    if (keys.length === 0) return;
    const client = getRedisClient();
    await client.del(keys);
  } catch (error) {
    console.error(`Error deleting multiple cache keys:`, error);
  }
};

/**
 * Clear all cache (use with caution!)
 */
export const clearAllCache = async () => {
  try {
    const client = getRedisClient();
    await client.flushDb();
    console.log("All cache cleared");
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
};

/**
 * Increment a counter in Redis
 * @param {string} key - Counter key
 * @param {number} increment - Amount to increment by
 */
export const incrementCounter = async (key, increment = 1) => {
  try {
    const client = getRedisClient();
    return await client.incrBy(key, increment);
  } catch (error) {
    console.error(`Error incrementing counter for key ${key}:`, error);
  }
};

/**
 * Set a key with expiration (used for rate limiting, OTPs, etc.)
 * @param {string} key - Key
 * @param {string} value - Value
 * @param {number} expiryTime - Expiration time in seconds
 */
export const setTempKey = async (key, value, expiryTime = 300) => {
  try {
    const client = getRedisClient();
    await client.setEx(key, expiryTime, value);
  } catch (error) {
    console.error(`Error setting temp key ${key}:`, error);
  }
};

/**
 * Get a temporary key
 * @param {string} key - Key
 */
export const getTempKey = async (key) => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    console.error(`Error getting temp key ${key}:`, error);
    return null;
  }
};
