package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

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
public class DisneyPark {

    public DisneyPark() {
    }

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

    // One-to-Many relationship with attractions
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

    public String getResort() {
        return resort;
    }

    public void setResort(String resort) {
        this.resort = resort;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStateRegion() {
        return stateRegion;
    }

    public void setStateRegion(String stateRegion) {
        this.stateRegion = stateRegion;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public LocalDate getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDate openingDate) {
        this.openingDate = openingDate;
    }

    public String getParkType() {
        return parkType;
    }

    public void setParkType(String parkType) {
        this.parkType = parkType;
    }

    public Boolean getIsCastlePark() {
        return isCastlePark;
    }

    public void setIsCastlePark(Boolean isCastlePark) {
        this.isCastlePark = isCastlePark;
    }

    public Integer getAreaAcres() {
        return areaAcres;
    }

    public void setAreaAcres(Integer areaAcres) {
        this.areaAcres = areaAcres;
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

    public String getLongDescription() {
        return longDescription;
    }

    public void setLongDescription(String longDescription) {
        this.longDescription = longDescription;
    }

    public String getOfficialWebsite() {
        return officialWebsite;
    }

    public void setOfficialWebsite(String officialWebsite) {
        this.officialWebsite = officialWebsite;
    }

    public String getImage1() {
        return image1;
    }

    public void setImage1(String image1) {
        this.image1 = image1;
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

    public List<DisneyParkAttraction> getAttractions() {
        return attractions;
    }

    public void setAttractions(List<DisneyParkAttraction> attractions) {
        this.attractions = attractions;
    }
}
