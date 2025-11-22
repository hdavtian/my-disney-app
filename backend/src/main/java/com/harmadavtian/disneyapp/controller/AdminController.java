package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.service.DataSeeder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

/**
 * Admin endpoints for data management operations.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final DataSeeder dataSeeder;

    public AdminController(DataSeeder dataSeeder) {
        this.dataSeeder = dataSeeder;
    }

    /**
     * Reseed characters table from JSON file (DELETE ALL + INSERT ALL).
     */
    @PostMapping("/reseed-characters")
    public ResponseEntity<?> reseedCharacters() {
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
    public ResponseEntity<?> reseedMovies() {
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
    public ResponseEntity<?> reseedHeroCarousel() {
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
    public ResponseEntity<?> reseedMovieCharacterRelationships() {
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
    public ResponseEntity<?> reseedDisneyParks() {
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
    public ResponseEntity<?> reseedDisneyParksAttractions() {
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
    public ResponseEntity<?> reseedCharacterHints() {
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
    public ResponseEntity<?> reseedMovieHints() {
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
    public ResponseEntity<?> reseedAllHints() {
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
    public ResponseEntity<?> reseedAll() {
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
