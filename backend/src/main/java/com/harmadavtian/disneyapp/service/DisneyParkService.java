package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.model.DisneyPark;
import com.harmadavtian.disneyapp.repository.DisneyParkRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for Disney Parks business logic.
 * Provides methods for retrieving parks by various criteria.
 * 
 * @author Harvey Harmadavtian
 */
@Service
public class DisneyParkService {

    private final DisneyParkRepository disneyParkRepository;

    public DisneyParkService(DisneyParkRepository disneyParkRepository) {
        this.disneyParkRepository = disneyParkRepository;
    }

    /**
     * Retrieves all Disney parks.
     * 
     * @return List of all parks
     */
    public List<DisneyPark> getAllParks() {
        return disneyParkRepository.findAll();
    }

    /**
     * Retrieves a specific park by its URL ID.
     * 
     * @param urlId The unique URL identifier for the park
     * @return Optional containing the park if found
     */
    public Optional<DisneyPark> getParkByUrlId(String urlId) {
        return disneyParkRepository.findByUrlId(urlId);
    }

    /**
     * Retrieves all parks in a specific country.
     * 
     * @param country The country name
     * @return List of parks in that country
     */
    public List<DisneyPark> getParksByCountry(String country) {
        return disneyParkRepository.findByCountry(country);
    }

    /**
     * Retrieves all parks in a specific resort.
     * 
     * @param resort The resort name
     * @return List of parks in that resort
     */
    public List<DisneyPark> getParksByResort(String resort) {
        return disneyParkRepository.findByResort(resort);
    }

    /**
     * Retrieves all parks that have a castle.
     * 
     * @return List of castle parks
     */
    public List<DisneyPark> getCastleParks() {
        return disneyParkRepository.findByIsCastlePark(true);
    }
}
