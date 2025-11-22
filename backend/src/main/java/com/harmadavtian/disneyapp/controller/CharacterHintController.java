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

import java.util.List;

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
}
