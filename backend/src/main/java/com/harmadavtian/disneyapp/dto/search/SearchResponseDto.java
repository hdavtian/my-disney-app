package com.harmadavtian.disneyapp.dto.search;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
public class SearchResponseDto {

    private final Map<String, SearchCategoryResultDto> categories = new LinkedHashMap<>();

    @JsonAnyGetter
    public Map<String, SearchCategoryResultDto> asJson() {
        return categories;
    }
}
