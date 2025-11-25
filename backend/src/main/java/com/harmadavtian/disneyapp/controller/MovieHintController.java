package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.MovieHintDto;
import com.harmadavtian.disneyapp.service.MovieHintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing movie hints.
 * Provides endpoints for retrieving hints to help identify Disney movies.
 */
@Slf4j
@RestController
@RequestMapping("/api/movie-hints")
@Tag(name = "Movie Hints", description = "Movie Hints API - Endpoints for retrieving hints about Disney movies for quiz games and interactive features")
public class MovieHintController {

    private final MovieHintService movieHintService;

    public MovieHintController(MovieHintService movieHintService) {
        this.movieHintService = movieHintService;
    }

    /**
     * Get all hints for a specific movie.
     * 
     * @param urlId The URL identifier of the movie
     * @return ResponseEntity containing list of all hints for the movie
     */
    @GetMapping("/{urlId}")
    @Operation(summary = "Get all hints for a movie", description = "Retrieves all available hints for a specific Disney movie identified by their URL ID. "
            +
            "Hints include plot details, character information, quotes, trivia, and production details. " +
            "Useful for quiz games and interactive movie identification features.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved movie hints", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovieHintDto.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found with the specified URL ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<MovieHintDto>> getAllHints(
            @Parameter(description = "URL identifier of the movie", example = "frozen", required = true) @PathVariable String urlId) {

        log.debug("Request received for all hints of movie: {}", urlId);
        List<MovieHintDto> hints = movieHintService.getAllHintsByMovieUrlId(urlId);

        if (hints.isEmpty()) {
            log.warn("No hints found for movie: {}", urlId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hints);
    }

    /**
     * Get a limited number of hints for a specific movie.
     * Hints are returned in order of difficulty (easiest first).
     * 
     * @param urlId The URL identifier of the movie
     * @param count The maximum number of hints to return (default: 5)
     * @return ResponseEntity containing limited list of hints
     */
    @GetMapping("/{urlId}/limited")
    @Operation(summary = "Get limited hints for a movie", description = "Retrieves a specified number of hints for a Disney movie, ordered by difficulty (easiest to hardest). "
            +
            "Perfect for progressive hint systems in quiz games where you want to reveal hints gradually. " +
            "Default count is 5 hints if not specified.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved limited movie hints", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovieHintDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid count parameter (must be positive)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Movie not found with the specified URL ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<MovieHintDto>> getLimitedHints(
            @Parameter(description = "URL identifier of the movie", example = "frozen", required = true) @PathVariable String urlId,
            @Parameter(description = "Number of hints to return (1-50)", example = "5") @RequestParam(defaultValue = "5") int count) {

        log.debug("Request received for {} hints of movie: {}", count, urlId);

        if (count <= 0 || count > 50) {
            log.warn("Invalid count requested: {}. Must be between 1 and 50.", count);
            return ResponseEntity.badRequest().build();
        }

        List<MovieHintDto> hints = movieHintService.getNHintsByMovieUrlId(urlId, count);

        if (hints.isEmpty()) {
            log.warn("No hints found for movie: {}", urlId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hints);
    }

    /**
     * Get a random hint for a movie filtered by difficulty.
     * Used for guessing games to provide progressive difficulty hints.
     * 
     * @param movie_url_id The URL identifier of the movie
     * @param difficulty   The difficulty level (easy, medium, hard)
     * @return ResponseEntity containing a random hint at the specified difficulty
     */
    @GetMapping("/random")
    @Operation(summary = "Get random hint by difficulty", description = "Retrieves a random hint for a specific movie filtered by difficulty level. "
            +
            "Used in guessing games to provide progressive difficulty hints. " +
            "Difficulty levels: easy (1), medium (2), hard (3).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved random hint", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovieHintDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid difficulty parameter", content = @Content),
            @ApiResponse(responseCode = "404", description = "No hints found for the specified movie and difficulty", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<MovieHintDto> getRandomHintByDifficulty(
            @Parameter(description = "URL identifier of the movie", example = "snow_white_and_the_seven_dwarfs", required = true) @RequestParam String movie_url_id,
            @Parameter(description = "Difficulty level (1=easy, 2=medium, 3=hard)", example = "1", required = true) @RequestParam int difficulty) {

        log.debug("Request received for random hint of movie: {} with difficulty: {}", movie_url_id, difficulty);

        if (difficulty < 1 || difficulty > 3) {
            log.warn("Invalid difficulty requested: {}. Must be 1 (easy), 2 (medium), or 3 (hard).", difficulty);
            return ResponseEntity.badRequest().build();
        }

        MovieHintDto hint = movieHintService.getRandomHintByDifficulty(movie_url_id, difficulty);

        if (hint == null) {
            log.warn("No hint found for movie: {} with difficulty: {}", movie_url_id, difficulty);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hint);
    }

    /**
     * Get hints for multiple movies in a single batch request.
     * Optimized endpoint for loading all hints needed for a guessing game at once.
     * 
     * @param urlIds Comma-separated list of movie URL identifiers
     * @return ResponseEntity containing map of movie URL IDs to their hints
     */
    @GetMapping("/batch")
    @Operation(summary = "Batch fetch hints for multiple movies", description = "Retrieves all hints for multiple movies in a single request by providing a comma-separated list of movie URL IDs. "
            +
            "Optimized for guessing games to load all hints upfront, reducing API calls from N to 1. " +
            "Returns a map where keys are movie URL IDs and values are lists of hints.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved hints for all movies", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid URL ID format or empty list", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<Map<String, List<MovieHintDto>>> getBatchHints(
            @Parameter(description = "Comma-separated list of movie URL identifiers", example = "snow_white_and_the_seven_dwarfs,the_lion_king,aladdin", required = true) @RequestParam String urlIds) {

        log.debug("Request received for batch hints: {}", urlIds);

        List<String> urlIdList = Arrays.stream(urlIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (urlIdList.isEmpty()) {
            log.warn("Empty URL ID list provided");
            return ResponseEntity.badRequest().build();
        }

        Map<String, List<MovieHintDto>> hintsMap = movieHintService.getBatchHints(urlIdList);
        return ResponseEntity.ok(hintsMap);
    }
}
