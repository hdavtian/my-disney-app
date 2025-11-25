package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.CharacterHint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for CharacterHint entities.
 * Provides database access methods for character hints.
 */
@Repository
public interface CharacterHintRepository extends JpaRepository<CharacterHint, Long> {

    /**
     * Find all hints for a specific character by URL ID.
     * 
     * @param characterUrlId The URL identifier of the character
     * @return List of all hints for the character
     */
    List<CharacterHint> findByCharacterUrlId(String characterUrlId);

    /**
     * Find a limited number of hints for a specific character by URL ID.
     * Results are ordered by difficulty (easiest first), then by ID.
     * 
     * @param characterUrlId The URL identifier of the character
     * @param pageable       Pagination parameters (use PageRequest.of(0, count))
     * @return List of hints limited by the pageable parameter
     */
    @Query("SELECT ch FROM CharacterHint ch WHERE ch.characterUrlId = :characterUrlId ORDER BY ch.difficulty ASC, ch.id ASC")
    List<CharacterHint> findTopNByCharacterUrlId(@Param("characterUrlId") String characterUrlId, Pageable pageable);

    /**
     * Count hints for a specific character.
     * 
     * @param characterUrlId The URL identifier of the character
     * @return The number of hints for the character
     */
    long countByCharacterUrlId(String characterUrlId);

    /**
     * Find a random hint for a character filtered by difficulty level.
     * Used for guessing games to provide progressive difficulty hints.
     * 
     * @param characterUrlId The URL identifier of the character
     * @param difficulty     The difficulty level (1=easy, 2=medium, 3=hard)
     * @return A random hint at the specified difficulty, or null if none found
     */
    @Query(value = "SELECT * FROM character_hints WHERE character_url_id = :characterUrlId AND difficulty = :difficulty ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    CharacterHint findRandomByCharacterUrlIdAndDifficulty(@Param("characterUrlId") String characterUrlId,
            @Param("difficulty") int difficulty);
}
