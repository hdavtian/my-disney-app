package com.harmadavtian.disneyapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing rate limits per session with tier-based quotas.
 * Tracks usage in hourly windows and enforces limits based on user tier.
 */
@Service
public class RateLimitService {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

    private final Map<String, UsageTracker> sessionUsage = new ConcurrentHashMap<>();

    /**
     * Tracks usage count and time window for a session.
     */
    public static class UsageTracker {
        private int count;
        private LocalDateTime windowStart;

        public UsageTracker() {
            this.count = 0;
            this.windowStart = LocalDateTime.now();
        }

        /**
         * Increments usage count and checks if within limit.
         * Resets counter if hourly window has expired.
         *
         * @param limit Maximum allowed queries in the current window
         * @return true if within limit, false if exceeded
         */
        public boolean incrementAndCheck(int limit) {
            // Reset if hour has passed
            if (Duration.between(windowStart, LocalDateTime.now()).toHours() >= 1) {
                count = 0;
                windowStart = LocalDateTime.now();
            }

            count++;
            return count <= limit;
        }

        public int getCount() {
            // Return 0 if window expired
            if (Duration.between(windowStart, LocalDateTime.now()).toHours() >= 1) {
                return 0;
            }
            return count;
        }

        public LocalDateTime getResetTime() {
            return windowStart.plusHours(1);
        }
    }

    /**
     * Checks if session can make another query and increments usage counter.
     *
     * @param sessionId Unique session identifier
     * @param tier      User's rate limit tier (free, premium, admin)
     * @return true if query allowed, false if rate limit exceeded
     */
    public boolean checkAndIncrementUsage(String sessionId, String tier) {
        int limit = getTierLimit(tier);
        UsageTracker tracker = sessionUsage.computeIfAbsent(sessionId, k -> new UsageTracker());

        boolean allowed = tracker.incrementAndCheck(limit);

        if (!allowed) {
            logger.warn("Rate limit exceeded for session {} (tier: {}, limit: {})",
                    sessionId, tier, limit);
        }

        return allowed;
    }

    /**
     * Gets current usage stats for a session.
     *
     * @param sessionId Unique session identifier
     * @param tier      User's rate limit tier
     * @return Array: [used, limit, remaining]
     */
    public int[] getUsageStats(String sessionId, String tier) {
        int limit = getTierLimit(tier);
        UsageTracker tracker = sessionUsage.get(sessionId);
        int used = tracker != null ? tracker.getCount() : 0;
        int remaining = Math.max(0, limit - used);

        return new int[] { used, limit, remaining };
    }

    /**
     * Gets reset time for a session's rate limit window.
     *
     * @param sessionId Unique session identifier
     * @return LocalDateTime when the rate limit window resets
     */
    public LocalDateTime getResetTime(String sessionId) {
        UsageTracker tracker = sessionUsage.get(sessionId);
        return tracker != null ? tracker.getResetTime() : LocalDateTime.now().plusHours(1);
    }

    /**
     * Gets query limit for a tier.
     *
     * @param tier Rate limit tier name
     * @return Maximum queries per hour for the tier
     */
    private int getTierLimit(String tier) {
        return switch (tier != null ? tier.toLowerCase() : "free") {
            case "premium" -> 100;
            case "admin" -> 1000;
            default -> 10; // free tier
        };
    }

    /**
     * Clears usage tracking for a session (useful for testing).
     *
     * @param sessionId Unique session identifier
     */
    public void clearUsage(String sessionId) {
        sessionUsage.remove(sessionId);
        logger.debug("Cleared usage tracking for session {}", sessionId);
    }
}
