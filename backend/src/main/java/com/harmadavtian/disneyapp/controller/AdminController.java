package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.service.AdminAuthService;
import com.harmadavtian.disneyapp.service.DataSeeder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

/**
 * Admin endpoints for data management operations.
 * All endpoints require X-Admin-API-Key header for authentication.
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin - Data Management", description = "Admin endpoints for reseeding database content")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final DataSeeder dataSeeder;
    private final AdminAuthService adminAuthService;

    public AdminController(DataSeeder dataSeeder, AdminAuthService adminAuthService) {
        this.dataSeeder = dataSeeder;
        this.adminAuthService = adminAuthService;
    }

    /**
     * Reseed characters table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-characters")
    @Operation(summary = "Reseed characters", description = "Delete all characters and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Characters reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedCharacters(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding characters from JSON file");
            Map<String, Integer> result = dataSeeder.reseedCharacters();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Characters reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding characters", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed movies table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-movies")
    @Operation(summary = "Reseed movies", description = "Delete all movies and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movies reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedMovies(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding movies from JSON file");
            Map<String, Integer> result = dataSeeder.reseedMovies();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Movies reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding movies", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed hero carousel (DELETE ALL + regenerate from movies).
     */
    @PostMapping("/reseed-hero-carousel")
    @Operation(summary = "Reseed hero carousel", description = "Delete all hero carousel items and regenerate from movies. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Hero carousel reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedHeroCarousel(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding hero carousel");
            Map<String, Integer> result = dataSeeder.reseedHeroCarousel();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hero carousel reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding hero carousel", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed movie-character relationships from JSON file (CLEAR ALL + INSERT ALL).
     */
    @PostMapping("/reseed-relationships")
    @Operation(summary = "Reseed movie-character relationships", description = "Clear all relationships and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Relationships reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedMovieCharacterRelationships(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding movie-character relationships from JSON file");
            Map<String, Integer> result = dataSeeder.reseedMovieCharacterRelationships();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Movie-character relationships reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding movie-character relationships", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed Disney Parks table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-parks")
    @Operation(summary = "Reseed Disney parks", description = "Delete all parks and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Disney parks reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedDisneyParks(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding Disney parks from JSON file");
            dataSeeder.reseedDisneyParks();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Disney parks and attractions reseeded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding Disney parks", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed Disney Parks Attractions table from JSON file (DELETE ALL + INSERT
     * ALL).
     */
    @PostMapping("/reseed-attractions")
    @Operation(summary = "Reseed Disney park attractions", description = "Delete all attractions and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attractions reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedDisneyParksAttractions(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding Disney park attractions from JSON file");
            dataSeeder.reseedDisneyParksAttractions();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Disney park attractions reseeded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding Disney park attractions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed character hints table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-character-hints")
    @Operation(summary = "Reseed character hints", description = "Delete all character hints and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Character hints reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedCharacterHints(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding character hints from JSON file");
            Map<String, Integer> result = dataSeeder.reseedCharacterHints();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Character hints reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding character hints", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed movie hints table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-movie-hints")
    @Operation(summary = "Reseed movie hints", description = "Delete all movie hints and reseed from JSON file. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie hints reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedMovieHints(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding movie hints from JSON file");
            Map<String, Integer> result = dataSeeder.reseedMovieHints();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Movie hints reseeded successfully");
            response.put("count", result.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding movie hints", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed all hints (character hints + movie hints) from JSON files.
     */
    @PostMapping("/reseed-all-hints")
    @Operation(summary = "Reseed all hints", description = "Delete and reseed both character and movie hints from JSON files. **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All hints reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedAllHints(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding all hints from JSON files");

            Map<String, Integer> characterHintsResult = dataSeeder.reseedCharacterHints();
            Map<String, Integer> movieHintsResult = dataSeeder.reseedMovieHints();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All hints reseeded successfully");
            response.put("characterHints", characterHintsResult.get("inserted"));
            response.put("movieHints", movieHintsResult.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding all hints", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Reseed all data (characters, movies, hero carousel, relationships, parks,
     * attractions, hints) from JSON files.
     */
    @PostMapping("/reseed-all")
    @Operation(summary = "Reseed all data", description = "Delete and reseed ALL database content from JSON files (characters, movies, carousel, relationships, parks, attractions, hints). **Requires X-Admin-API-Key header.**")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All data reseeded successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid admin API key")
    })
    public ResponseEntity<?> reseedAll(
            @Parameter(description = "Admin API key for authentication", example = "your-admin-api-key", required = true, in = ParameterIn.HEADER) @RequestHeader(value = "X-Admin-API-Key", required = true) String apiKey) {

        if (!adminAuthService.validateApiKey(apiKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "Unauthorized - invalid or missing admin API key"));
        }

        try {
            log.info("ADMIN ACTION: Reseeding all data from JSON files");

            Map<String, Integer> characterResult = dataSeeder.reseedCharacters();
            Map<String, Integer> movieResult = dataSeeder.reseedMovies();
            Map<String, Integer> carouselResult = dataSeeder.reseedHeroCarousel();
            Map<String, Integer> relationshipsResult = dataSeeder.reseedMovieCharacterRelationships();
            dataSeeder.reseedDisneyParks();
            dataSeeder.reseedDisneyParksAttractions();
            Map<String, Integer> characterHintsResult = dataSeeder.reseedCharacterHints();
            Map<String, Integer> movieHintsResult = dataSeeder.reseedMovieHints();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All data reseeded successfully");
            response.put("characters", characterResult.get("inserted"));
            response.put("movies", movieResult.get("inserted"));
            response.put("carousel", carouselResult.get("inserted"));
            response.put("relationships", relationshipsResult.get("inserted"));
            response.put("parks", "reseeded");
            response.put("attractions", "reseeded");
            response.put("characterHints", characterHintsResult.get("inserted"));
            response.put("movieHints", movieHintsResult.get("inserted"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseeding all data", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
