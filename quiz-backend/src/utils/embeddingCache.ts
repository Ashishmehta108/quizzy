import { createHash } from "crypto";
import { redis } from "../config/redis";

const EMBEDDING_CACHE_PREFIX = "emb:";
const EMBEDDING_CACHE_TTL = 604800; // 7 days in seconds

/**
 * Generate a SHA256 hash of text for caching
 */
function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Get embedding from cache
 */
export async function getCachedEmbedding(text: string): Promise<number[] | null> {
  try {
    const cacheKey = `${EMBEDDING_CACHE_PREFIX}${hashText(text)}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log("✅ Embedding cache hit");
      return JSON.parse(cached);
    }
    
    return null;
  } catch (err) {
    console.error("Cache get error:", err);
    return null; // Fail silently, embedding will be regenerated
  }
}

/**
 * Cache an embedding
 */
export async function cacheEmbedding(text: string, embedding: number[]): Promise<void> {
  try {
    const cacheKey = `${EMBEDDING_CACHE_PREFIX}${hashText(text)}`;
    await redis.setex(cacheKey, EMBEDDING_CACHE_TTL, JSON.stringify(embedding));
  } catch (err) {
    console.error("Cache set error:", err);
    // Fail silently, caching is not critical
  }
}

/**
 * Get or generate embedding with cache
 */
export async function getOrGenerateEmbedding(
  text: string,
  generator: () => Promise<number[]>
): Promise<number[]> {
  // Try cache first
  const cached = await getCachedEmbedding(text);
  if (cached) {
    return cached;
  }
  
  // Generate new embedding
  const embedding = await generator();
  
  // Cache it
  await cacheEmbedding(text, embedding);
  
  return embedding;
}

/**
 * Clear embedding cache (useful for testing or manual invalidation)
 */
export async function clearEmbeddingCache(text?: string): Promise<void> {
  try {
    if (text) {
      const cacheKey = `${EMBEDDING_CACHE_PREFIX}${hashText(text)}`;
      await redis.del(cacheKey);
    } else {
      // Clear all embedding cache
      const keys = await redis.keys(`${EMBEDDING_CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (err) {
    console.error("Cache clear error:", err);
  }
}

/**
 * Get cache statistics
 */
export async function getEmbeddingCacheStats(): Promise<{
  totalKeys: number;
  estimatedSize: string;
}> {
  try {
    const keys = await redis.keys(`${EMBEDDING_CACHE_PREFIX}*`);
    return {
      totalKeys: keys.length,
      estimatedSize: `${(keys.length * 768 * 4 / 1024).toFixed(2)} KB`, // Approximate: 768 dims * 4 bytes
    };
  } catch (err) {
    console.error("Cache stats error:", err);
    return { totalKeys: 0, estimatedSize: "0 KB" };
  }
}
