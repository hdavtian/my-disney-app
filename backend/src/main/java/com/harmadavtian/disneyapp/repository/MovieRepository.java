package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    /**
     * Find a movie by its URL ID.
     * URL ID is guaranteed unique by database constraint (UNIQUE in V1 migration).
     * 
     * @param urlId The URL identifier for the movie
     * @return An Optional containing the movie with the specified urlId, or empty
     *         if not found
     */
    Optional<Movie> findByUrlId(String urlId);

    /**
     * Find random movies excluding specific IDs.
     * Uses native SQL for random selection with PostgreSQL's RANDOM() function.
     * 
     * @param excludeIds List of movie IDs to exclude from results
     * @param limit      Maximum number of movies to return
     * @return List of random movies
     */
    @Query(value = "SELECT * FROM movies WHERE id NOT IN :excludeIds ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Movie> findRandomExcept(@Param("excludeIds") List<Long> excludeIds, @Param("limit") int limit);

    /**
     * Find random movies when no exclusions are needed.
     * 
     * @param limit Maximum number of movies to return
     * @return List of random movies
     */
    @Query(value = "SELECT * FROM movies ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Movie> findRandom(@Param("limit") int limit);

    /**
     * Find all movie IDs that have hints available.
     * Used in guessing games to ensure selected movies can provide hints.
     * 
     * @return List of movie IDs that have at least one hint
     */
    @Query(value = "SELECT DISTINCT m.id FROM movies m INNER JOIN movie_hints mh ON m.url_id = mh.movie_url_id ORDER BY m.id", nativeQuery = true)
    List<Long> findIdsWithHints();
}