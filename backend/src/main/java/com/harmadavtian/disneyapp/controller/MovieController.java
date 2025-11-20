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
}