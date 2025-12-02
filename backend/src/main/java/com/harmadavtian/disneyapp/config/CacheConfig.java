package com.harmadavtian.disneyapp.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Spring Cache configuration for RAG queries.
 * 
 * Uses Caffeine in-memory cache with TTL to prevent stale results.
 * Cache key format: {query}_{contentType}
 * 
 * Cache strategy:
 * - Cache name: "rag-queries"
 * - TTL: 5 minutes (balances freshness vs API cost)
 * - Max size: 500 entries
 * - Eviction: LRU (Least Recently Used)
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
     * Create cache manager with TTL-enabled rag-queries cache.
     * 
     * Caffeine cache:
     * - Thread-safe in-memory cache
     * - Automatic expiration after 5 minutes
     * - Max 500 entries (prevents memory bloat)
     * - LRU eviction policy
     * 
     * @return Cache manager instance
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("rag-queries");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(500));
        return cacheManager;
    }
}
