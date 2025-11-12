package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.model.CarouselItemDto;
import com.harmadavtian.disneyapp.service.HeroCarouselService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/carousels")
@Tag(name = "Carousel", description = "Hero Carousel API - Endpoints for retrieving dynamic carousel content")
public class CarouselController {

    private final HeroCarouselService heroCarouselService;

    public CarouselController(HeroCarouselService heroCarouselService) {
        this.heroCarouselService = heroCarouselService;
    }

    @GetMapping
    @Operation(summary = "Get carousel items by location", description = "Retrieves carousel items for a specific location in the application. "
            +
            "Each carousel item includes image URLs, titles, descriptions, and display order. " +
            "Default location is 'homepage'.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved carousel items", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CarouselItemDto.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<List<CarouselItemDto>> getCarousel(
            @Parameter(description = "Location identifier for the carousel (e.g., 'homepage', 'characters')", example = "homepage") @RequestParam(name = "location", defaultValue = "homepage") String location) {
        List<CarouselItemDto> dtos = heroCarouselService.getCarouselByLocation(location);
        return ResponseEntity.ok(dtos);
    }
}
