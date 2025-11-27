package com.harmadavtian.disneyapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO for RAG query requests.
 * Encapsulates user query and optional content type filter.
 * 
 * @author Harma Davtian
 */
@Schema(description = "Request for RAG (Retrieval-Augmented Generation) query")
public class RagQueryRequestDto {

    @Schema(description = "User question or query", example = "Tell me about Elsa's powers", required = true)
    private String query;

    @JsonProperty("content_type")
    @Schema(description = "Optional content type filter (character, movie, park, attraction, hint)", example = "character", required = false)
    private String contentType;

    @JsonProperty("top_k")
    @Schema(description = "Number of similar items to retrieve (1-20)", example = "5", required = false)
    private Integer topK = 5;

    public RagQueryRequestDto() {
    }

    public RagQueryRequestDto(String query, String contentType, Integer topK) {
        this.query = query;
        this.contentType = contentType;
        this.topK = topK;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Integer getTopK() {
        return topK;
    }

    public void setTopK(Integer topK) {
        this.topK = topK;
    }
}
