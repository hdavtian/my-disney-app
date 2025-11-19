package com.harmadavtian.disneyapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean published;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "hidden_tags")
    private String hiddenTags;

    @Column(name = "movie_rating")
    private String movieRating;

    @Column(name = "has_link")
    private Boolean hasLink;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "url_id")
    private String urlId;

    @Column(nullable = false)
    private String title;

    @Column(name = "creation_year")
    private Integer creationYear;

    @Column(name = "image_1")
    @JsonProperty("image_1")
    private String image1;

    @Column(name = "image_2")
    @JsonProperty("image_2")
    private String image2;

    @ManyToMany
    @JoinTable(name = "movie_characters", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "character_id"))
    @JsonIgnore
    private Set<Character> characters = new HashSet<>();
}
