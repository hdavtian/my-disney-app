package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO for character summary data when included in movie responses.
 * Prevents circular references in JSON serialization.
 */
@Schema(description = "Summary information for a Disney character")
public class CharacterSummaryDto {

    @Schema(description = "Unique identifier of the character", example = "1")
    private Long id;

    @Schema(description = "URL-friendly identifier", example = "snow_white")
    private String urlId;

    @Schema(description = "Character name", example = "Snow White")
    private String name;

    @Schema(description = "Brief description of the character")
    private String shortDescription;

    @Schema(description = "Character category", example = "Princess")
    private String category;

    @Schema(description = "Character type", example = "protagonist")
    private String characterType;

    @Schema(description = "Character species", example = "Human")
    private String species;

    @Schema(description = "Profile image URL")
    private String profileImage1;

    public CharacterSummaryDto() {
    }

    public CharacterSummaryDto(Long id, String urlId, String name, String shortDescription,
            String category, String characterType, String species, String profileImage1) {
        this.id = id;
        this.urlId = urlId;
        this.name = name;
        this.shortDescription = shortDescription;
        this.category = category;
        this.characterType = characterType;
        this.species = species;
        this.profileImage1 = profileImage1;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrlId() {
        return urlId;
    }

    public void setUrlId(String urlId) {
        this.urlId = urlId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCharacterType() {
        return characterType;
    }

    public void setCharacterType(String characterType) {
        this.characterType = characterType;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getProfileImage1() {
        return profileImage1;
    }

    public void setProfileImage1(String profileImage1) {
        this.profileImage1 = profileImage1;
    }
}
