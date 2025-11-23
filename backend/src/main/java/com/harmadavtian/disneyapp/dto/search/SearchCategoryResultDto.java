package com.harmadavtian.disneyapp.dto.search;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SearchCategoryResultDto {
    private long total;
    private List<DisneySearchResultDto> results = new ArrayList<>();
}
