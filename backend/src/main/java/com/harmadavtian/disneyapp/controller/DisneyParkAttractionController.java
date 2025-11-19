package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.model.DisneyParkAttraction;
import com.harmadavtian.disneyapp.service.DisneyParkAttractionService;
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
 * REST controller for Disney Park Attractions endpoints.
 * Provides API access to Disney theme park attraction information.
 * 
 * @author Harvey Harmadavtian
 */
@Slf4j
@RestController
@RequestMapping("/api/attractions")
@Tag(name = "Disney Park Attractions", description = "Disney park attractions API")
public class DisneyParkAttractionController {

    private final DisneyParkAttractionService disneyParkAttractionService;

    public DisneyParkAttractionController(DisneyParkAttractionService disneyParkAttractionService) {
        this.disneyParkAttractionService = disneyParkAttractionService;
    }

    /**
     * Get all Disney park attractions.
     * 
     * @return List of all attractions
     */
    @GetMapping
    @Operation(summary = "Get all attractions", description = "Retrieves a list of all Disney park attractions worldwide")
    public ResponseEntity<List<DisneyParkAttraction>> getAllAttractions() {
        return ResponseEntity.ok(disneyParkAttractionService.getAllAttractions());
    }

    /**
     * Get a specific attraction by URL ID.
     * 
     * @param urlId The unique URL identifier for the attraction
     * @return The attraction if found, 404 otherwise
     */
    @GetMapping("/{urlId}")
    @Operation(summary = "Get attraction by URL ID", description = "Retrieves a specific Disney park attraction by its unique URL identifier")
    public ResponseEntity<DisneyParkAttraction> getAttractionByUrlId(@PathVariable String urlId) {
        return disneyParkAttractionService.getAttractionByUrlId(urlId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all attractions in a specific park.
     * 
     * @param parkUrlId The URL ID of the park
     * @return List of attractions in that park
     */
    @GetMapping("/park/{parkUrlId}")
    @Operation(summary = "Get attractions by park", description = "Retrieves all attractions in a specific Disney park")
    public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByPark(@PathVariable String parkUrlId) {
        return ResponseEntity.ok(disneyParkAttractionService.getAttractionsByPark(parkUrlId));
    }

    /**
     * Get only operational attractions in a specific park.
     * 
     * @param parkUrlId The URL ID of the park
     * @return List of operational attractions in that park
     */
    @GetMapping("/park/{parkUrlId}/operational")
    @Operation(summary = "Get operational attractions by park", description = "Retrieves only operational attractions in a specific Disney park")
    public ResponseEntity<List<DisneyParkAttraction>> getOperationalAttractionsByPark(@PathVariable String parkUrlId) {
        return ResponseEntity.ok(disneyParkAttractionService.getOperationalAttractionsByPark(parkUrlId));
    }

    /**
     * Get all attractions of a specific type.
     * 
     * @param type The type of attraction
     * @return List of attractions of that type
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get attractions by type", description = "Retrieves all attractions of a specific type (e.g., ride, show)")
    public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByType(@PathVariable String type) {
        return ResponseEntity.ok(disneyParkAttractionService.getAttractionsByType(type));
    }

    /**
     * Get all attractions with a specific thrill level.
     * 
     * @param level The thrill level
     * @return List of attractions with that thrill level
     */
    @GetMapping("/thrill/{level}")
    @Operation(summary = "Get attractions by thrill level", description = "Retrieves all attractions with a specific thrill level (e.g., mild, moderate, high)")
    public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByThrillLevel(@PathVariable String level) {
        return ResponseEntity.ok(disneyParkAttractionService.getAttractionsByThrillLevel(level));
    }

    /**
     * Get all operational attractions.
     * 
     * @return List of operational attractions
     */
    @GetMapping("/operational")
    @Operation(summary = "Get operational attractions", description = "Retrieves all currently operational Disney park attractions")
    public ResponseEntity<List<DisneyParkAttraction>> getOperationalAttractions() {
        return ResponseEntity.ok(disneyParkAttractionService.getOperationalAttractions());
    }

    @GetMapping("/batch")
    @Operation(summary = "Batch fetch attractions by IDs", description = "Retrieves multiple park attractions in a single request by providing a comma-separated list of attraction IDs. "
            +
            "Optimized for loading favorited items without fetching entire collections.", tags = {
                    "Disney Park Attractions" })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved attractions", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DisneyParkAttraction.class))),
            @ApiResponse(responseCode = "400", description = "Invalid ID format", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByIds(
            @Parameter(description = "Comma-separated list of attraction IDs", example = "1,2,7,45,88", required = true) @RequestParam List<Long> ids) {
        List<DisneyParkAttraction> attractions = disneyParkAttractionService.findByIds(ids);
        return ResponseEntity.ok(attractions);
    }
}
