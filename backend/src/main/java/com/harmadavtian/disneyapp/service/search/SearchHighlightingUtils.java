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

        int snippetStart = snippet ? Math.max(0, rawRanges.get(0).start() - SNIPPET_CONTEXT) : 0;
        int snippetEnd = snippet ? Math.min(value.length(), rawRanges.get(0).end() + SNIPPET_CONTEXT) : value.length();

        String rendered = value.substring(snippetStart, snippetEnd).trim();
        List<HighlightRangeDto> adjustedRanges = new ArrayList<>();
        for (HighlightRangeDto range : rawRanges) {
            if (range.start() >= snippetEnd || range.end() <= snippetStart) {
                continue;
            }
            int start = Math.max(0, range.start() - snippetStart);
            int end = Math.min(rendered.length(), range.end() - snippetStart);
            adjustedRanges.add(new HighlightRangeDto(start, end));
        }

        return Optional.of(new HighlightComputation(rendered, adjustedRanges));
    }

    public record HighlightComputation(String renderedText, List<HighlightRangeDto> ranges) {
    }
}
