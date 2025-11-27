package com.harmadavtian.disneyapp.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security filter for admin-only endpoints.
 * 
 * Validates X-Admin-API-Key header against configured admin API key.
 * Applied to /api/rag/* and /api/admin/* endpoints.
 * 
 * Security model:
 * - Simple API key authentication (for demo purposes)
 * - Production should use OAuth2/JWT
 * - API key passed in X-Admin-API-Key header
 * 
 * @author Harma Davtian
 */
@Component
public class AdminApiKeyFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AdminApiKeyFilter.class);
    private static final String ADMIN_API_KEY_HEADER = "X-Admin-API-Key";

    @Value("${admin.api.key:}")
    private String adminApiKey;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Apply to RAG and admin endpoints (exclude health check)
        boolean isProtected = (path.startsWith("/api/rag/") && !path.equals("/api/rag/health"))
                || path.startsWith("/api/admin/");

        if (isProtected) {
            String providedApiKey = request.getHeader(ADMIN_API_KEY_HEADER);

            if (providedApiKey == null || providedApiKey.isBlank()) {
                logger.warn("Admin request rejected: Missing API key from {}", request.getRemoteAddr());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Missing X-Admin-API-Key header\"}");
                return;
            }

            if (!providedApiKey.equals(adminApiKey)) {
                logger.warn("Admin request rejected: Invalid API key from {}", request.getRemoteAddr());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid API key\"}");
                return;
            }

            logger.debug("Admin request authorized from {}", request.getRemoteAddr());
        }

        filterChain.doFilter(request, response);
    }
}
