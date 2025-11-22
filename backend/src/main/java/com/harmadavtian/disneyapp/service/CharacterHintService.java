package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.CharacterHintDto;
import com.harmadavtian.disneyapp.model.CharacterHint;
import com.harmadavtian.disneyapp.repository.CharacterHintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing character hints.
 * Provides business logic for retrieving hints for characters.
 */
@Service
public class CharacterHintService {

    private static final Logger log = LoggerFactory.getLogger(CharacterHintService.class);

    private final CharacterHintRepository characterHintRepository;

    public CharacterHintService(CharacterHintRepository characterHintRepository) {
        this.characterHintRepository = characterHintRepository;
    }

    /**
     * Get all hints for a specific character.
     * 
     * @param characterUrlId The URL identifier of the character
     * @return List of all hints for the character as DTOs
     */
    public List<CharacterHintDto> getAllHintsByCharacterUrlId(String characterUrlId) {
        log.debug("Fetching all hints for character: {}", characterUrlId);
        List<CharacterHint> hints = characterHintRepository.findByCharacterUrlId(characterUrlId);
        return hints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a limited number of hints for a specific character.
     * Hints are returned ordered by difficulty (easiest first).
     * 
     * @param characterUrlId The URL identifier of the character
     * @param count          The maximum number of hints to return
     * @return List of hints limited to the specified count
     */
    public List<CharacterHintDto> getNHintsByCharacterUrlId(String characterUrlId, int count) {
        log.debug("Fetching {} hints for character: {}", count, characterUrlId);

        if (count <= 0) {
            log.warn("Invalid count requested: {}. Returning empty list.", count);
            return List.of();
        }

        List<CharacterHint> hints = characterHintRepository.findTopNByCharacterUrlId(
                characterUrlId,
                PageRequest.of(0, count));

        return hints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get the total count of hints for a character.
     * 
     * @param characterUrlId The URL identifier of the character
     * @return The number of hints available for the character
     */
    public long getHintCount(String characterUrlId) {
        return characterHintRepository.countByCharacterUrlId(characterUrlId);
    }

    /**
     * Convert a CharacterHint entity to a DTO.
     * 
     * @param hint The entity to convert
     * @return The DTO representation
     */
    private CharacterHintDto convertToDto(CharacterHint hint) {
        return new CharacterHintDto(
                hint.getId(),
                hint.getCharacterUrlId(),
                hint.getContent(),
                hint.getDifficulty(),
                hint.getHintType());
    }
}
