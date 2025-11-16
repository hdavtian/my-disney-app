package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}