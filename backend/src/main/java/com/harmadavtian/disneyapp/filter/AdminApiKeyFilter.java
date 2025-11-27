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

        // Allow OPTIONS requests (CORS preflight) to pass through without
        // authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Apply to admin endpoints only (not public RAG endpoints)
        boolean isProtected = path.startsWith("/api/admin/");

        if (isProtected) {
            String providedApiKey = request.getHeader(ADMIN_API_KEY_HEADER);

            if (providedApiKey == null || providedApiKey.isBlank()) {
                logger.warn("Admin request rejected: Missing API key from {}", request.getRemoteAddr());
                sendCorsError(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "{\"error\": \"Missing X-Admin-API-Key header\"}", request);
                return;
            }

            if (!providedApiKey.equals(adminApiKey)) {
                logger.warn("Admin request rejected: Invalid API key from {}", request.getRemoteAddr());
                sendCorsError(response, HttpServletResponse.SC_FORBIDDEN,
                        "{\"error\": \"Invalid API key\"}", request);
                return;
            }

            logger.debug("Admin request authorized from {}", request.getRemoteAddr());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Send error response with CORS headers to prevent browser blocking.
     * Supports both local development and production origins.
     */
    private void sendCorsError(HttpServletResponse response, int status, String message, HttpServletRequest request)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");

        // Set CORS headers dynamically based on request origin
        String origin = request.getHeader("Origin");
        if (origin != null && (origin.equals("http://localhost:3000")
                || origin.equals("http://localhost:5173")
                || origin.equals("https://movie-app.disney.harma.dev"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }

        response.getWriter().write(message);
    }
}
