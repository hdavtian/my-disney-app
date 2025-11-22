package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.MovieHint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for MovieHint entities.
 * Provides database access methods for movie hints.
 */
@Repository
public interface MovieHintRepository extends JpaRepository<MovieHint, Long> {

    /**
     * Find all hints for a specific movie by URL ID.
     * 
     * @param movieUrlId The URL identifier of the movie
     * @return List of all hints for the movie
     */
    List<MovieHint> findByMovieUrlId(String movieUrlId);

    /**
     * Find a limited number of hints for a specific movie by URL ID.
     * Results are ordered by difficulty (easiest first), then by ID.
     * 
     * @param movieUrlId The URL identifier of the movie
     * @param pageable   Pagination parameters (use PageRequest.of(0, count))
     * @return List of hints limited by the pageable parameter
     */
    @Query("SELECT mh FROM MovieHint mh WHERE mh.movieUrlId = :movieUrlId ORDER BY mh.difficulty ASC, mh.id ASC")
    List<MovieHint> findTopNByMovieUrlId(@Param("movieUrlId") String movieUrlId, Pageable pageable);

    /**
     * Count hints for a specific movie.
     * 
     * @param movieUrlId The URL identifier of the movie
     * @return The number of hints for the movie
     */
    long countByMovieUrlId(String movieUrlId);
}
