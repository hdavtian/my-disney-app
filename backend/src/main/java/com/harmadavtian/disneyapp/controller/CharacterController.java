package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.model.Character;
import com.harmadavtian.disneyapp.service.CharacterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping
    public ResponseEntity<List<Character>> getAllCharacters() {
        List<Character> characters = characterService.getAllCharacters();
        return ResponseEntity.ok(characters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Character> getCharacterById(@PathVariable Long id) {
        Character character = characterService.getCharacterById(id);
        if (character != null) {
            return ResponseEntity.ok(character);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all character IDs for quiz initialization.
     * Returns only the IDs for efficiency when full character objects aren't
     * needed.
     * 
     * @return ResponseEntity containing list of all character IDs
     */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getAllCharacterIds() {
        List<Long> characterIds = characterService.getAllCharacterIds();
        return ResponseEntity.ok(characterIds);
    }

    /**
     * Get a specified number of random character IDs excluding the specified ID.
     * Used for generating wrong answers in the character quiz game and other
     * features.
     * 
     * @param excludeId The character ID to exclude from the random selection
     * @param count     The number of random IDs to return (default: 3)
     * @return ResponseEntity containing list of random character IDs
     */
    @GetMapping("/random-except/{excludeId}")
    public ResponseEntity<List<Long>> getRandomCharactersExcept(
            @PathVariable Long excludeId,
            @RequestParam(defaultValue = "3") int count) {

        if (excludeId == null || excludeId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        if (count <= 0 || count > 50) { // Reasonable upper limit
            return ResponseEntity.badRequest().build();
        }

        List<Long> randomIds = characterService.getRandomCharacterIdsExcluding(excludeId, count);

        // Ensure we have the requested number of results
        if (randomIds.size() < count) {
            // This shouldn't happen with 180 characters, but handle gracefully
            return ResponseEntity.unprocessableEntity().build();
        }

        return ResponseEntity.ok(randomIds);
    }
}