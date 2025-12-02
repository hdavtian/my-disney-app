package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.model.ContentEmbedding;
import com.harmadavtian.disneyapp.model.DisneyPark;
import com.harmadavtian.disneyapp.model.Movie;
import com.harmadavtian.disneyapp.repository.*;
import com.harmadavtian.disneyapp.service.llm.LLMClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for generating and managing content embeddings.
 * 
 * Provides batch processing for embedding all Disney content:
 * - Characters (name, descriptions, attributes)
 * - Movies (title, descriptions)
 * - Disney Parks (name, description)
 * 
 * Features:
 * - Smart re-embedding (skips existing embeddings)
 * - Batch processing with progress logging
 * - Rate limit handling (sleep between batches)
 * - Text content extraction and formatting
 * 
 * @author Harma Davtian
 */
@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);

    private final LLMClient llmClient;
    private final ContentEmbeddingRepository embeddingRepository;
    private final CharacterRepository characterRepository;
    private final MovieRepository movieRepository;
    private final DisneyParkRepository parkRepository;

    public EmbeddingService(
            LLMClient llmClient,
            ContentEmbeddingRepository embeddingRepository,
            CharacterRepository characterRepository,
            MovieRepository movieRepository,
            DisneyParkRepository parkRepository) {
        this.llmClient = llmClient;
        this.embeddingRepository = embeddingRepository;
        this.characterRepository = characterRepository;
        this.movieRepository = movieRepository;
        this.parkRepository = parkRepository;
    }

    /**
     * Generate embeddings for all content types.
     * 
     * Processes characters, movies, and parks in batches.
     * Progress logged for monitoring.
     * 
     * @param forceRegenerate If true, regenerate all embeddings even if they exist
     * @return Summary of embeddings generated
     */
    @Transactional
    public EmbeddingGenerationResult generateAllEmbeddings(boolean forceRegenerate) {
        logger.info("Starting batch embedding generation (force={})...", forceRegenerate);

        // If force regenerate, delete all existing embeddings first
        if (forceRegenerate) {
            logger.info("Force regenerate enabled - deleting all existing embeddings...");
            embeddingRepository.deleteAll();
            logger.info("All existing embeddings deleted");
        }

        EmbeddingGenerationResult result = new EmbeddingGenerationResult();

        // Generate character embeddings
        result.charactersProcessed = generateCharacterEmbeddings(forceRegenerate);
        logger.info("Characters: {} embeddings generated", result.charactersProcessed);

        // Generate movie embeddings
        result.moviesProcessed = generateMovieEmbeddings(forceRegenerate);
        logger.info("Movies: {} embeddings generated", result.moviesProcessed);

        // Generate park embeddings
        result.parksProcessed = generateParkEmbeddings(forceRegenerate);
        logger.info("Parks: {} embeddings generated", result.parksProcessed);

        result.totalProcessed = result.charactersProcessed + result.moviesProcessed + result.parksProcessed;
        logger.info("Batch embedding generation complete: {} total embeddings", result.totalProcessed);

        return result;
    }

    /**
     * Generate embeddings for all characters.
     * 
     * @param forceRegenerate If true, regenerate even if embedding exists
     * @return Number of embeddings generated
     */
    private int generateCharacterEmbeddings(boolean forceRegenerate) {
        List<Character> characters = characterRepository.findAll();
        int generated = 0;

        for (Character character : characters) {
            try {
                if (generateCharacterEmbedding(character, forceRegenerate)) {
                    generated++;

                    // Rate limiting: sleep 1 second between API calls (60/min limit)
                    if (generated % 10 == 0) {
                        logger.debug("Generated {} character embeddings, sleeping...", generated);
                        Thread.sleep(1000);
                    }
                }
            } catch (InterruptedException e) {
                logger.warn("Interrupted during character embedding generation", e);
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                logger.error("Failed to generate embedding for character {}: {}",
                        character.getName(), e.getMessage(), e);
            }
        }

        return generated;
    }

    /**
     * Generate embedding for a single character.
     * 
     * @param character       Character to embed
     * @param forceRegenerate If true, regenerate even if exists
     * @return true if embedding was generated
     */
    private boolean generateCharacterEmbedding(Character character, boolean forceRegenerate) {
        String modelVersion = llmClient.getEmbeddingModelName();

        // Check if embedding already exists
        if (!forceRegenerate) {
            Optional<ContentEmbedding> existing = embeddingRepository
                    .findByContentTypeAndContentIdAndModelVersion(
                            "character",
                            character.getId(),
                            modelVersion);
            if (existing.isPresent()) {
                logger.debug("Skipping character {} - embedding exists", character.getName());
                return false;
            }
        }

        // Build text content for embedding
        String textContent = buildCharacterText(character);

        // Generate embedding
        float[] embedding = llmClient.generateEmbedding(textContent);

        // Save to database
        ContentEmbedding contentEmbedding = new ContentEmbedding();
        contentEmbedding.setContentType("character");
        contentEmbedding.setContentId(character.getId());
        contentEmbedding.setTextContent(textContent);
        contentEmbedding.setEmbedding(embedding);
        contentEmbedding.setModelVersion(modelVersion);

        embeddingRepository.saveWithVector(contentEmbedding);
        logger.debug("Generated embedding for character: {}", character.getName());

        return true;
    }

    /**
     * Generate embeddings for all movies.
     * 
     * @param forceRegenerate If true, regenerate even if embedding exists
     * @return Number of embeddings generated
     */
    private int generateMovieEmbeddings(boolean forceRegenerate) {
        List<Movie> movies = movieRepository.findAll();
        int generated = 0;

        for (Movie movie : movies) {
            try {
                if (generateMovieEmbedding(movie, forceRegenerate)) {
                    generated++;

                    if (generated % 10 == 0) {
                        logger.debug("Generated {} movie embeddings, sleeping...", generated);
                        Thread.sleep(1000);
                    }
                }
            } catch (InterruptedException e) {
                logger.warn("Interrupted during movie embedding generation", e);
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                logger.error("Failed to generate embedding for movie {}: {}",
                        movie.getTitle(), e.getMessage(), e);
            }
        }

        return generated;
    }

    /**
     * Generate embedding for a single movie.
     * 
     * @param movie           Movie to embed
     * @param forceRegenerate If true, regenerate even if exists
     * @return true if embedding was generated
     */
    private boolean generateMovieEmbedding(Movie movie, boolean forceRegenerate) {
        String modelVersion = llmClient.getEmbeddingModelName();

        if (!forceRegenerate) {
            Optional<ContentEmbedding> existing = embeddingRepository
                    .findByContentTypeAndContentIdAndModelVersion(
                            "movie",
                            movie.getId(),
                            modelVersion);
            if (existing.isPresent()) {
                logger.debug("Skipping movie {} - embedding exists", movie.getTitle());
                return false;
            }
        }

        String textContent = buildMovieText(movie);
        float[] embedding = llmClient.generateEmbedding(textContent);

        ContentEmbedding contentEmbedding = new ContentEmbedding();
        contentEmbedding.setContentType("movie");
        contentEmbedding.setContentId(movie.getId());
        contentEmbedding.setTextContent(textContent);
        contentEmbedding.setEmbedding(embedding);
        contentEmbedding.setModelVersion(modelVersion);

        embeddingRepository.saveWithVector(contentEmbedding);
        logger.debug("Generated embedding for movie: {}", movie.getTitle());

        return true;
    }

    /**
     * Generate embeddings for all Disney parks.
     * 
     * @param forceRegenerate If true, regenerate even if embedding exists
     * @return Number of embeddings generated
     */
    private int generateParkEmbeddings(boolean forceRegenerate) {
        List<DisneyPark> parks = parkRepository.findAll();
        int generated = 0;

        for (DisneyPark park : parks) {
            try {
                if (generateParkEmbedding(park, forceRegenerate)) {
                    generated++;

                    if (generated % 10 == 0) {
                        logger.debug("Generated {} park embeddings, sleeping...", generated);
                        Thread.sleep(1000);
                    }
                }
            } catch (InterruptedException e) {
                logger.warn("Interrupted during park embedding generation", e);
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                logger.error("Failed to generate embedding for park {}: {}",
                        park.getName(), e.getMessage(), e);
            }
        }

        return generated;
    }

    /**
     * Generate embedding for a single park.
     * 
     * @param park            Park to embed
     * @param forceRegenerate If true, regenerate even if exists
     * @return true if embedding was generated
     */
    private boolean generateParkEmbedding(DisneyPark park, boolean forceRegenerate) {
        String modelVersion = llmClient.getEmbeddingModelName();

        if (!forceRegenerate) {
            Optional<ContentEmbedding> existing = embeddingRepository
                    .findByContentTypeAndContentIdAndModelVersion(
                            "park",
                            park.getId(),
                            modelVersion);
            if (existing.isPresent()) {
                logger.debug("Skipping park {} - embedding exists", park.getName());
                return false;
            }
        }

        String textContent = buildParkText(park);
        float[] embedding = llmClient.generateEmbedding(textContent);

        ContentEmbedding contentEmbedding = new ContentEmbedding();
        contentEmbedding.setContentType("park");
        contentEmbedding.setContentId(park.getId());
        contentEmbedding.setTextContent(textContent);
        contentEmbedding.setEmbedding(embedding);
        contentEmbedding.setModelVersion(modelVersion);

        embeddingRepository.saveWithVector(contentEmbedding);
        logger.debug("Generated embedding for park: {}", park.getName());

        return true;
    }

    /**
     * Build rich text content for character embedding.
     * 
     * Format: Name, category, species, type, descriptions, franchise, first
     * appearance.
     * 
     * @param character Character entity
     * @return Text content for embedding
     */
    private String buildCharacterText(Character character) {
        StringBuilder sb = new StringBuilder();

        sb.append("Character: ").append(character.getName()).append("\n");

        if (character.getCategory() != null) {
            sb.append("Category: ").append(character.getCategory()).append("\n");
        }

        if (character.getSpecies() != null) {
            sb.append("Species: ").append(character.getSpecies()).append("\n");
        }

        if (character.getCharacterType() != null) {
            sb.append("Type: ").append(character.getCharacterType()).append("\n");
        }

        if (character.getShortDescription() != null) {
            sb.append("\n").append(character.getShortDescription()).append("\n");
        }

        if (character.getLongDescription() != null) {
            sb.append("\n").append(character.getLongDescription()).append("\n");
        }

        if (character.getFranchise() != null) {
            sb.append("\nFranchise: ").append(character.getFranchise()).append("\n");
        }

        if (character.getFirstAppearance() != null) {
            sb.append("First Appearance: ").append(character.getFirstAppearance()).append("\n");
        }

        return sb.toString().trim();
    }

    /**
     * Build rich text content for movie embedding.
     * 
     * Format: Title, creation year, descriptions, rating.
     * 
     * @param movie Movie entity
     * @return Text content for embedding
     */
    private String buildMovieText(Movie movie) {
        StringBuilder sb = new StringBuilder();

        sb.append("Movie: ").append(movie.getTitle()).append("\n");

        if (movie.getCreationYear() != null) {
            sb.append("Year: ").append(movie.getCreationYear()).append("\n");
        }

        if (movie.getShortDescription() != null) {
            sb.append("\n").append(movie.getShortDescription()).append("\n");
        }

        if (movie.getLongDescription() != null) {
            sb.append("\n").append(movie.getLongDescription()).append("\n");
        }

        if (movie.getMovieRating() != null) {
            sb.append("\nRating: ").append(movie.getMovieRating()).append("\n");
        }

        return sb.toString().trim();
    }

    /**
     * Build rich text content for park embedding.
     * 
     * Format: Park name, location, resort, theme, descriptions.
     * Enhanced with additional context for better semantic search.
     * 
     * @param park Park entity
     * @return Text content for embedding
     */
    private String buildParkText(DisneyPark park) {
        StringBuilder sb = new StringBuilder();

        sb.append("Disney Park: ").append(park.getName()).append("\n");
        sb.append("Type: Theme Park\n");

        if (park.getCity() != null || park.getStateRegion() != null || park.getCountry() != null) {
            sb.append("Location: ");
            List<String> locationParts = new ArrayList<>();
            if (park.getCity() != null)
                locationParts.add(park.getCity());
            if (park.getStateRegion() != null)
                locationParts.add(park.getStateRegion());
            if (park.getCountry() != null)
                locationParts.add(park.getCountry());
            sb.append(String.join(", ", locationParts));
            sb.append("\n");
        }

        if (park.getResort() != null) {
            sb.append("Resort: ").append(park.getResort()).append("\n");
        }

        if (park.getParkType() != null) {
            sb.append("Park Type: ").append(park.getParkType()).append("\n");
        }

        if (park.getTheme() != null) {
            sb.append("Theme: ").append(park.getTheme()).append("\n");
        }

        if (park.getOpeningDate() != null) {
            sb.append("Opened: ").append(park.getOpeningDate().getYear()).append("\n");
        }

        if (park.getShortDescription() != null) {
            sb.append("\n").append(park.getShortDescription()).append("\n");
        }

        if (park.getLongDescription() != null) {
            sb.append("\n").append(park.getLongDescription()).append("\n");
        }

        return sb.toString().trim();
    }

    /**
     * Result object for batch embedding generation.
     */
    public static class EmbeddingGenerationResult {
        public int charactersProcessed = 0;
        public int moviesProcessed = 0;
        public int parksProcessed = 0;
        public int totalProcessed = 0;
    }
}
