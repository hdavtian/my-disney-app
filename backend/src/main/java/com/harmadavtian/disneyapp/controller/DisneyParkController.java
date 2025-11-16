package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.model.DisneyPark;
import com.harmadavtian.disneyapp.service.DisneyParkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Disney Parks endpoints.
 * Provides API access to Disney theme park information.
 * 
 * @author Harvey Harmadavtian
 */
@RestController
@RequestMapping("/api/parks")
@Tag(name = "Disney Parks", description = "Disney theme park information API")
public class DisneyParkController {

    private final DisneyParkService disneyParkService;

    public DisneyParkController(DisneyParkService disneyParkService) {
        this.disneyParkService = disneyParkService;
    }

    /**
     * Get all Disney parks.
     * 
     * @return List of all parks
     */
    @GetMapping
    @Operation(summary = "Get all Disney parks", description = "Retrieves a list of all Disney theme parks worldwide")
    public ResponseEntity<List<DisneyPark>> getAllParks() {
        return ResponseEntity.ok(disneyParkService.getAllParks());
    }

    /**
     * Get a specific park by URL ID.
     * 
     * @param urlId The unique URL identifier for the park
     * @return The park if found, 404 otherwise
     */
    @GetMapping("/{urlId}")
    @Operation(summary = "Get park by URL ID", description = "Retrieves a specific Disney park by its unique URL identifier")
    public ResponseEntity<DisneyPark> getParkByUrlId(@PathVariable String urlId) {
        return disneyParkService.getParkByUrlId(urlId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all parks in a specific country.
     * 
     * @param country The country name
     * @return List of parks in that country
     */
    @GetMapping("/country/{country}")
    @Operation(summary = "Get parks by country", description = "Retrieves all Disney parks in a specific country")
    public ResponseEntity<List<DisneyPark>> getParksByCountry(@PathVariable String country) {
        return ResponseEntity.ok(disneyParkService.getParksByCountry(country));
    }

    /**
     * Get all parks in a specific resort.
     * 
     * @param resort The resort name
     * @return List of parks in that resort
     */
    @GetMapping("/resort/{resort}")
    @Operation(summary = "Get parks by resort", description = "Retrieves all Disney parks in a specific resort")
    public ResponseEntity<List<DisneyPark>> getParksByResort(@PathVariable String resort) {
        return ResponseEntity.ok(disneyParkService.getParksByResort(resort));
    }

    /**
     * Get all parks that have a castle.
     * 
     * @return List of castle parks
     */
    @GetMapping("/castle-parks")
    @Operation(summary = "Get castle parks", description = "Retrieves all Disney parks that feature a castle")
    public ResponseEntity<List<DisneyPark>> getCastleParks() {
        return ResponseEntity.ok(disneyParkService.getCastleParks());
    }
}
