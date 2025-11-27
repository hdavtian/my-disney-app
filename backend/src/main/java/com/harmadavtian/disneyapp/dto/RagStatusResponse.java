package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for RAG system status.
 */
@Schema(description = "Response indicating RAG system availability")
public class RagStatusResponse {

    @Schema(description = "Whether RAG queries are enabled", example = "true")
    private boolean ragEnabled;

    @Schema(description = "Status message", example = "AI Assistant is available")
    private String message;

    public RagStatusResponse() {
    }

    public RagStatusResponse(boolean ragEnabled, String message) {
        this.ragEnabled = ragEnabled;
        this.message = message;
    }

    public boolean isRagEnabled() {
        return ragEnabled;
    }

    public void setRagEnabled(boolean ragEnabled) {
        this.ragEnabled = ragEnabled;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
