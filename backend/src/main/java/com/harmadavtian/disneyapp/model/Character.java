package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "characters")
@Getter
@Setter
@NoArgsConstructor
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_id")
    private String urlId;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Column(name = "character_creation_year")
    private Integer characterCreationYear;

    @Column(name = "first_appearance")
    private String firstAppearance;

    private String franchise;

    private String category;

    @Column(name = "character_type")
    private String characterType;

    private String species;

    @Column(columnDefinition = "TEXT")
    private String relationships;

    @Column(name = "voice_actors", columnDefinition = "TEXT")
    private String voiceActors;

    @Column(name = "profile_image_1", length = 500)
    private String profileImage1;

    @Column(name = "background_image_1", length = 500)
    private String backgroundImage1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "characters")
    @JsonIgnore
    private Set<Movie> movies = new HashSet<>();
}
