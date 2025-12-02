package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.service.AdminAuthService;
import com.harmadavtian.disneyapp.service.EmbeddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin controller for embedding management.
 * 
 * Provides endpoints for:
 * - Batch embedding generation
 * - Embedding statistics
 * - Re-embedding content
 * 
 * All endpoints require admin API key authentication.
 * 
 * @author Harma Davtian
 */
@RestController
@RequestMapping("/api/admin/embeddings")
@Tag(name = "Admin - Embeddings", description = "Admin endpoints for managing content embeddings")
public class AdminEmbeddingController {

        private static final Logger logger = LoggerFactory.getLogger(AdminEmbeddingController.class);

        private final EmbeddingService embeddingService;
        private final AdminAuthService adminAuthService;
        private final CacheManager cacheManager;

        public AdminEmbeddingController(EmbeddingService embeddingService, AdminAuthService adminAuthService,
                        CacheManager cacheManager) {
                this.embeddingService = embeddingService;
                this.adminAuthService = adminAuthService;
                this.cacheManager = cacheManager;
        }

        /**
         * Generate embeddings for all content.
         * 
         * POST /api/admin/embeddings/generate
         * 
         * Query params:
         * - force_regenerate: If true, regenerate all embeddings (default: false)
         * 
         * Example response:
         * {
         * "characters_processed": 450,
         * "movies_processed": 120,
         * "parks_processed": 12,
         * "total_processed": 582,
         * "message": "Batch embedding generation complete"
         * }
         * 
         * @param forceRegenerate If true, regenerate all embeddings even if they exist
         * @return Generation result with counts
         */
        @PostMapping("/generate")
        @Operation(summary = "Generate embeddings for all content", description = "Batch process all characters, movies, and parks to generate vector embeddings. "
                        +
                        "Uses smart re-embedding (skips existing) unless force_regenerate=true. " +
                        "Rate limited to 60 requests/minute (Gemini API limit). " +
                        "**This is a long-running operation** - expect 5-10 minutes for full dataset. **Requires X-Admin-API-Key header.**")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Embeddings generated successfully"),
                        @ApiResponse(responseCode = "401", description = "Missing or invalid admin API key"),
                        @ApiResponse(responseCode = "429", description = "Rate limit exceeded"),
                        @ApiResponse(responseCode = "503", description = "LLM service unavailable")
        })
        public ResponseEntity<?> generateEmbeddings(
                        @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey,
                        @Parameter(description = "Force regeneration of all embeddings (ignores existing)", example = "false") @RequestParam(name = "force_regenerate", defaultValue = "false") boolean forceRegenerate) {

                if (!adminAuthService.validateApiKey(apiKey)) {
                        return ResponseEntity.status(401)
                                        .body(Map.of("error", "Unauthorized - invalid or missing admin API key"));
                }

                logger.info("Admin: Starting batch embedding generation (force={})", forceRegenerate);

                EmbeddingService.EmbeddingGenerationResult result = embeddingService
                                .generateAllEmbeddings(forceRegenerate);

                logger.info("Admin: Batch embedding generation complete - {} total embeddings",
                                result.totalProcessed);

                Map<String, Object> response = Map.of(
                                "characters_processed", result.charactersProcessed,
                                "movies_processed", result.moviesProcessed,
                                "parks_processed", result.parksProcessed,
                                "total_processed", result.totalProcessed,
                                "message", "Batch embedding generation complete");

                return ResponseEntity.ok(response);
        }

        /**
         * Clear RAG query cache.
         * 
         * DELETE /api/admin/embeddings/cache
         * 
         * Use this after:
         * - Embedding regeneration
         * - Database updates
         * - Code deployments affecting query results
         * 
         * Example response:
         * {
         * "message": "RAG query cache cleared successfully",
         * "cache_name": "rag-queries"
         * }
         * 
         * @return Success message
         */
        @DeleteMapping("/cache")
        @Operation(summary = "Clear RAG query cache", description = "Clears the 5-minute RAG query cache to force fresh results. "
                        +
                        "Use this after embedding regeneration or deployments. **Requires X-Admin-API-Key header.**")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Cache cleared successfully"),
                        @ApiResponse(responseCode = "401", description = "Missing or invalid admin API key"),
                        @ApiResponse(responseCode = "404", description = "Cache not found")
        })
        public ResponseEntity<?> clearCache(
                        @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

                if (!adminAuthService.validateApiKey(apiKey)) {
                        return ResponseEntity.status(401)
                                        .body(Map.of("error", "Unauthorized - invalid or missing admin API key"));
                }

                logger.info("Admin: Clearing RAG query cache");

                var cache = cacheManager.getCache("rag-queries");
                if (cache == null) {
                        logger.warn("Admin: RAG query cache not found");
                        return ResponseEntity.status(404)
                                        .body(Map.of("error", "Cache 'rag-queries' not found"));
                }

                cache.clear();
                logger.info("Admin: RAG query cache cleared successfully");

                return ResponseEntity.ok(Map.of(
                                "message", "RAG query cache cleared successfully",
                                "cache_name", "rag-queries"));
        }
}
