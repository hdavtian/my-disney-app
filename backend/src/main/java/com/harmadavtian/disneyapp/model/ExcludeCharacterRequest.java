package com.harmadavtian.disneyapp.model;

/**
 * Request DTO for excluding a specific character ID from random selection.
 * Used in the character quiz game to get random wrong answers.
 */
public class ExcludeCharacterRequest {

    private Long excludeId;

    public ExcludeCharacterRequest() {
    }

    public ExcludeCharacterRequest(Long excludeId) {
        this.excludeId = excludeId;
    }

    public Long getExcludeId() {
        return excludeId;
    }

    public void setExcludeId(Long excludeId) {
        this.excludeId = excludeId;
    }
}