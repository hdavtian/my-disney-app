package com.harmadavtian.disneyapp.dto;

import com.harmadavtian.disneyapp.model.HintType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Movie Hints.
 * Used to transfer hint data between API layers without exposing internal
 * entity structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A hint for identifying a Disney movie")
public class MovieHintDto {

    @Schema(description = "Unique identifier of the hint", example = "1")
    private Long id;

    @Schema(description = "URL identifier of the movie", example = "frozen")
    private String movieUrlId;

    @Schema(description = "The hint text content", example = "The main character has magical ice powers.")
    private String content;

    @Schema(description = "Difficulty level (1=Easy, 5=Expert)", example = "1", minimum = "1", maximum = "5")
    private Integer difficulty;

    @Schema(description = "The type/category of this hint", example = "PLOT")
    private HintType hintType;
}
