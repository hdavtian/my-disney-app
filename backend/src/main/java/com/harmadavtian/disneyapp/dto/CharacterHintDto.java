package com.harmadavtian.disneyapp.dto;

import com.harmadavtian.disneyapp.model.HintType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Character Hints.
 * Used to transfer hint data between API layers without exposing internal
 * entity structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A hint for identifying a Disney character")
public class CharacterHintDto {

    @Schema(description = "Unique identifier of the hint", example = "1")
    private Long id;

    @Schema(description = "URL identifier of the character", example = "aladdin")
    private String characterUrlId;

    @Schema(description = "The hint text content", example = "He is a 'diamond in the rough'.")
    private String content;

    @Schema(description = "Difficulty level (1=Easy, 5=Expert)", example = "1", minimum = "1", maximum = "5")
    private Integer difficulty;

    @Schema(description = "The type/category of this hint", example = "BIO")
    private HintType hintType;
}
