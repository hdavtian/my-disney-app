package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {

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
}