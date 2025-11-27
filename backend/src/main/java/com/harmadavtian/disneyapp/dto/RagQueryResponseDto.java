package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * DTO for RAG query responses.
 * Contains generated answer with source citations.
 * 
 * @author Harma Davtian
 */
@Schema(description = "Response from RAG (Retrieval-Augmented Generation) query")
public class RagQueryResponseDto {

    @Schema(description = "Generated answer from LLM", example = "Elsa possesses the magical ability to create and manipulate ice and snow...")
    private String answer;

    @Schema(description = "Source citations (content items used to generate answer)")
    private List<RagCitationDto> sources;

    @Schema(description = "User's original query", example = "Tell me about Elsa's powers")
    private String query;

    @Schema(description = "Whether answer was retrieved from cache", example = "false")
    private boolean cached = false;

    public RagQueryResponseDto() {
    }

    public RagQueryResponseDto(String answer, List<RagCitationDto> sources, String query, boolean cached) {
        this.answer = answer;
        this.sources = sources;
        this.query = query;
        this.cached = cached;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<RagCitationDto> getSources() {
        return sources;
    }

    public void setSources(List<RagCitationDto> sources) {
        this.sources = sources;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public boolean isCached() {
        return cached;
    }

    public void setCached(boolean cached) {
        this.cached = cached;
    }
}
