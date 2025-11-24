package com.harmadavtian.disneyapp.service.search;

import com.harmadavtian.disneyapp.dto.search.HighlightRangeDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Utility methods for computing highlight ranges and snippets for search
 * results.
 */
public final class SearchHighlightingUtils {

    private static final int SNIPPET_CONTEXT = 80;
    private static final int MAX_RANGES = 5;

    private SearchHighlightingUtils() {
    }

    public static Optional<HighlightComputation> compute(String value, String normalizedQuery, boolean snippet) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        if (normalizedQuery == null || normalizedQuery.isBlank()) {
            return Optional.empty();
        }

        String lowerValue = value.toLowerCase(Locale.ROOT);
        String lowerQuery = normalizedQuery.toLowerCase(Locale.ROOT);

        int queryLength = lowerQuery.length();
        int index = lowerValue.indexOf(lowerQuery);
        if (index < 0) {
            return Optional.empty();
        }

        List<HighlightRangeDto> rawRanges = new ArrayList<>();
        while (index >= 0 && rawRanges.size() < MAX_RANGES) {
            rawRanges.add(new HighlightRangeDto(index, index + queryLength));
            index = lowerValue.indexOf(lowerQuery, index + queryLength);
        }

        int snippetStart;
        int snippetEnd;
        String rendered;
        int ellipsisOffset = 0;

        if (snippet) {
            // Calculate initial snippet boundaries around the first match
            int rawStart = Math.max(0, rawRanges.get(0).start() - SNIPPET_CONTEXT);
            int rawEnd = Math.min(value.length(), rawRanges.get(0).end() + SNIPPET_CONTEXT);

            // Expand to word boundaries to avoid cutting words
            snippetStart = findWordBoundaryStart(value, rawStart);
            snippetEnd = findWordBoundaryEnd(value, rawEnd);

            // Extract snippet
            String rawSnippet = value.substring(snippetStart, snippetEnd);

            // Trim the snippet
            String trimmedSnippet = rawSnippet.trim();

            // Handle empty snippets
            if (trimmedSnippet.isEmpty()) {
                rendered = "";
            } else {
                // Calculate how many characters were trimmed from the start
                int leadingTrimCount = rawSnippet.indexOf(trimmedSnippet.charAt(0));

                // Adjust snippetStart to point to where the actual content begins
                snippetStart += leadingTrimCount;

                // Add ellipsis if needed
                boolean addPrefix = snippetStart > 0;
                boolean addSuffix = snippetEnd < value.length();

                rendered = trimmedSnippet;

                if (addPrefix) {
                    rendered = "..." + rendered;
                    ellipsisOffset = 3;
                }
                if (addSuffix) {
                    rendered = rendered + "...";
                }
            }
        } else {
            snippetStart = 0;
            snippetEnd = value.length();
            rendered = value;
            ellipsisOffset = 0;
        }

        // Adjust highlight ranges based on snippet extraction
        List<HighlightRangeDto> adjustedRanges = new ArrayList<>();
        for (HighlightRangeDto range : rawRanges) {
            // Skip ranges outside the snippet
            if (range.start() >= snippetEnd || range.end() <= snippetStart) {
                continue;
            }
            // Calculate position in rendered snippet:
            // range.start() - snippetStart = position in trimmed snippet (0-based)
            // + ellipsisOffset = position in final rendered string (with "..." prefix)
            int start = Math.max(0, range.start() - snippetStart + ellipsisOffset);
            int end = Math.min(rendered.length(), range.end() - snippetStart + ellipsisOffset);
            adjustedRanges.add(new HighlightRangeDto(start, end));
        }

        return Optional.of(new HighlightComputation(rendered, adjustedRanges));
    }

    /**
     * Find the start of a word boundary by moving backwards from the given
     * position.
     * Stops at word boundaries (whitespace or start of string).
     */
    private static int findWordBoundaryStart(String text, int position) {
        if (position == 0) {
            return 0;
        }
        // Move back to the previous word boundary
        while (position > 0 && !Character.isWhitespace(text.charAt(position - 1))) {
            position--;
        }
        return position;
    }

    /**
     * Find the end of a word boundary by moving forwards from the given position.
     * Stops at word boundaries (whitespace or end of string).
     */
    private static int findWordBoundaryEnd(String text, int position) {
        if (position >= text.length()) {
            return text.length();
        }
        // Move forward to the next word boundary
        while (position < text.length() && !Character.isWhitespace(text.charAt(position))) {
            position++;
        }
        return position;
    }

    public record HighlightComputation(String renderedText, List<HighlightRangeDto> ranges) {
    }
}
