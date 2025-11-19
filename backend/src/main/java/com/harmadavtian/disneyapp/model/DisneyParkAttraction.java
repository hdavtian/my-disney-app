package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an attraction at a Disney theme park.
 * Includes rides, shows, parades, and other experiences.
 * Each attraction belongs to one park via the park_url_id foreign key.
 */
@Entity
@Table(name = "disney_parks_attractions")
@Getter
@Setter
@NoArgsConstructor
public class DisneyParkAttraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_id", unique = true, nullable = false)
    @JsonProperty("url_id")
    private String urlId;

    @Column(nullable = false)
    private String name;

    @Column(name = "park_url_id", nullable = false)
    @JsonProperty("park_url_id")
    private String parkUrlId;

    @Column(name = "land_area")
    @JsonProperty("land_area")
    private String landArea;

    @Column(name = "attraction_type")
    @JsonProperty("attraction_type")
    private String attractionType;

    @Column(name = "opening_date")
    @JsonProperty("opening_date")
    private LocalDate openingDate;

    @Column(name = "thrill_level")
    @JsonProperty("thrill_level")
    private String thrillLevel;

    @Column(columnDefinition = "TEXT")
    private String theme;

    @Column(name = "short_description", columnDefinition = "TEXT")
    @JsonProperty("short_description")
    private String shortDescription;

    @Column(name = "is_operational")
    @JsonProperty("is_operational")
    private Boolean isOperational;

    @Column(name = "duration_minutes")
    @JsonProperty("duration_minutes")
    private Integer durationMinutes;

    @Column(name = "height_requirement_inches")
    @JsonProperty("height_requirement_inches")
    private Integer heightRequirementInches;

    @Column(name = "image_1", length = 500)
    @JsonProperty("image_1")
    private String image1;

    @Column(name = "image_2", length = 500)
    @JsonProperty("image_2")
    private String image2;

    @Column(name = "image_3", length = 500)
    @JsonProperty("image_3")
    private String image3;

    @Column(name = "image_4", length = 500)
    @JsonProperty("image_4")
    private String image4;

    @Column(name = "image_5", length = 500)
    @JsonProperty("image_5")
    private String image5;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "park_url_id", referencedColumnName = "url_id", insertable = false, updatable = false)
    @JsonIgnore
    private DisneyPark park;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
