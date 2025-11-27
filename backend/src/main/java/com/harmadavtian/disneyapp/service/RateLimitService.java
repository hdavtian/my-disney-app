package com.harmadavtian.disneyapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing rate limits per session and IP address with tier-based
 * quotas.
 * Tracks usage in hourly windows and enforces limits based on user tier.
 * Uses dual tracking (session + IP) to prevent cookie-clearing bypass.
 */
@Service
public class RateLimitService {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

    private final Map<String, UsageTracker> sessionUsage = new ConcurrentHashMap<>();
    private final Map<String, UsageTracker> ipUsage = new ConcurrentHashMap<>();

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
     * Checks if session/IP can make another query and increments usage counters.
     * Enforces BOTH session-based and IP-based limits to prevent cookie bypass.
     *
     * @param sessionId Unique session identifier
     * @param ipAddress Client IP address
     * @param tier      User's rate limit tier (free, premium, admin)
     * @return true if query allowed, false if rate limit exceeded
     */
    public boolean checkAndIncrementUsage(String sessionId, String ipAddress, String tier) {
        int sessionLimit = getTierLimit(tier);
        int ipLimit = getIpTierLimit(tier);

        // Track session usage
        UsageTracker sessionTracker = sessionUsage.computeIfAbsent(sessionId, k -> new UsageTracker());
        boolean sessionAllowed = sessionTracker.incrementAndCheck(sessionLimit);

        // Track IP usage
        UsageTracker ipTracker = ipUsage.computeIfAbsent(ipAddress, k -> new UsageTracker());
        boolean ipAllowed = ipTracker.incrementAndCheck(ipLimit);

        // Both must be within limits
        boolean allowed = sessionAllowed && ipAllowed;

        if (!allowed) {
            if (!sessionAllowed) {
                logger.warn("Session rate limit exceeded for session {} (tier: {}, limit: {})",
                        sessionId, tier, sessionLimit);
            }
            if (!ipAllowed) {
                logger.warn("IP rate limit exceeded for IP {} (tier: {}, limit: {})",
                        ipAddress, tier, ipLimit);
            }
        }

        return allowed;
    }

    /**
     * Gets current usage stats for a session.
     * Always returns session-based stats for display to user.
     * IP tracking is invisible - used only for background enforcement.
     *
     * @param sessionId Unique session identifier
     * @param ipAddress Client IP address
     * @param tier      User's rate limit tier
     * @return Array: [used, limit, remaining] based on session
     */
    public int[] getUsageStats(String sessionId, String ipAddress, String tier) {
        int sessionLimit = getTierLimit(tier);
        int ipLimit = getIpTierLimit(tier);

        // Get session stats (what we show to user)
        UsageTracker sessionTracker = sessionUsage.get(sessionId);
        int sessionUsed = sessionTracker != null ? sessionTracker.getCount() : 0;
        int sessionRemaining = Math.max(0, sessionLimit - sessionUsed);

        // Get IP stats (background check only)
        UsageTracker ipTracker = ipUsage.get(ipAddress);
        int ipUsed = ipTracker != null ? ipTracker.getCount() : 0;
        int ipRemaining = Math.max(0, ipLimit - ipUsed);

        // Always return session stats for display
        // But adjust remaining if IP limit is more restrictive
        int actualRemaining = Math.min(sessionRemaining, ipRemaining);

        return new int[] { sessionUsed, sessionLimit, actualRemaining };
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
     * Gets query limit for a tier (session-based).
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
     * Gets IP-based query limit for a tier.
     * Set equal to session limits - IP is the hard cap that can't be bypassed.
     *
     * @param tier Rate limit tier name
     * @return Maximum queries per hour per IP for the tier
     */
    private int getIpTierLimit(String tier) {
        return switch (tier != null ? tier.toLowerCase() : "free") {
            case "premium" -> 100; // Same as session limit
            case "admin" -> 1000; // Same as session limit
            default -> 10; // Same as free tier
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
