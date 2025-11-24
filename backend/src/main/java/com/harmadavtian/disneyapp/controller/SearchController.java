package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.config.SearchCapabilitiesProperties;
import com.harmadavtian.disneyapp.dto.search.SearchResponseDto;
import com.harmadavtian.disneyapp.service.search.SearchAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Collections;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Disney Search", description = "Aggregated search across movies, characters, and parks")
public class SearchController {

    private final SearchAggregationService searchAggregationService;

    public SearchController(SearchAggregationService searchAggregationService) {
        this.searchAggregationService = searchAggregationService;
    }

    @GetMapping
    @Operation(summary = "Search across Disney content", description = "Unified search across movies, characters, and park attractions with customizable scopes and match modes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search results returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    public ResponseEntity<SearchResponseDto> search(
            @Parameter(description = "Search query term", example = "star wars", required = true) @RequestParam String query,

            @Parameter(description = "Comma-separated list of categories to search (movies, characters, parks)", example = "movies,characters,parks") @RequestParam(required = false) String categories,

            @Parameter(description = "Maximum number of results per category", example = "10") @RequestParam(required = false) Integer limit,

            @Parameter(description = "Match mode: 'exact' for whole word matching, 'partial' for substring matching", example = "exact") @RequestParam(required = false, defaultValue = "partial") String matchMode,

            @Parameter(description = "Search scope per category (basic or extended). Use scope[movies]=extended, scope[characters]=basic, etc.", example = "scope[movies]=extended&scope[characters]=basic") @RequestParam(required = false) MultiValueMap<String, String> scope) {
        Set<String> categorySet = parseCategories(categories);
        Map<String, String> scopeOverrides = scope == null
                ? Collections.emptyMap()
                : scope.entrySet().stream()
                        .filter(entry -> entry.getKey().startsWith("scope["))
                        .collect(Collectors.toMap(entry -> entry.getKey()
                                .substring(entry.getKey().indexOf('[') + 1, entry.getKey().indexOf(']')),
                                entry -> entry.getValue().isEmpty() ? "" : entry.getValue().getFirst()));

        SearchResponseDto response = searchAggregationService.search(query,
                categorySet,
                scopeOverrides,
                limit,
                matchMode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/capabilities")
    @Operation(summary = "Get search capabilities", description = "Returns available search categories, scopes, and searchable fields for each content type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Capabilities returned successfully")
    })
    public ResponseEntity<SearchCapabilitiesProperties> capabilities() {
        return ResponseEntity.ok(searchAggregationService.getCapabilities());
    }

    private Set<String> parseCategories(String categories) {
        if (categories == null || categories.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(categories.split(","))
                .map(String::trim)
                .filter(str -> !str.isEmpty())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }
}
