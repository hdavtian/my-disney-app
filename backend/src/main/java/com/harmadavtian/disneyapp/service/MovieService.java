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
}