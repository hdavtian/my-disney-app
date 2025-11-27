package com.harmadavtian.disneyapp.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Cache configuration for RAG queries.
 * 
 * Uses in-memory caching to reduce LLM API calls for frequently asked
 * questions.
 * Cache key format: {query}_{contentType}
 * 
 * Cache strategy:
 * - Cache name: "rag-queries"
 * - Eviction: Manual via admin endpoint (future)
 * - TTL: Not enforced (relies on restart to clear stale data)
 * 
 * Production considerations:
 * - For high traffic, consider Redis cache
 * - For multi-instance, use distributed cache
 * - Monitor cache hit rate via metrics
 * 
 * @author Harma Davtian
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Create cache manager with rag-queries cache.
     * 
     * ConcurrentMapCacheManager:
     * - Thread-safe in-memory cache
     * - No size limit (grows with heap)
     * - No TTL support (manual eviction only)
     * - Good for < 1000 queries
     * 
     * @return Cache manager instance
     */
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("rag-queries");
    }
}
