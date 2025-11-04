package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.repository.CharacterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharacterService {

    private final CharacterRepository characterRepository;

    public CharacterService(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    public Character getCharacterById(Long id) {
        return characterRepository.findById(id).orElse(null);
    }

    /**
     * Get all character IDs for quiz initialization.
     * More efficient than loading full character objects when only IDs are needed.
     * 
     * @return List of all character IDs
     */
    public List<Long> getAllCharacterIds() {
        return characterRepository.findAllIds();
    }

    /**
     * Get a specified number of random character IDs excluding the specified ID.
     * Used for generating wrong answers in the character quiz game and other
     * features.
     * 
     * @param excludeId The character ID to exclude from the random selection
     * @param count     The number of random IDs to return
     * @return List of random character IDs (excluding the specified ID)
     */
    public List<Long> getRandomCharacterIdsExcluding(Long excludeId, int count) {
        return characterRepository.findRandomIdsExcluding(excludeId, count);
    }
}