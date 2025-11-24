package com.harmadavtian.disneyapp.dto.search;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Represents highlighted content for a specific field.
 * Contains the text snippet and the highlight ranges within that text.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldHighlightDto {
    /**
     * The text content for this field (may be a snippet with ellipsis for
     * descriptions).
     */
    private String text;

    /**
     * The highlight ranges within the text (start and end indices).
     */
    private List<HighlightRangeDto> ranges;
}
