package com.harmadavtian.disneyapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service for validating admin API key authentication.
 * 
 * Protects admin endpoints from unauthorized access by validating
 * the X-Admin-API-Key header against the configured admin key.
 * 
 * @author Harma Davtian
 */
@Service
public class AdminAuthService {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthService.class);

    @Value("${admin.api.key}")
    private String adminApiKey;

    /**
     * Validate admin API key from request header.
     * 
     * @param providedKey API key from X-Admin-API-Key header
     * @return true if key is valid, false otherwise
     */
    public boolean validateApiKey(String providedKey) {
        if (providedKey == null || providedKey.isEmpty()) {
            logger.warn("Admin endpoint access denied - missing API key");
            return false;
        }

        if (adminApiKey == null || adminApiKey.isEmpty()) {
            logger.error("Admin API key not configured - check ADMIN_API_KEY environment variable");
            return false;
        }

        boolean valid = adminApiKey.equals(providedKey);
        if (!valid) {
            logger.warn("Admin endpoint access denied - invalid API key provided");
        }

        return valid;
    }
}
