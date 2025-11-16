package com.harmadavtian.disneyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO for movie summary data when included in character responses.
 * Prevents circular references in JSON serialization.
 */
@Schema(description = "Summary information for a Disney movie")
public class MovieSummaryDto {

    @Schema(description = "Unique identifier of the movie", example = "1")
    private Long id;

    @Schema(description = "URL-friendly identifier", example = "snow_white_and_the_seven_dwarfs")
    private String urlId;

    @Schema(description = "Movie title", example = "Snow White and the Seven Dwarfs")
    private String title;

    @Schema(description = "Brief description of the movie")
    private String shortDescription;

    @Schema(description = "Year the movie was released", example = "1937")
    private Integer creationYear;

    @Schema(description = "Movie rating", example = "G")
    private String movieRating;

    @Schema(description = "Primary movie image URL")
    private String image1;

    public MovieSummaryDto() {
    }

    public MovieSummaryDto(Long id, String urlId, String title, String shortDescription,
            Integer creationYear, String movieRating, String image1) {
        this.id = id;
        this.urlId = urlId;
        this.title = title;
        this.shortDescription = shortDescription;
        this.creationYear = creationYear;
        this.movieRating = movieRating;
        this.image1 = image1;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public Integer getCreationYear() {
        return creationYear;
    }

    public void setCreationYear(Integer creationYear) {
        this.creationYear = creationYear;
    }

    public String getMovieRating() {
        return movieRating;
    }

    public void setMovieRating(String movieRating) {
        this.movieRating = movieRating;
    }

    public String getImage1() {
        return image1;
    }

    public void setImage1(String image1) {
        this.image1 = image1;
    }
}
