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

import java.util.List;

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
}
