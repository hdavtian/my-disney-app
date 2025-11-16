package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.MovieSummaryDto;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.service.CharacterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
@Tag(name = "Characters", description = "Disney Character Management API - Endpoints for retrieving and managing Disney character data")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping
    @Operation(summary = "Get all Disney characters", description = "Retrieves a complete list of all Disney characters in the database. "
            +
            "Returns character details including name, movies, traits, and image URLs.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Character.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<Character>> getAllCharacters() {
        List<Character> characters = characterService.getAllCharacters();
        return ResponseEntity.ok(characters);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get character by ID", description = "Retrieves a single Disney character by their unique identifier. "
            +
            "Returns detailed character information including all associated movies and traits.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Character found and returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Character.class))),
            @ApiResponse(responseCode = "404", description = "Character not found with the specified ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<Character> getCharacterById(
            @Parameter(description = "Unique identifier of the character", example = "1", required = true) @PathVariable Long id) {
        Character character = characterService.getCharacterById(id);
        if (character != null) {
            return ResponseEntity.ok(character);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all character IDs for quiz initialization.
     * Returns only the IDs for efficiency when full character objects aren't
     * needed.
     * 
     * @return ResponseEntity containing list of all character IDs
     */
    @GetMapping("/ids")
    @Operation(summary = "Get all character IDs", description = "Retrieves a list of all character IDs only, without full character details. "
            +
            "Optimized for quiz initialization and other features that only need ID references.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all character IDs", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Long.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<Long>> getAllCharacterIds() {
        List<Long> characterIds = characterService.getAllCharacterIds();
        return ResponseEntity.ok(characterIds);
    }

    /**
     * Get a specified number of random character IDs excluding the specified ID.
     * Used for generating wrong answers in the character quiz game and other
     * features.
     * 
     * @param excludeId The character ID to exclude from the random selection
     * @param count     The number of random IDs to return (default: 3)
     * @return ResponseEntity containing list of random character IDs
     */
    @GetMapping("/random-except/{excludeId}")
    @Operation(summary = "Get random character IDs excluding one", description = "Retrieves a specified number of random character IDs, excluding a given character ID. "
            +
            "Primarily used for generating wrong answer choices in the character quiz game. " +
            "Returns a list of unique character IDs that can be used alongside the correct answer.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved random character IDs", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Long.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - Invalid excludeId or count parameter", content = @Content),
            @ApiResponse(responseCode = "422", description = "Unprocessable entity - Not enough characters in database to fulfill request", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<Long>> getRandomCharactersExcept(
            @Parameter(description = "Character ID to exclude from random selection", example = "1", required = true) @PathVariable Long excludeId,
            @Parameter(description = "Number of random character IDs to return (max 50)", example = "3") @RequestParam(defaultValue = "3") int count) {

        if (excludeId == null || excludeId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        if (count <= 0 || count > 50) { // Reasonable upper limit
            return ResponseEntity.badRequest().build();
        }

        List<Long> randomIds = characterService.getRandomCharacterIdsExcluding(excludeId, count);

        // Ensure we have the requested number of results
        if (randomIds.size() < count) {
            // This shouldn't happen with 180 characters, but handle gracefully
            return ResponseEntity.unprocessableEntity().build();
        }

        return ResponseEntity.ok(randomIds);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Get movies featuring a character", description = "Retrieves all movies in which a specific character appears. "
            +
            "Returns movie summary information to avoid circular references.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved character movies", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovieSummaryDto.class))),
            @ApiResponse(responseCode = "404", description = "Character not found with the specified ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<MovieSummaryDto>> getCharacterMovies(
            @Parameter(description = "Unique identifier of the character", example = "1", required = true) @PathVariable Long id) {
        List<MovieSummaryDto> movies = characterService.getCharacterMovies(id);
        return ResponseEntity.ok(movies);
    }
}