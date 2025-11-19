package com.harmadavtian.disneyapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for excluding a specific character ID from random selection.
 * Used in the character quiz game to get random wrong answers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcludeCharacterRequest {
    private Long excludeId;
}
