package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request DTO for premium tier unlock.
 */
@Schema(description = "Request to unlock premium rate limit tier")
public class AccessCodeRequest {

    @Schema(description = "Premium access code (contact admin for code)", example = "enter-your-access-code", requiredMode = Schema.RequiredMode.REQUIRED)
    private String code;

    public AccessCodeRequest() {
    }

    public AccessCodeRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
