package com.harmadavtian.disneyapp.service.search;

import com.harmadavtian.disneyapp.config.SearchCapabilitiesProperties;
import com.harmadavtian.disneyapp.dto.search.*;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.DisneyParkAttraction;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.repository.CharacterRepository;
import com.harmadavtian.disneyapp.repository.DisneyParkAttractionRepository;
import com.harmadavtian.disneyapp.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Service
public class SearchAggregationService {

    private static final int DEFAULT_LIMIT = 10;
    private static final Set<String> DESCRIPTION_FIELDS = Set.of("short_description", "long_description", "theme");

    private final MovieRepository movieRepository;
    private final CharacterRepository characterRepository;
    private final DisneyParkAttractionRepository attractionRepository;
    private final SearchCapabilitiesProperties capabilities;

    private static final Map<String, Function<Movie, String>> MOVIE_FIELD_EXTRACTORS = Map.ofEntries(
            Map.entry("title", Movie::getTitle),
            Map.entry("short_description", Movie::getShortDescription),
            Map.entry("long_description", Movie::getLongDescription),
            Map.entry("creation_year",
                    movie -> movie.getCreationYear() == null ? null : movie.getCreationYear().toString()),
            Map.entry("hidden_tags", Movie::getHiddenTags),
            Map.entry("movie_rating", Movie::getMovieRating));

    private static final Map<String, Function<Character, String>> CHARACTER_FIELD_EXTRACTORS = Map.ofEntries(
            Map.entry("name", Character::getName),
            Map.entry("short_description", Character::getShortDescription),
            Map.entry("long_description", Character::getLongDescription),
            Map.entry("first_appearance", Character::getFirstAppearance),
            Map.entry("franchise", Character::getFranchise),
            Map.entry("character_type", Character::getCharacterType));

    private static final Map<String, Function<DisneyParkAttraction, String>> PARK_FIELD_EXTRACTORS = Map.ofEntries(
            Map.entry("name", DisneyParkAttraction::getName),
            Map.entry("short_description", DisneyParkAttraction::getShortDescription),
            Map.entry("theme", DisneyParkAttraction::getTheme),
            Map.entry("land_area", DisneyParkAttraction::getLandArea),
            Map.entry("attraction_type", DisneyParkAttraction::getAttractionType),
            Map.entry("thrill_level", DisneyParkAttraction::getThrillLevel));

    public SearchAggregationService(MovieRepository movieRepository,
            CharacterRepository characterRepository,
            DisneyParkAttractionRepository attractionRepository,
            SearchCapabilitiesProperties capabilities) {
        this.movieRepository = movieRepository;
        this.characterRepository = characterRepository;
        this.attractionRepository = attractionRepository;
        this.capabilities = capabilities;
    }

    public SearchResponseDto search(String rawQuery,
            Set<String> requestedCategories,
            Map<String, String> scopeOverrides,
            Integer limitPerCategory,
            String matchMode) {
        if (!StringUtils.hasText(rawQuery) || rawQuery.trim().length() < 2) {
            throw new IllegalArgumentException("Search query must be at least 2 characters long.");
        }
        String normalizedQuery = rawQuery.trim();
        int limit = (limitPerCategory == null || limitPerCategory <= 0) ? DEFAULT_LIMIT : limitPerCategory;
        String effectiveMatchMode = (matchMode == null || matchMode.isBlank()) ? "partial" : matchMode;

        Map<String, SearchCapabilitiesProperties.Category> configuredCategories = capabilities.getCategories();
        Set<String> categoriesToProcess = requestedCategories == null || requestedCategories.isEmpty()
                ? configuredCategories.keySet()
                : requestedCategories;

        SearchResponseDto response = new SearchResponseDto();
        for (String categoryKey : categoriesToProcess) {
            SearchCapabilitiesProperties.Category category = configuredCategories.get(categoryKey);
            if (category == null) {
                continue;
            }
            String scopeKey = scopeOverrides.getOrDefault(categoryKey, "basic");
            SearchCapabilitiesProperties.Scope scope = category.getScopes().get(scopeKey);
            if (scope == null) {
                scope = category.getScopes().get("basic");
            }
            List<String> fields = scope == null ? List.of() : scope.getFields();
            if (fields.isEmpty()) {
                continue;
            }

            SearchCategoryResultDto categoryResult = switch (categoryKey) {
                case "movies" -> buildMovieResults(normalizedQuery, fields, limit, effectiveMatchMode);
                case "characters" -> buildCharacterResults(normalizedQuery, fields, limit, effectiveMatchMode);
                case "parks" -> buildParkResults(normalizedQuery, fields, limit, effectiveMatchMode);
                default -> null;
            };

            if (categoryResult != null) {
                response.getCategories().put(categoryKey, categoryResult);
            }
        }

        return response;
    }

    public SearchCapabilitiesProperties getCapabilities() {
        return capabilities;
    }

    private SearchCategoryResultDto buildMovieResults(String query, List<String> fields, int limit, String matchMode) {
        List<Movie> movies = movieRepository.findAll();
        return buildCategoryResult(movies, fields, limit, entity -> {
            Movie movie = entity;
            MovieSearchResultDto dto = new MovieSearchResultDto();
            dto.setId(movie.getId());
            dto.setType("movie");
            dto.setTitle(movie.getTitle());
            dto.setImageUrl(firstNonBlank(movie.getImage1(), movie.getImage2()));
            dto.setDetailPath(movie.getUrlId() == null ? null : "/movies/" + movie.getUrlId());
            dto.setCreationYear(movie.getCreationYear());
            dto.setMovieRating(movie.getMovieRating());
            return dto;
        }, MOVIE_FIELD_EXTRACTORS, query, matchMode);
    }

    private SearchCategoryResultDto buildCharacterResults(String query, List<String> fields, int limit,
            String matchMode) {
        List<Character> characters = characterRepository.findAll();
        return buildCategoryResult(characters, fields, limit, entity -> {
            Character character = entity;
            CharacterSearchResultDto dto = new CharacterSearchResultDto();
            dto.setId(character.getId());
            dto.setType("character");
            dto.setTitle(character.getName());
            dto.setImageUrl(firstNonBlank(character.getProfileImage1(), character.getBackgroundImage1()));
            dto.setDetailPath(character.getUrlId() == null ? null : "/characters/" + character.getUrlId());
            dto.setFirstAppearance(character.getFirstAppearance());
            dto.setFranchise(character.getFranchise());
            return dto;
        }, CHARACTER_FIELD_EXTRACTORS, query, matchMode);
    }

    private SearchCategoryResultDto buildParkResults(String query, List<String> fields, int limit, String matchMode) {
        List<DisneyParkAttraction> attractions = attractionRepository.findAll();
        return buildCategoryResult(attractions, fields, limit, entity -> {
            DisneyParkAttraction attraction = entity;
            ParkSearchResultDto dto = new ParkSearchResultDto();
            dto.setId(attraction.getId());
            dto.setType("park");
            dto.setTitle(attraction.getName());
            dto.setImageUrl(firstNonBlank(
                    attraction.getImage1(),
                    attraction.getImage2(),
                    attraction.getImage3(),
                    attraction.getImage4(),
                    attraction.getImage5()));
            dto.setDetailPath(attraction.getUrlId() == null ? null : "/parks/" + attraction.getUrlId());
            dto.setParkUrlId(attraction.getParkUrlId());
            dto.setAttractionType(attraction.getAttractionType());
            return dto;
        }, PARK_FIELD_EXTRACTORS, query, matchMode);
    }

    private <T> SearchCategoryResultDto buildCategoryResult(List<T> entities,
            List<String> fields,
            int limit,
            Function<T, DisneySearchResultDto> dtoFactory,
            Map<String, Function<T, String>> fieldExtractors,
            String query,
            String matchMode) {
        SearchCategoryResultDto categoryResult = new SearchCategoryResultDto();
        int added = 0;
        long totalMatches = 0;

        for (T entity : entities) {
            MatchComputation computation = evaluateEntity(entity, fields, fieldExtractors, query, matchMode);
            if (!computation.matched) {
                continue;
            }
            totalMatches++;
            if (added >= limit) {
                continue;
            }
            DisneySearchResultDto dto = dtoFactory.apply(entity);
            dto.setHighlights(computation.highlightMap);
            categoryResult.getResults().add(dto);
            added++;
        }
        categoryResult.setTotal(totalMatches);
        return categoryResult;
    }

    private <T> MatchComputation evaluateEntity(T entity,
            List<String> fields,
            Map<String, Function<T, String>> extractors,
            String query,
            String matchMode) {
        Map<String, FieldHighlightDto> highlightMap = new LinkedHashMap<>();
        boolean matched = false;
        for (String field : fields) {
            Function<T, String> extractor = extractors.get(field);
            if (extractor == null) {
                continue;
            }
            String value = extractor.apply(entity);
            boolean snippetField = DESCRIPTION_FIELDS.contains(field);
            var computation = SearchHighlightingUtils.compute(value, query, snippetField, matchMode);
            if (computation.isPresent()) {
                matched = true;
                SearchHighlightingUtils.HighlightComputation result = computation.get();
                highlightMap.put(field, new FieldHighlightDto(result.renderedText(), result.ranges()));
            }
        }
        return new MatchComputation(matched, highlightMap);
    }

    @SafeVarargs
    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private record MatchComputation(boolean matched,
            Map<String, FieldHighlightDto> highlightMap) {
    }
}
