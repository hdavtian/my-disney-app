package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.CharacterSummaryDto;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.service.MovieService;
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

@Slf4j
@RestController
@RequestMapping("/api/movies")
@Tag(name = "Movies", description = "Disney Movie Management API - Endpoints for retrieving Disney movie data")
public class MovieController {

        private final MovieService movieService;

        public MovieController(MovieService movieService) {
                this.movieService = movieService;
        }

        @GetMapping
        @Operation(summary = "Get all Disney movies", description = "Retrieves a complete list of all Disney movies in the database. "
                        +
                        "Returns movie details including title, release year, description, characters, and image URLs.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved all movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<Movie>> getAllMovies() {
                List<Movie> movies = movieService.getAllMovies();
                return ResponseEntity.ok(movies);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get movie by ID", description = "Retrieves a single Disney movie by its unique identifier. "
                        +
                        "Returns detailed movie information including all associated characters and metadata.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Movie found and returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
                        @ApiResponse(responseCode = "404", description = "Movie not found with the specified ID", content = @Content),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<Movie> getMovieById(
                        @Parameter(description = "Unique identifier of the movie", example = "1", required = true) @PathVariable Long id) {
                Movie movie = movieService.getMovieById(id);
                if (movie != null) {
                        return ResponseEntity.ok(movie);
                } else {
                        return ResponseEntity.notFound().build();
                }
        }

        @GetMapping("/{id}/characters")
        @Operation(summary = "Get characters in a movie", description = "Retrieves all characters that appear in a specific movie. "
                        +
                        "Returns character summary information to avoid circular references.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved movie characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CharacterSummaryDto.class))),
                        @ApiResponse(responseCode = "404", description = "Movie not found with the specified ID", content = @Content),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<CharacterSummaryDto>> getMovieCharacters(
                        @Parameter(description = "Unique identifier of the movie", example = "1", required = true) @PathVariable Long id) {
                List<CharacterSummaryDto> characters = movieService.getMovieCharacters(id);
                return ResponseEntity.ok(characters);
        }

        @GetMapping("/batch")
        @Operation(summary = "Batch fetch movies by IDs", description = "Retrieves multiple movies in a single request by providing a comma-separated list of movie IDs. "
                        +
                        "Optimized for loading favorited items without fetching entire collections.", tags = {
                                        "Movies" })
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid ID format", content = @Content),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<Movie>> getMoviesByIds(
                        @Parameter(description = "Comma-separated list of movie IDs", example = "1,5,12,23,45", required = true) @RequestParam String ids) {
                List<Long> idList = Arrays.stream(ids.split(","))
                                .map(String::trim)
                                .map(Long::parseLong)
                                .toList();
                List<Movie> movies = movieService.findByIds(idList);
                return ResponseEntity.ok(movies);
        }

        @GetMapping("/ids")
        @Operation(summary = "Get all movie IDs", description = "Retrieves a list of all movie IDs in the database. "
                        +
                        "Useful for random selection in games without loading full movie objects.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved movie IDs", content = @Content(mediaType = "application/json")),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<Long>> getAllMovieIds() {
                List<Long> ids = movieService.getAllMovieIds();
                return ResponseEntity.ok(ids);
        }

        @GetMapping("/ids-with-hints")
        @Operation(summary = "Get movie IDs that have hints", description = "Retrieves a list of movie IDs for movies that have hints available. "
                        +
                        "Used in guessing games to ensure selected movies can provide hints to players.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved movie IDs with hints", content = @Content(mediaType = "application/json")),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<Long>> getMovieIdsWithHints() {
                List<Long> ids = movieService.getMovieIdsWithHints();
                return ResponseEntity.ok(ids);
        }

        @GetMapping("/random-except")
        @Operation(summary = "Get random movies excluding specific IDs", description = "Retrieves random movies from the database while excluding specified IDs. "
                        +
                        "Used for generating wrong answer choices in guessing games.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved random movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Movie.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
        })
        public ResponseEntity<List<Movie>> getRandomMoviesExcept(
                        @Parameter(description = "Comma-separated list of movie IDs to exclude", example = "2494,2495,2496") @RequestParam(required = false) String exclude_ids,
                        @Parameter(description = "Number of random movies to return", example = "3") @RequestParam(defaultValue = "3") int count) {
                List<Long> excludeIdList = (exclude_ids == null || exclude_ids.isEmpty()) ? List.of()
                                : Arrays.stream(exclude_ids.split(","))
                                                .map(String::trim)
                                                .map(Long::parseLong)
                                                .toList();
                List<Movie> movies = movieService.getRandomMoviesExcept(excludeIdList, count);
                return ResponseEntity.ok(movies);
        }
}