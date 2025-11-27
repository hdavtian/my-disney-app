package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.RagQueryRequestDto;
import com.harmadavtian.disneyapp.dto.RagQueryResponseDto;
import com.harmadavtian.disneyapp.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    public RagController(RagService ragService) {
        this.ragService = ragService;
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
            "Uses Google Gemini for embeddings and text generation. Results are cached for 1 hour.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Query executed successfully", content = @Content(schema = @Schema(implementation = RagQueryResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request (empty query, invalid content type, etc.)"),
            @ApiResponse(responseCode = "429", description = "Rate limit exceeded (Gemini API quota)"),
            @ApiResponse(responseCode = "503", description = "LLM service unavailable")
    })
    public ResponseEntity<RagQueryResponseDto> query(
            @Parameter(description = "RAG query request with query text and optional filters", required = true, schema = @Schema(implementation = RagQueryRequestDto.class)) @RequestBody RagQueryRequestDto request) {
        logger.info("RAG query received: '{}' (type: {})", request.getQuery(), request.getContentType());

        try {
            RagQueryResponseDto response = ragService.query(request);
            logger.info("RAG query completed: {} sources, {} chars answer",
                    response.getSources().size(),
                    response.getAnswer().length());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid RAG query: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
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
}
