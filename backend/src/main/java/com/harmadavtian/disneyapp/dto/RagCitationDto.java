package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO for RAG source citations.
 * Identifies which content items were used to generate the answer.
 * 
 * @author Harma Davtian
 */
@Schema(description = "Citation to source content used in RAG response")
public class RagCitationDto {

    @Schema(description = "Content type", example = "character")
    private String contentType;

    @Schema(description = "Content ID", example = "123")
    private Long contentId;

    @Schema(description = "Content name/title", example = "Elsa")
    private String contentName;

    @Schema(description = "Similarity score (0.0-1.0, higher is more similar)", example = "0.87")
    private double similarityScore;

    @Schema(description = "Excerpt of text that matched query")
    private String excerpt;

    public RagCitationDto() {
    }

    public RagCitationDto(String contentType, Long contentId, String contentName,
            double similarityScore, String excerpt) {
        this.contentType = contentType;
        this.contentId = contentId;
        this.contentName = contentName;
        this.similarityScore = similarityScore;
        this.excerpt = excerpt;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public String getContentName() {
        return contentName;
    }

    public void setContentName(String contentName) {
        this.contentName = contentName;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }
}
