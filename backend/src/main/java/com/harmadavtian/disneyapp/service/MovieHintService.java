package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.MovieHintDto;
import com.harmadavtian.disneyapp.model.MovieHint;
import com.harmadavtian.disneyapp.repository.MovieHintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing movie hints.
 * Provides business logic for retrieving hints for movies.
 */
@Service
public class MovieHintService {

    private static final Logger log = LoggerFactory.getLogger(MovieHintService.class);

    private final MovieHintRepository movieHintRepository;

    public MovieHintService(MovieHintRepository movieHintRepository) {
        this.movieHintRepository = movieHintRepository;
    }

    /**
     * Get all hints for a specific movie.
     * 
     * @param movieUrlId The URL identifier of the movie
     * @return List of all hints for the movie as DTOs
     */
    public List<MovieHintDto> getAllHintsByMovieUrlId(String movieUrlId) {
        log.debug("Fetching all hints for movie: {}", movieUrlId);
        List<MovieHint> hints = movieHintRepository.findByMovieUrlId(movieUrlId);
        return hints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a limited number of hints for a specific movie.
     * Hints are returned ordered by difficulty (easiest first).
     * 
     * @param movieUrlId The URL identifier of the movie
     * @param count      The maximum number of hints to return
     * @return List of hints limited to the specified count
     */
    public List<MovieHintDto> getNHintsByMovieUrlId(String movieUrlId, int count) {
        log.debug("Fetching {} hints for movie: {}", count, movieUrlId);

        if (count <= 0) {
            log.warn("Invalid count requested: {}. Returning empty list.", count);
            return List.of();
        }

        List<MovieHint> hints = movieHintRepository.findTopNByMovieUrlId(
                movieUrlId,
                PageRequest.of(0, count));

        return hints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get the total count of hints for a movie.
     * 
     * @param movieUrlId The URL identifier of the movie
     * @return The number of hints available for the movie
     */
    public long getHintCount(String movieUrlId) {
        return movieHintRepository.countByMovieUrlId(movieUrlId);
    }

    /**
     * Convert a MovieHint entity to a DTO.
     * 
     * @param hint The entity to convert
     * @return The DTO representation
     */
    private MovieHintDto convertToDto(MovieHint hint) {
        return new MovieHintDto(
                hint.getId(),
                hint.getMovieUrlId(),
                hint.getContent(),
                hint.getDifficulty(),
                hint.getHintType());
    }
}
