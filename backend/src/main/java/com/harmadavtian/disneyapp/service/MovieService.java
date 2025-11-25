package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.CharacterSummaryDto;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    /**
     * Batch fetch movies by their IDs.
     * Uses repository's findAllById which generates efficient WHERE id IN (...)
     * query.
     * 
     * @param ids List of movie IDs to fetch
     * @return List of movies matching the provided IDs
     */
    public List<Movie> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return movieRepository.findAllById(ids);
    }

    /**
     * Get all characters associated with a specific movie.
     * Returns character summaries to prevent circular reference issues.
     * 
     * @param id The movie ID
     * @return List of CharacterSummaryDto objects
     */
    public List<CharacterSummaryDto> getMovieCharacters(Long id) {
        Movie movie = movieRepository.findById(id).orElse(null);
        if (movie == null) {
            return List.of();
        }

        return movie.getCharacters().stream()
                .map(this::convertToCharacterSummary)
                .collect(Collectors.toList());
    }

    /**
     * Convert Character entity to CharacterSummaryDto.
     */
    private CharacterSummaryDto convertToCharacterSummary(Character character) {
        return new CharacterSummaryDto(
                character.getId(),
                character.getUrlId(),
                character.getName(),
                character.getShortDescription(),
                character.getCategory(),
                character.getCharacterType(),
                character.getSpecies(),
                character.getProfileImage1());
    }

    /**
     * Get all movie IDs.
     * Used for random selection in games without loading full movie objects.
     * 
     * @return List of all movie IDs
     */
    public List<Long> getAllMovieIds() {
        return movieRepository.findAll().stream()
                .map(Movie::getId)
                .collect(Collectors.toList());
    }

    /**
     * Get random movies excluding specific IDs.
     * Used for generating wrong answer choices in guessing games.
     * 
     * @param excludeIds List of movie IDs to exclude
     * @param count      Number of random movies to return
     * @return List of random movies
     */
    public List<Movie> getRandomMoviesExcept(List<Long> excludeIds, int count) {
        if (excludeIds == null || excludeIds.isEmpty()) {
            return movieRepository.findRandom(count);
        }
        return movieRepository.findRandomExcept(excludeIds, count);
    }

    /**
     * Get movie IDs that have hints available.
     * Used in guessing games to ensure selected movies can provide hints to
     * players.
     * 
     * @return List of movie IDs that have at least one hint
     */
    public List<Long> getMovieIdsWithHints() {
        return movieRepository.findIdsWithHints();
    }
}