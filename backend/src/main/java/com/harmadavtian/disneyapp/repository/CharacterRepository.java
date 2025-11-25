package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {

    /**
     * Find a character by its URL ID.
     * URL ID is guaranteed unique by database constraint (added in V3 migration).
     * 
     * @param urlId The URL identifier for the character
     * @return An Optional containing the character with the specified urlId, or
     *         empty if not found
     */
    Optional<Character> findByUrlId(String urlId);

    /**
     * Get only the IDs of all characters for quiz initialization.
     * This is more efficient than loading full character objects.
     */
    @Query("SELECT c.id FROM Character c ORDER BY c.id")
    List<Long> findAllIds();

    /**
     * Get a specified number of random character IDs excluding the specified ID.
     * Used for generating wrong answers in the quiz game and other features.
     */
    @Query(value = "SELECT id FROM characters WHERE id != :excludeId ORDER BY RANDOM() LIMIT :count", nativeQuery = true)
    List<Long> findRandomIdsExcluding(@Param("excludeId") Long excludeId, @Param("count") int count);

    /**
     * Find random characters excluding specific IDs.
     * Uses native SQL for random selection with PostgreSQL's RANDOM() function.
     * 
     * @param excludeIds List of character IDs to exclude from results
     * @param limit      Maximum number of characters to return
     * @return List of random characters
     */
    @Query(value = "SELECT * FROM characters WHERE id NOT IN :excludeIds ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Character> findRandomExcept(@Param("excludeIds") List<Long> excludeIds, @Param("limit") int limit);

    /**
     * Find random characters when no exclusions are needed.
     * 
     * @param limit Maximum number of characters to return
     * @return List of random characters
     */
    @Query(value = "SELECT * FROM characters ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Character> findRandom(@Param("limit") int limit);

    /**
     * Find all character IDs that have hints available.
     * Used in guessing games to ensure selected characters can provide hints.
     * 
     * @return List of character IDs that have at least one hint
     */
    @Query(value = "SELECT DISTINCT c.id FROM characters c INNER JOIN character_hints ch ON c.url_id = ch.character_url_id ORDER BY c.id", nativeQuery = true)
    List<Long> findIdsWithHints();
}