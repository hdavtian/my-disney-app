package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.dto.CharacterHintDto;
import com.harmadavtian.disneyapp.service.CharacterHintService;
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
 * REST controller for managing character hints.
 * Provides endpoints for retrieving hints to help identify Disney characters.
 */
@Slf4j
@RestController
@RequestMapping("/api/character-hints")
@Tag(name = "Character Hints", description = "Character Hints API - Endpoints for retrieving hints about Disney characters for quiz games and interactive features")
public class CharacterHintController {

    private final CharacterHintService characterHintService;

    public CharacterHintController(CharacterHintService characterHintService) {
        this.characterHintService = characterHintService;
    }

    /**
     * Get all hints for a specific character.
     * 
     * @param urlId The URL identifier of the character
     * @return ResponseEntity containing list of all hints for the character
     */
    @GetMapping("/{urlId}")
    @Operation(summary = "Get all hints for a character", description = "Retrieves all available hints for a specific Disney character identified by their URL ID. "
            +
            "Hints include biographical information, relationships, plot details, quotes, trivia, and appearance descriptions. "
            +
            "Useful for quiz games and interactive character identification features.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved character hints", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CharacterHintDto.class))),
            @ApiResponse(responseCode = "404", description = "Character not found with the specified URL ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<CharacterHintDto>> getAllHints(
            @Parameter(description = "URL identifier of the character", example = "aladdin", required = true) @PathVariable String urlId) {

        log.debug("Request received for all hints of character: {}", urlId);
        List<CharacterHintDto> hints = characterHintService.getAllHintsByCharacterUrlId(urlId);

        if (hints.isEmpty()) {
            log.warn("No hints found for character: {}", urlId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hints);
    }

    /**
     * Get a limited number of hints for a specific character.
     * Hints are returned in order of difficulty (easiest first).
     * 
     * @param urlId The URL identifier of the character
     * @param count The maximum number of hints to return (default: 5)
     * @return ResponseEntity containing limited list of hints
     */
    @GetMapping("/{urlId}/limited")
    @Operation(summary = "Get limited hints for a character", description = "Retrieves a specified number of hints for a Disney character, ordered by difficulty (easiest to hardest). "
            +
            "Perfect for progressive hint systems in quiz games where you want to reveal hints gradually. " +
            "Default count is 5 hints if not specified.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved limited character hints", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CharacterHintDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid count parameter (must be positive)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Character not found with the specified URL ID", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<CharacterHintDto>> getLimitedHints(
            @Parameter(description = "URL identifier of the character", example = "aladdin", required = true) @PathVariable String urlId,
            @Parameter(description = "Number of hints to return (1-50)", example = "5") @RequestParam(defaultValue = "5") int count) {

        log.debug("Request received for {} hints of character: {}", count, urlId);

        if (count <= 0 || count > 50) {
            log.warn("Invalid count requested: {}. Must be between 1 and 50.", count);
            return ResponseEntity.badRequest().build();
        }

        List<CharacterHintDto> hints = characterHintService.getNHintsByCharacterUrlId(urlId, count);

        if (hints.isEmpty()) {
            log.warn("No hints found for character: {}", urlId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hints);
    }

    /**
     * Get a random hint for a character filtered by difficulty.
     * Used for guessing games to provide progressive difficulty hints.
     * 
     * @param character_url_id The URL identifier of the character
     * @param difficulty       The difficulty level (easy, medium, hard)
     * @return ResponseEntity containing a random hint at the specified difficulty
     */
    @GetMapping("/random")
    @Operation(summary = "Get random hint by difficulty", description = "Retrieves a random hint for a specific character filtered by difficulty level. "
            +
            "Used in guessing games to provide progressive difficulty hints. " +
            "Difficulty levels: easy (1), medium (2), hard (3).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved random hint", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CharacterHintDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid difficulty parameter", content = @Content),
            @ApiResponse(responseCode = "404", description = "No hints found for the specified character and difficulty", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<CharacterHintDto> getRandomHintByDifficulty(
            @Parameter(description = "URL identifier of the character", example = "aladdin", required = true) @RequestParam String character_url_id,
            @Parameter(description = "Difficulty level (1=easy, 2=medium, 3=hard)", example = "1", required = true) @RequestParam int difficulty) {

        log.debug("Request received for random hint of character: {} with difficulty: {}", character_url_id,
                difficulty);

        if (difficulty < 1 || difficulty > 3) {
            log.warn("Invalid difficulty requested: {}. Must be 1 (easy), 2 (medium), or 3 (hard).", difficulty);
            return ResponseEntity.badRequest().build();
        }

        CharacterHintDto hint = characterHintService.getRandomHintByDifficulty(character_url_id, difficulty);

        if (hint == null) {
            log.warn("No hint found for character: {} with difficulty: {}", character_url_id, difficulty);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(hint);
    }

    /**
     * Get hints for multiple characters in a single batch request.
     * Optimized endpoint for loading all hints needed for a guessing game at once.
     * 
     * @param urlIds Comma-separated list of character URL identifiers
     * @return ResponseEntity containing map of character URL IDs to their hints
     */
    @GetMapping("/batch")
    @Operation(summary = "Batch fetch hints for multiple characters", description = "Retrieves all hints for multiple characters in a single request by providing a comma-separated list of character URL IDs. "
            +
            "Optimized for guessing games to load all hints upfront, reducing API calls from N to 1. " +
            "Returns a map where keys are character URL IDs and values are lists of hints.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved hints for all characters", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid URL ID format or empty list", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<Map<String, List<CharacterHintDto>>> getBatchHints(
            @Parameter(description = "Comma-separated list of character URL identifiers", example = "aladdin,elsa,anna", required = true) @RequestParam String urlIds) {

        log.debug("Request received for batch hints: {}", urlIds);

        List<String> urlIdList = Arrays.stream(urlIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (urlIdList.isEmpty()) {
            log.warn("Empty URL ID list provided");
            return ResponseEntity.badRequest().build();
        }

        Map<String, List<CharacterHintDto>> hintsMap = characterHintService.getBatchHints(urlIdList);
        return ResponseEntity.ok(hintsMap);
    }
}
