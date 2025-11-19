package com.harmadavtian.disneyapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO returned by the carousel API. Contains minimal movie data for rendering
 * the hero carousel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarouselItemDto {
    private Long carouselId;
    private Integer sortOrder;
    private Long movieId;
    private String title;
    private String shortDescription;
    private String image1;
    private String image2;
    /**
     * Resolved background image URL (prefers image2, falls back to image1). If
     * empty, frontend may use a placeholder.
     */
    private String backgroundImage;
    private String urlId;
}
