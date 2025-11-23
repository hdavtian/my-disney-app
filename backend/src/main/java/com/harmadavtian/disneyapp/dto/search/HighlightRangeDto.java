package com.harmadavtian.disneyapp.dto.search;

/**
 * Represents a highlighted substring within a field (start and end index,
 * inclusive of start, exclusive of end).
 */
public record HighlightRangeDto(int start, int end) {
}
