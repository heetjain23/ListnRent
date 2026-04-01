/**
 * Example: How to use Redis caching in your services
 * This file demonstrates caching patterns you can use throughout your app
 */

import { getCache, setCache, deleteCache, CACHE_EXPIRY } from "../utils/redis.js";

/**
 * Example: Get listings with cache
 * Replace this with your actual implementation
 */
export const getListingsWithCache = async (filterParams) => {
  const cacheKey = `listings:${JSON.stringify(filterParams)}`;

  // Try to get from cache first
  const cachedListings = await getCache(cacheKey);
  if (cachedListings) {
    console.log("Returning cached listings");
    return cachedListings;
  }

  // If not in cache, fetch from database
  // Replace this with your actual database query
  const listings = await listings.find(filterParams);

  // Store in cache for 1 hour
  await setCache(cacheKey, listings, CACHE_EXPIRY.LONG);

  return listings;
};

/**
 * Example: Invalidate listings cache when creating new listing
 */
export const invalidateListingsCache = async () => {
  // Delete specific cache keys
  const client = getRedisClient();
  
  // Pattern-based deletion (delete all listings cache)
  const keys = await client.keys("listings:*");
  if (keys.length > 0) {
    await client.del(keys);
    console.log(`Invalidated ${keys.length} cache entries`);
  }
};

/**
 * Example: Cache user profile
 */
export const getUserWithCache = async (userId) => {
  const cacheKey = `user:${userId}`;

  const cachedUser = await getCache(cacheKey);
  if (cachedUser) {
    return cachedUser;
  }

  // Fetch from database
  const user = await user.findById(userId);

  // Cache for 24 hours
  await setCache(cacheKey, user, CACHE_EXPIRY.LONG);

  return user;
};

/**
 * Example: Invalidate user cache on profile update
 */
export const invalidateUserCache = async (userId) => {
  await deleteCache(`user:${userId}`);
  console.log(`Invalidated cache for user ${userId}`);
};
