package com.harmadavtian.disneyapp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for version and build information.
 * Provides endpoints to check which version of the application is deployed.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Version", description = "Build and version information")
public class VersionController {

    @Value("${app.version:unknown}")
    private String appVersion;

    @Value("${app.build.time:unknown}")
    private String buildTime;

    @Value("${app.git.commit:unknown}")
    private String gitCommit;

    @GetMapping("/version")
    @Operation(summary = "Get version info", description = "Returns the application version, git commit SHA, and build time")
    public ResponseEntity<Map<String, Object>> getVersion() {
        Map<String, Object> versionInfo = new HashMap<>();
        versionInfo.put("version", appVersion);
        versionInfo.put("gitCommit", gitCommit);
        versionInfo.put("buildTime", buildTime);
        versionInfo.put("serverTime", Instant.now().toString());
        versionInfo.put("environment", System.getProperty("spring.profiles.active", "unknown"));

        return ResponseEntity.ok(versionInfo);
    }
}
