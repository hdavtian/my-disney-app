package com.harmadavtian.disneyapp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.repository.CharacterRepository;
import com.harmadavtian.disneyapp.repository.MovieRepository;
import com.harmadavtian.disneyapp.repository.HeroMovieCarouselRepository;
import com.harmadavtian.disneyapp.model.HeroMovieCarousel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CharacterRepository characterRepository;
    private final MovieRepository movieRepository;
    private final HeroMovieCarouselRepository heroMovieCarouselRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(CharacterRepository characterRepository, MovieRepository movieRepository,
            HeroMovieCarouselRepository heroMovieCarouselRepository, ObjectMapper objectMapper) {
        this.characterRepository = characterRepository;
        this.movieRepository = movieRepository;
        this.heroMovieCarouselRepository = heroMovieCarouselRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Normal behavior: seed only if empty
        if (characterRepository.count() == 0) {
            seedCharacters();
        }
        if (movieRepository.count() == 0) {
            seedMovies();
        }
        if (heroMovieCarouselRepository.count() == 0) {
            seedHeroMovieCarousel();
        }
    }

    /**
     * Reseed characters table: DELETE all + INSERT all from JSON
     */
    @Transactional
    public Map<String, Integer> reseedCharacters() throws IOException {
        log.info("Reseeding characters: deleting all existing records...");
        characterRepository.deleteAll();

        log.info("Loading characters from JSON...");
        ClassPathResource resource = new ClassPathResource("database/disney_characters.json");
        List<Map<String, Object>> characterMaps;

        try (InputStream inputStream = resource.getInputStream()) {
            characterMaps = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {
            });
        }

        List<Character> characters = new ArrayList<>();
        for (Map<String, Object> map : characterMaps) {
            Character character = new Character();
            character.setId(((Number) map.get("id")).longValue());
            character.setUrlId((String) map.get("url_id"));
            character.setName((String) map.get("name"));
            character.setShortDescription((String) map.get("short_description"));
            character.setLongDescription((String) map.get("long_description"));
            character.setCharacterCreationYear((Integer) map.get("character_creation_year"));
            character.setFirstAppearance((String) map.get("first_appearance"));
            character.setFranchise((String) map.get("franchise"));
            character.setCategory((String) map.get("category"));
            character.setCharacterType((String) map.get("character_type"));
            character.setSpecies((String) map.get("species"));
            character.setProfileImage1((String) map.get("profile_image_1"));
            character.setBackgroundImage1((String) map.get("background_image_1"));

            if (map.get("relationships") != null) {
                character.setRelationships(objectMapper.writeValueAsString(map.get("relationships")));
            }
            if (map.get("voice_actors") != null) {
                character.setVoiceActors(objectMapper.writeValueAsString(map.get("voice_actors")));
            }

            character.setCreatedAt(LocalDateTime.now());
            character.setUpdatedAt(LocalDateTime.now());
            characters.add(character);
        }

        characterRepository.saveAll(characters);
        log.info("Reseeded {} characters successfully", characters.size());
        return Map.of("inserted", characters.size());
    }

    /**
     * Reseed movies table: DELETE all + INSERT all from JSON
     */
    @Transactional
    public Map<String, Integer> reseedMovies() throws IOException {
        log.info("Reseeding movies: deleting all existing records...");
        movieRepository.deleteAll();

        log.info("Loading movies from JSON...");
        ClassPathResource resource = new ClassPathResource("database/disney_movies.json");
        List<Movie> movies;

        try (InputStream inputStream = resource.getInputStream()) {
            movies = objectMapper.readValue(inputStream, new TypeReference<List<Movie>>() {
            });
        }

        movieRepository.saveAll(movies);
        log.info("Reseeded {} movies successfully", movies.size());
        return Map.of("inserted", movies.size());
    }

    /**
     * Reseed hero carousel: DELETE all + regenerate from movies
     */
    @Transactional
    public Map<String, Integer> reseedHeroCarousel() {
        log.info("Reseeding hero carousel: deleting all existing entries...");
        heroMovieCarouselRepository.deleteAll();

        log.info("Regenerating hero carousel...");
        seedHeroMovieCarousel();

        long count = heroMovieCarouselRepository.count();
        log.info("Reseeded {} hero carousel entries successfully", count);
        return Map.of("inserted", (int) count);
    }

    private void seedHeroMovieCarousel() {
        try {
            java.util.List<Movie> allMovies = movieRepository.findAll();
            if (allMovies.isEmpty()) {
                log.warn("No movies found to seed hero carousel");
                return;
            }
            // Shuffle and pick up to 11 movies
            java.util.Collections.shuffle(allMovies);
            int count = Math.min(11, allMovies.size());
            java.util.List<HeroMovieCarousel> entries = new java.util.ArrayList<>();
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            for (int i = 0; i < count; i++) {
                HeroMovieCarousel e = new HeroMovieCarousel();
                e.setMovie(allMovies.get(i));
                e.setLocation("homepage");
                e.setSortOrder(i + 1);
                // set all published true except one (make the last one unpublished)
                e.setPublished(i == count - 1 ? Boolean.FALSE : Boolean.TRUE);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                entries.add(e);
            }
            heroMovieCarouselRepository.saveAll(entries);
            log.info("Seeded {} hero_movie_carousel entries", entries.size());
        } catch (Exception e) {
            log.error("Error seeding hero_movie_carousel", e);
        }
    }

    private void seedCharacters() {
        ClassPathResource resource = new ClassPathResource("database/disney_characters.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<Map<String, Object>> characterMaps = objectMapper.readValue(inputStream,
                    new TypeReference<List<Map<String, Object>>>() {
                    });
            List<Character> characters = new ArrayList<>();
            for (Map<String, Object> map : characterMaps) {
                Character character = new Character();
                character.setUrlId((String) map.get("url_id"));
                character.setName((String) map.get("name"));
                character.setShortDescription((String) map.get("short_description"));
                character.setLongDescription((String) map.get("long_description"));
                character.setCharacterCreationYear((Integer) map.get("character_creation_year"));
                character.setFirstAppearance((String) map.get("first_appearance"));
                character.setFranchise((String) map.get("franchise"));
                character.setCategory((String) map.get("category"));
                character.setCharacterType((String) map.get("character_type"));
                character.setSpecies((String) map.get("species"));
                character.setProfileImage1((String) map.get("profile_image_1"));
                character.setBackgroundImage1((String) map.get("background_image_1"));
                // Serialize complex fields to JSON strings
                if (map.get("relationships") != null) {
                    character.setRelationships(objectMapper.writeValueAsString(map.get("relationships")));
                }
                if (map.get("voice_actors") != null) {
                    character.setVoiceActors(objectMapper.writeValueAsString(map.get("voice_actors")));
                }
                character.setCreatedAt(LocalDateTime.now());
                character.setUpdatedAt(LocalDateTime.now());
                characters.add(character);
            }
            characterRepository.saveAll(characters);
            log.info("Seeded {} characters", characters.size());
        } catch (IOException e) {
            log.error("Error seeding characters", e);
        }
    }

    private void seedMovies() {
        ClassPathResource resource = new ClassPathResource("database/disney_movies.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<Movie> movies = objectMapper.readValue(inputStream, new TypeReference<List<Movie>>() {
            });
            movieRepository.saveAll(movies);
            log.info("Seeded {} movies", movies.size());
        } catch (IOException e) {
            log.error("Error seeding movies", e);
        }
    }
}