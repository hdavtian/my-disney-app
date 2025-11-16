package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.DisneyPark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DisneyPark entities.
 * Provides CRUD operations and custom query methods for Disney parks.
 */
@Repository
public interface DisneyParkRepository extends JpaRepository<DisneyPark, Long> {

    /**
     * Find a park by its URL-friendly identifier.
     * 
     * @param urlId The URL identifier (e.g., "magic-kingdom")
     * @return Optional containing the park if found
     */
    Optional<DisneyPark> findByUrlId(String urlId);

    /**
     * Find all parks in a specific country.
     * 
     * @param country The country name (e.g., "United States", "Japan")
     * @return List of parks in the specified country
     */
    List<DisneyPark> findByCountry(String country);

    /**
     * Find all parks belonging to a specific resort.
     * 
     * @param resort The resort name (e.g., "Walt Disney World Resort")
     * @return List of parks in the specified resort
     */
    List<DisneyPark> findByResort(String resort);

    /**
     * Find all castle parks or non-castle parks.
     * 
     * @param isCastlePark True for castle parks, false for non-castle parks
     * @return List of parks matching the castle park status
     */
    List<DisneyPark> findByIsCastlePark(Boolean isCastlePark);
}
