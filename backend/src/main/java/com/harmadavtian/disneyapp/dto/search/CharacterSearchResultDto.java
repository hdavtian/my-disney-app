package com.harmadavtian.disneyapp.dto.search;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterSearchResultDto extends DisneySearchResultDto {
    private String firstAppearance;
    private String franchise;
}
