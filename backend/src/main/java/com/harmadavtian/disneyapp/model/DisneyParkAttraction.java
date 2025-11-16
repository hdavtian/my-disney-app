package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an attraction at a Disney theme park.
 * Includes rides, shows, parades, and other experiences.
 * Each attraction belongs to one park via the park_url_id foreign key.
 */
@Entity
@Table(name = "disney_parks_attractions")
public class DisneyParkAttraction {

    public DisneyParkAttraction() {
    }

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

    // Many-to-One relationship with park
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

    public String getParkUrlId() {
        return parkUrlId;
    }

    public void setParkUrlId(String parkUrlId) {
        this.parkUrlId = parkUrlId;
    }

    public String getLandArea() {
        return landArea;
    }

    public void setLandArea(String landArea) {
        this.landArea = landArea;
    }

    public String getAttractionType() {
        return attractionType;
    }

    public void setAttractionType(String attractionType) {
        this.attractionType = attractionType;
    }

    public LocalDate getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDate openingDate) {
        this.openingDate = openingDate;
    }

    public String getThrillLevel() {
        return thrillLevel;
    }

    public void setThrillLevel(String thrillLevel) {
        this.thrillLevel = thrillLevel;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public Boolean getIsOperational() {
        return isOperational;
    }

    public void setIsOperational(Boolean isOperational) {
        this.isOperational = isOperational;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getHeightRequirementInches() {
        return heightRequirementInches;
    }

    public void setHeightRequirementInches(Integer heightRequirementInches) {
        this.heightRequirementInches = heightRequirementInches;
    }

    public String getImage1() {
        return image1;
    }

    public void setImage1(String image1) {
        this.image1 = image1;
    }

    public String getImage2() {
        return image2;
    }

    public void setImage2(String image2) {
        this.image2 = image2;
    }

    public String getImage3() {
        return image3;
    }

    public void setImage3(String image3) {
        this.image3 = image3;
    }

    public String getImage4() {
        return image4;
    }

    public void setImage4(String image4) {
        this.image4 = image4;
    }

    public String getImage5() {
        return image5;
    }

    public void setImage5(String image5) {
        this.image5 = image5;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public DisneyPark getPark() {
        return park;
    }

    public void setPark(DisneyPark park) {
        this.park = park;
    }
}
