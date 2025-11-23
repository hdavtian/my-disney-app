package com.harmadavtian.disneyapp.dto.search;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class DisneySearchResultDto {

    private Long id;
    private String type;
    private String title;
    private String descriptionSnippet;
    private String imageUrl;
    private String detailPath;
    private Map<String, List<HighlightRangeDto>> highlights = new LinkedHashMap<>();
}
