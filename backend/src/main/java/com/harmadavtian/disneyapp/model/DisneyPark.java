package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a Disney theme park.
 * Contains information about 12 Disney parks worldwide including location,
 * opening date, size, and descriptive content.
 */
@Entity
@Table(name = "disney_parks")
@Getter
@Setter
@NoArgsConstructor
public class DisneyPark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_id", unique = true, nullable = false)
    @JsonProperty("url_id")
    private String urlId;

    @Column(nullable = false)
    private String name;

    private String resort;

    private String city;

    @Column(name = "state_region")
    @JsonProperty("state_region")
    private String stateRegion;

    @Column(nullable = false)
    private String country;

    @Column(name = "opening_date")
    @JsonProperty("opening_date")
    private LocalDate openingDate;

    @Column(name = "park_type")
    @JsonProperty("park_type")
    private String parkType;

    @Column(name = "is_castle_park")
    @JsonProperty("is_castle_park")
    private Boolean isCastlePark;

    @Column(name = "area_acres")
    @JsonProperty("area_acres")
    private Integer areaAcres;

    @Column(columnDefinition = "TEXT")
    private String theme;

    @Column(name = "short_description", columnDefinition = "TEXT")
    @JsonProperty("short_description")
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    @JsonProperty("long_description")
    private String longDescription;

    @Column(name = "official_website", length = 500)
    @JsonProperty("official_website")
    private String officialWebsite;

    @Column(name = "image_1", length = 500)
    @JsonProperty("image_1")
    private String image1;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "park", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DisneyParkAttraction> attractions = new ArrayList<>();

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
