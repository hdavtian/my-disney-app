package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.model.DisneyParkAttraction;
import com.harmadavtian.disneyapp.repository.DisneyParkAttractionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for Disney Park Attractions business logic.
 * Provides methods for retrieving attractions by various criteria.
 * 
 * @author Harvey Harmadavtian
 */
@Service
public class DisneyParkAttractionService {

    private final DisneyParkAttractionRepository disneyParkAttractionRepository;

    public DisneyParkAttractionService(DisneyParkAttractionRepository disneyParkAttractionRepository) {
        this.disneyParkAttractionRepository = disneyParkAttractionRepository;
    }

    /**
     * Retrieves all Disney park attractions.
     * 
     * @return List of all attractions
     */
    public List<DisneyParkAttraction> getAllAttractions() {
        return disneyParkAttractionRepository.findAll();
    }

    /**
     * Retrieves a specific attraction by its URL ID.
     * 
     * @param urlId The unique URL identifier for the attraction
     * @return Optional containing the attraction if found
     */
    public Optional<DisneyParkAttraction> getAttractionByUrlId(String urlId) {
        return disneyParkAttractionRepository.findByUrlId(urlId);
    }

    /**
     * Retrieves all attractions in a specific park.
     * 
     * @param parkUrlId The URL ID of the park
     * @return List of attractions in that park
     */
    public List<DisneyParkAttraction> getAttractionsByPark(String parkUrlId) {
        return disneyParkAttractionRepository.findByParkUrlId(parkUrlId);
    }

    /**
     * Retrieves only operational attractions in a specific park.
     * 
     * @param parkUrlId The URL ID of the park
     * @return List of operational attractions in that park
     */
    public List<DisneyParkAttraction> getOperationalAttractionsByPark(String parkUrlId) {
        return disneyParkAttractionRepository.findByParkUrlIdAndIsOperational(parkUrlId, true);
    }

    /**
     * Retrieves all attractions of a specific type.
     * 
     * @param attractionType The type of attraction (e.g., "ride", "show")
     * @return List of attractions of that type
     */
    public List<DisneyParkAttraction> getAttractionsByType(String attractionType) {
        return disneyParkAttractionRepository.findByAttractionType(attractionType);
    }

    /**
     * Retrieves all attractions with a specific thrill level.
     * 
     * @param thrillLevel The thrill level (e.g., "mild", "moderate", "high")
     * @return List of attractions with that thrill level
     */
    public List<DisneyParkAttraction> getAttractionsByThrillLevel(String thrillLevel) {
        return disneyParkAttractionRepository.findByThrillLevel(thrillLevel);
    }

    /**
     * Retrieves all operational attractions.
     * 
     * @return List of operational attractions
     */
    public List<DisneyParkAttraction> getOperationalAttractions() {
        return disneyParkAttractionRepository.findByIsOperational(true);
    }
}
