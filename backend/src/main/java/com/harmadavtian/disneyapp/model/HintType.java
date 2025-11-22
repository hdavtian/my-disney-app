package com.harmadavtian.disneyapp.model;

/**
 * Enumeration of hint types for character and movie hints.
 * Defines the category of information provided by a hint.
 */
public enum HintType {
    /**
     * Biographical information about the character/movie
     */
    BIO,

    /**
     * Information about relationships with other characters
     */
    RELATIONSHIP,

    /**
     * Plot-related information
     */
    PLOT,

    /**
     * Famous quotes or dialogue
     */
    QUOTE,

    /**
     * Trivia and behind-the-scenes information
     */
    TRIVIA,

    /**
     * Physical appearance details
     */
    APPEARANCE
}
