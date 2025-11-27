package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.AccessCodeRequest;
import com.harmadavtian.disneyapp.dto.RagQueryRequestDto;
import com.harmadavtian.disneyapp.dto.RagQueryResponseDto;
import com.harmadavtian.disneyapp.dto.RagStatusResponse;
import com.harmadavtian.disneyapp.dto.TierResponse;
import com.harmadavtian.disneyapp.service.RagService;
import com.harmadavtian.disneyapp.service.RateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for RAG (Retrieval-Augmented Generation) queries.
 * 
 * Provides endpoints for:
 * - Semantic search across Disney content
 * - AI-powered question answering with citations
 * 
 * All endpoints use snake_case for JSON (via global Jackson config).
 * 
 * @author Harma Davtian
 */
@RestController
@RequestMapping("/api/rag")
@Tag(name = "RAG", description = "Retrieval-Augmented Generation for semantic search and Q&A")
public class RagController {

    private static final Logger logger = LoggerFactory.getLogger(RagController.class);

    private final RagService ragService;
    private final RateLimitService rateLimitService;

    @Value("${premium.access.code:DISNEY_IMAGINEER_2025}")
    private String premiumAccessCode;

    @Value("${rag.enabled:true}")
    private boolean ragEnabledDefault;

    @Value("${admin.api.key}")
    private String adminApiKey;

    private volatile boolean ragEnabled;

    public RagController(RagService ragService, RateLimitService rateLimitService) {
        this.ragService = ragService;
        this.rateLimitService = rateLimitService;
    }

    @PostConstruct
    public void init() {
        // Initialize ragEnabled from property (happens after @Value injection)
        this.ragEnabled = ragEnabledDefault;
        logger.info("RAG system startup - enabled: {}, from property: {}", ragEnabled, ragEnabledDefault);
        if (!ragEnabled) {
            logger.warn(
                    "⚠️ RAG system is DISABLED on startup - set RAG_ENABLED=true in environment or remove override");
        } else {
            logger.info("✅ RAG system is ENABLED and ready to accept queries");
        }
    }

    /**
     * Execute RAG query for semantic search and AI-generated answers.
     * 
     * POST /api/rag/query
     * 
     * Example request:
     * {
     * "query": "Tell me about Elsa's powers",
     * "content_type": "character",
     * "top_k": 5
     * }
     * 
     * Example response:
     * {
     * "answer": "Elsa possesses magical ice powers...",
     * "sources": [
     * {
     * "content_type": "character",
     * "content_id": 123,
     * "content_name": "Elsa",
     * "similarity_score": 0.92,
     * "excerpt": "Elsa is the Snow Queen..."
     * }
     * ],
     * "query": "Tell me about Elsa's powers",
     * "cached": false
     * }
     * 
     * @param request Query request with query text and optional filters
     * @return RAG response with generated answer and source citations
     */
    @PostMapping("/query")
    @Operation(summary = "Execute RAG query", description = "Perform semantic search across Disney content and generate AI-powered answer with citations. "
            +
            "Uses Google Gemini for embeddings and text generation. Results are cached for 1 hour. "
            +
            "Rate limits: Free tier (10/hour), Premium tier (100/hour).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Query executed successfully", content = @Content(schema = @Schema(implementation = RagQueryResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request (empty query, invalid content type, etc.)"),
            @ApiResponse(responseCode = "429", description = "Rate limit exceeded - upgrade to premium tier for more queries"),
            @ApiResponse(responseCode = "503", description = "AI Assistant temporarily unavailable")
    })
    public ResponseEntity<?> query(
            @Parameter(description = "RAG query request with query text and optional filters", required = true, schema = @Schema(implementation = RagQueryRequestDto.class)) @RequestBody RagQueryRequestDto request,
            HttpServletRequest httpRequest,
            HttpSession session) {

        // Kill switch check
        if (!ragEnabled) {
            logger.warn("RAG query rejected - service disabled");
            return ResponseEntity.status(503)
                    .body(Map.of("error", "AI Assistant temporarily unavailable"));
        }

        // Rate limiting check
        String sessionId = session.getId();
        String ipAddress = getClientIpAddress(httpRequest);
        String tier = (String) session.getAttribute("rateLimitTier");
        if (tier == null) {
            tier = "free";
        }

        if (!rateLimitService.checkAndIncrementUsage(sessionId, ipAddress, tier)) {
            int[] stats = rateLimitService.getUsageStats(sessionId, ipAddress, tier);
            logger.warn("Rate limit exceeded for session {} / IP {} (tier: {}, used: {}/{})",
                    sessionId, ipAddress, tier, stats[0], stats[1]);

            return ResponseEntity.status(429)
                    .header("X-RateLimit-Limit", String.valueOf(stats[1]))
                    .header("X-RateLimit-Remaining", "0")
                    .header("X-RateLimit-Reset", rateLimitService.getResetTime(sessionId).toString())
                    .body(Map.of(
                            "error", "Rate limit exceeded",
                            "tier", tier,
                            "limit", stats[1],
                            "message", "Upgrade to premium tier for more queries"));
        }

        logger.info("RAG query received: '{}' (type: {}, tier: {}, IP: {})",
                request.getQuery(), request.getContentType(), tier, ipAddress);

        try {
            RagQueryResponseDto response = ragService.query(request);

            // Add rate limit headers to successful response
            int[] stats = rateLimitService.getUsageStats(sessionId, ipAddress, tier);

            logger.info("RAG query completed: {} sources, {} chars answer (usage: {}/{})",
                    response.getSources().size(),
                    response.getAnswer().length(),
                    stats[0], stats[1]);

            return ResponseEntity.ok()
                    .header("X-RateLimit-Limit", String.valueOf(stats[1]))
                    .header("X-RateLimit-Remaining", String.valueOf(stats[2]))
                    .body(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid RAG query: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get RAG system status (enabled/disabled).
     * 
     * GET /api/rag/status
     * 
     * @return RAG system availability status
     */
    @GetMapping("/status")
    @Operation(summary = "Get RAG system status", description = "Check if AI Assistant is currently enabled and accepting queries.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status retrieved successfully", content = @Content(schema = @Schema(implementation = RagStatusResponse.class)))
    })
    public ResponseEntity<RagStatusResponse> getStatus() {
        String message = ragEnabled
                ? "AI Assistant is available"
                : "AI Assistant temporarily unavailable";
        return ResponseEntity.ok(new RagStatusResponse(ragEnabled, message));
    }

    /**
     * Get current rate limit tier and usage stats.
     * 
     * GET /api/rag/tier-status
     * 
     * @return Current tier, usage, and remaining queries
     */
    @GetMapping("/tier-status")
    @Operation(summary = "Get rate limit tier status", description = "Get current user's rate limit tier, usage statistics, and remaining queries for this hour.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tier status retrieved successfully", content = @Content(schema = @Schema(implementation = TierResponse.class)))
    })
    public ResponseEntity<TierResponse> getTierStatus(
            HttpServletRequest httpRequest,
            HttpSession session) {
        String sessionId = session.getId();
        String ipAddress = getClientIpAddress(httpRequest);
        String tier = (String) session.getAttribute("rateLimitTier");
        if (tier == null) {
            tier = "free";
        }

        int[] stats = rateLimitService.getUsageStats(sessionId, ipAddress, tier);

        return ResponseEntity.ok(new TierResponse(
                tier,
                stats[1], // limit
                stats[0], // used
                stats[2], // remaining
                String.format("%s tier: %d/%d queries used",
                        tier.substring(0, 1).toUpperCase() + tier.substring(1),
                        stats[0], stats[1])));
    }

    /**
     * Unlock premium rate limit tier with access code.
     * 
     * POST /api/rag/unlock-premium
     * 
     * @param request Access code request
     * @param session HTTP session
     * @return Success response with new tier info, or 403 if code invalid
     */
    @PostMapping("/unlock-premium")
    @Operation(summary = "Unlock premium tier", description = "Upgrade rate limit from 10 queries/hour (free) to 100 queries/hour (premium) using access code. "
            + "Premium tier expires after 1 hour or when browser session ends.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Premium tier unlocked successfully", content = @Content(schema = @Schema(implementation = TierResponse.class))),
            @ApiResponse(responseCode = "403", description = "Invalid access code")
    })
    public ResponseEntity<?> unlockPremium(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Access code request with premium unlock code", required = true, content = @Content(schema = @Schema(implementation = AccessCodeRequest.class))) @RequestBody AccessCodeRequest request,
            HttpServletRequest httpRequest,
            HttpSession session) {

        if (premiumAccessCode != null && premiumAccessCode.equals(request.getCode())) {
            session.setAttribute("rateLimitTier", "premium");
            session.setMaxInactiveInterval(3600); // 1 hour

            String ipAddress = getClientIpAddress(httpRequest);
            logger.info("Premium tier unlocked for session {} / IP {}", session.getId(), ipAddress);

            int[] stats = rateLimitService.getUsageStats(session.getId(), ipAddress, "premium");

            return ResponseEntity.ok(new TierResponse(
                    "premium",
                    stats[1], // limit
                    stats[0], // used
                    stats[2], // remaining
                    "Premium tier unlocked for 1 hour"));
        }

        logger.warn("Invalid premium access code attempt for session {}", session.getId());
        return ResponseEntity.status(403)
                .body(Map.of("error", "Invalid access code"));
    }

    /**
     * Admin endpoint to toggle RAG system on/off (kill switch).
     * 
     * POST /api/admin/rag/toggle?enabled=true
     * 
     * Requires X-Admin-API-Key header.
     * 
     * @param enabled Whether to enable or disable RAG queries
     * @return Success response with new status
     */
    @PostMapping("/admin/rag/toggle")
    @Operation(summary = "Toggle RAG system (admin only)", description = "Emergency kill switch to enable/disable AI Assistant. Requires admin API key. "
            + "Takes effect immediately without restart. Use to prevent abuse or control costs.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "RAG system toggled successfully", content = @Content(schema = @Schema(implementation = RagStatusResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> toggleRag(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey,
            @Parameter(description = "Enable (true) or disable (false) RAG queries", example = "true") @RequestParam boolean enabled) {

        if (apiKey == null || !apiKey.equals(adminApiKey)) {
            logger.warn("Admin endpoint access denied - invalid API key");
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized - invalid or missing admin API key"));
        }

        this.ragEnabled = enabled;
        String message = enabled
                ? "AI Assistant enabled"
                : "AI Assistant disabled";

        logger.warn("RAG system manually toggled: {} (admin action)", enabled);

        return ResponseEntity.ok(new RagStatusResponse(enabled, message));
    }

    /**
     * Health check endpoint for RAG service.
     * 
     * GET /api/rag/health
     * 
     * @return 200 OK if service is available
     */
    @GetMapping("/health")
    @Operation(summary = "RAG service health check", description = "Check if RAG service is available and ready to accept queries")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("RAG service is healthy");
    }

    /**
     * Extract client IP address from request.
     * Checks proxy headers (X-Forwarded-For, X-Real-IP) for accurate IP behind load
     * balancers.
     *
     * @param request HTTP request
     * @return Client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Check proxy headers first (Azure App Service, CloudFlare, etc.)
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
            // First IP is the original client
            return ip.split(",")[0].trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        // Fallback to remote address
        return request.getRemoteAddr();
    }
}
