package com.harmadavtian.disneyapp.dto.search;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovieSearchResultDto extends DisneySearchResultDto {
    private Integer creationYear;
    private String movieRating;
}
