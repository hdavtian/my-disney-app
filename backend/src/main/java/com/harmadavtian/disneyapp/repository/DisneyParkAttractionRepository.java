package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.DisneyParkAttraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DisneyParkAttraction entities.
 * Provides CRUD operations and custom query methods for park attractions.
 */
@Repository
public interface DisneyParkAttractionRepository extends JpaRepository<DisneyParkAttraction, Long> {

    /**
     * Find an attraction by its URL-friendly identifier.
     * 
     * @param urlId The URL identifier (e.g., "space-mountain-anaheim")
     * @return Optional containing the attraction if found
     */
    Optional<DisneyParkAttraction> findByUrlId(String urlId);

    /**
     * Find all attractions for a specific park.
     * 
     * @param parkUrlId The park's URL identifier (e.g., "magic-kingdom")
     * @return List of attractions at the specified park
     */
    List<DisneyParkAttraction> findByParkUrlId(String parkUrlId);

    /**
     * Find all attractions of a specific type.
     * 
     * @param attractionType The type of attraction (e.g., "Roller Coaster", "Dark
     *                       Ride")
     * @return List of attractions matching the type
     */
    List<DisneyParkAttraction> findByAttractionType(String attractionType);

    /**
     * Find all attractions with a specific thrill level.
     * 
     * @param thrillLevel The thrill level (e.g., "Intense", "Moderate", "Mild")
     * @return List of attractions matching the thrill level
     */
    List<DisneyParkAttraction> findByThrillLevel(String thrillLevel);

    /**
     * Find all operational or non-operational attractions.
     * 
     * @param isOperational True for operational, false for closed attractions
     * @return List of attractions matching the operational status
     */
    List<DisneyParkAttraction> findByIsOperational(Boolean isOperational);

    /**
     * Find all operational attractions for a specific park.
     * 
     * @param parkUrlId     The park's URL identifier
     * @param isOperational The operational status (typically true)
     * @return List of operational attractions at the specified park
     */
    List<DisneyParkAttraction> findByParkUrlIdAndIsOperational(String parkUrlId, Boolean isOperational);
}
