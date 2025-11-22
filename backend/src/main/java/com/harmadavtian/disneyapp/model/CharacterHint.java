package com.harmadavtian.disneyapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing a hint for a Disney character.
 * Hints are used in quiz games and interactive features to help users identify
 * characters.
 */
@Entity
@Table(name = "character_hints")
@Getter
@Setter
@NoArgsConstructor
public class CharacterHint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * URL identifier of the character this hint belongs to.
     * References characters.url_id (not the numeric ID).
     */
    @Column(name = "character_url_id", nullable = false)
    private String characterUrlId;

    /**
     * The actual hint text content.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Difficulty level from 1 (easiest) to 5 (hardest).
     * Lower numbers are more obvious hints.
     */
    @Column(nullable = false)
    private Integer difficulty;

    /**
     * The type/category of this hint.
     */
    @Column(name = "hint_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private HintType hintType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Automatically set timestamps before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Automatically update the updated_at timestamp.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
