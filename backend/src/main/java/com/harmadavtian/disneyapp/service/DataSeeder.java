package com.harmadavtian.disneyapp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.model.DisneyPark;
import com.harmadavtian.disneyapp.model.DisneyParkAttraction;
import com.harmadavtian.disneyapp.repository.CharacterRepository;
import com.harmadavtian.disneyapp.repository.MovieRepository;
import com.harmadavtian.disneyapp.repository.HeroMovieCarouselRepository;
import com.harmadavtian.disneyapp.repository.DisneyParkRepository;
import com.harmadavtian.disneyapp.repository.DisneyParkAttractionRepository;
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
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CharacterRepository characterRepository;
    private final MovieRepository movieRepository;
    private final HeroMovieCarouselRepository heroMovieCarouselRepository;
    private final DisneyParkRepository disneyParkRepository;
    private final DisneyParkAttractionRepository disneyParkAttractionRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(CharacterRepository characterRepository, MovieRepository movieRepository,
            HeroMovieCarouselRepository heroMovieCarouselRepository,
            DisneyParkRepository disneyParkRepository,
            DisneyParkAttractionRepository disneyParkAttractionRepository,
            ObjectMapper objectMapper) {
        this.characterRepository = characterRepository;
        this.movieRepository = movieRepository;
        this.heroMovieCarouselRepository = heroMovieCarouselRepository;
        this.disneyParkRepository = disneyParkRepository;
        this.disneyParkAttractionRepository = disneyParkAttractionRepository;
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

        // Seed parks FIRST (before attractions due to FK dependency)
        if (disneyParkRepository.count() == 0) {
            seedDisneyParks();
        }

        // Seed attractions AFTER parks
        if (disneyParkAttractionRepository.count() == 0) {
            seedDisneyParksAttractions();
        }

        // Seed movie-character relationships after both movies and characters exist
        seedMovieCharacterRelationships();
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

    /**
     * Reseed movie-character relationships: CLEAR all relationships + INSERT all
     * from JSON
     */
    @Transactional
    public Map<String, Integer> reseedMovieCharacterRelationships() throws IOException {
        log.info("Reseeding movie-character relationships: clearing all existing relationships...");

        // Clear all relationships by removing associations from both sides
        List<Movie> allMovies = movieRepository.findAll();
        for (Movie movie : allMovies) {
            movie.getCharacters().clear();
        }
        movieRepository.saveAll(allMovies);

        List<Character> allCharacters = characterRepository.findAll();
        for (Character character : allCharacters) {
            character.getMovies().clear();
        }
        characterRepository.saveAll(allCharacters);

        log.info("All relationships cleared. Loading relationships from JSON...");
        seedMovieCharacterRelationships();

        // Count relationships by checking junction table
        long totalRelationships = allMovies.stream()
                .mapToLong(m -> m.getCharacters().size())
                .sum();

        log.info("Reseeded {} movie-character relationships successfully", totalRelationships);
        return Map.of("inserted", (int) totalRelationships);
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

    /**
     * Seed movie-character relationships from JSON file
     */
    private void seedMovieCharacterRelationships() {
        // Check if relationships already exist by checking if any movie has characters
        long existingRelationshipsCount = movieRepository.findAll().stream()
                .mapToLong(m -> m.getCharacters().size())
                .sum();

        if (existingRelationshipsCount > 0) {
            log.info("Movie-character relationships already exist ({} relationships found), skipping seed",
                    existingRelationshipsCount);
            return;
        }

        ClassPathResource resource = new ClassPathResource("database/movie_characters_relationships.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<Map<String, Object>> relationships = objectMapper.readValue(inputStream,
                    new TypeReference<List<Map<String, Object>>>() {
                    });

            int successCount = 0;
            int failCount = 0;

            for (Map<String, Object> rel : relationships) {
                String movieUrlId = (String) rel.get("movie_url_id");
                String characterUrlId = (String) rel.get("character_url_id");

                // Find movie and character by url_id (guaranteed unique by DB constraint)
                Optional<Movie> movieOpt = movieRepository.findByUrlId(movieUrlId);
                Optional<Character> characterOpt = characterRepository.findByUrlId(characterUrlId);

                if (movieOpt.isPresent() && characterOpt.isPresent()) {
                    Movie movie = movieOpt.get();
                    Character character = characterOpt.get();

                    // Add bidirectional relationship
                    movie.getCharacters().add(character);
                    character.getMovies().add(movie);
                    successCount++;
                } else {
                    log.warn("Could not find movie '{}' or character '{}' - skipping relationship",
                            movieUrlId, characterUrlId);
                    failCount++;
                }
            }

            // Save all updated entities (relationships are persisted via cascade)
            movieRepository.flush();
            characterRepository.flush();

            log.info("Seeded {} movie-character relationships ({} successful, {} failed)",
                    relationships.size(), successCount, failCount);

        } catch (IOException e) {
            log.error("Error seeding movie-character relationships", e);
        }
    }

    /**
     * Seeds the Disney Parks table from JSON.
     * Should be called before seedDisneyParksAttractions() due to FK dependency.
     */
    private void seedDisneyParks() {
        log.info("Seeding Disney Parks...");
        ClassPathResource resource = new ClassPathResource("database/disney_parks.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<DisneyPark> parks = objectMapper.readValue(inputStream,
                    new TypeReference<List<DisneyPark>>() {
                    });
            disneyParkRepository.saveAll(parks);
            log.info("Seeded {} Disney parks", parks.size());
        } catch (IOException e) {
            log.error("Error seeding Disney parks", e);
        }
    }

    /**
     * Seeds the Disney Parks Attractions table from JSON.
     * Must be called AFTER seedDisneyParks() due to FK constraint on park_url_id.
     */
    private void seedDisneyParksAttractions() {
        log.info("Seeding Disney Parks Attractions...");
        ClassPathResource resource = new ClassPathResource("database/disney_parks_attractions.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<DisneyParkAttraction> attractions = objectMapper.readValue(inputStream,
                    new TypeReference<List<DisneyParkAttraction>>() {
                    });
            disneyParkAttractionRepository.saveAll(attractions);
            log.info("Seeded {} Disney park attractions", attractions.size());
        } catch (IOException e) {
            log.error("Error seeding Disney park attractions", e);
        }
    }

    /**
     * Reseed Disney Parks (for admin endpoint).
     * Deletes all existing parks and attractions, then reseeds from JSON.
     */
    @Transactional
    public void reseedDisneyParks() {
        log.info("Reseeding Disney Parks...");
        // Delete attractions first (FK dependency)
        disneyParkAttractionRepository.deleteAll();
        // Then delete parks
        disneyParkRepository.deleteAll();
        // Reseed parks
        seedDisneyParks();
        log.info("Disney Parks reseeded successfully");
    }

    /**
     * Reseed Disney Parks Attractions (for admin endpoint).
     * Deletes all existing attractions, then reseeds from JSON.
     */
    @Transactional
    public void reseedDisneyParksAttractions() {
        log.info("Reseeding Disney Parks Attractions...");
        disneyParkAttractionRepository.deleteAll();
        seedDisneyParksAttractions();
        log.info("Disney Parks Attractions reseeded successfully");
    }
}