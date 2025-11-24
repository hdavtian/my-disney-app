package com.harmadavtian.disneyapp.dto.search;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParkSearchResultDto extends DisneySearchResultDto {
    private String parkUrlId;
    private String parkName;
    private String attractionType;
}
