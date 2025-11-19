package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.MovieSummaryDto;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.repository.CharacterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CharacterService {

    private final CharacterRepository characterRepository;

    public CharacterService(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    public Character getCharacterById(Long id) {
        return characterRepository.findById(id).orElse(null);
    }

    /**
     * Batch fetch characters by their IDs.
     * Uses repository's findAllById which generates efficient WHERE id IN (...)
     * query.
     * 
     * @param ids List of character IDs to fetch
     * @return List of characters matching the provided IDs
     */
    public List<Character> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return characterRepository.findAllById(ids);
    }

    /**
     * Get all character IDs for quiz initialization.
     * More efficient than loading full character objects when only IDs are needed.
     * 
     * @return List of all character IDs
     */
    public List<Long> getAllCharacterIds() {
        return characterRepository.findAllIds();
    }

    /**
     * Get a specified number of random character IDs excluding the specified ID.
     * Used for generating wrong answers in the character quiz game and other
     * features.
     * 
     * @param excludeId The character ID to exclude from the random selection
     * @param count     The number of random IDs to return
     * @return List of random character IDs (excluding the specified ID)
     */
    public List<Long> getRandomCharacterIdsExcluding(Long excludeId, int count) {
        return characterRepository.findRandomIdsExcluding(excludeId, count);
    }

    /**
     * Get all movies associated with a specific character.
     * Returns movie summaries to prevent circular reference issues.
     * 
     * @param id The character ID
     * @return List of MovieSummaryDto objects
     */
    public List<MovieSummaryDto> getCharacterMovies(Long id) {
        Character character = characterRepository.findById(id).orElse(null);
        if (character == null) {
            return List.of();
        }

        return character.getMovies().stream()
                .map(this::convertToMovieSummary)
                .collect(Collectors.toList());
    }

    /**
     * Convert Movie entity to MovieSummaryDto.
     */
    private MovieSummaryDto convertToMovieSummary(Movie movie) {
        return new MovieSummaryDto(
                movie.getId(),
                movie.getUrlId(),
                movie.getTitle(),
                movie.getShortDescription(),
                movie.getCreationYear(),
                movie.getMovieRating(),
                movie.getImage1());
    }
}