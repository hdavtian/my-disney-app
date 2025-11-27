package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for tier unlock and tier status.
 */
@Schema(description = "Response containing rate limit tier information")
public class TierResponse {

    @Schema(description = "Rate limit tier name", example = "premium")
    private String tier;

    @Schema(description = "Maximum queries allowed per hour", example = "100")
    private int limit;

    @Schema(description = "Number of queries used in current hour", example = "0")
    private int used;

    @Schema(description = "Number of queries remaining in current hour", example = "100")
    private int remaining;

    @Schema(description = "Status message", example = "Premium tier unlocked for 1 hour")
    private String message;

    public TierResponse() {
    }

    public TierResponse(String tier, int limit, int used, int remaining, String message) {
        this.tier = tier;
        this.limit = limit;
        this.used = used;
        this.remaining = remaining;
        this.message = message;
    }

    // Getters and setters
    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getUsed() {
        return used;
    }

    public void setUsed(int used) {
        this.used = used;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
