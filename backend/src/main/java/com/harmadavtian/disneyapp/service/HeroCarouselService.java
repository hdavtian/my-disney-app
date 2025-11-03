package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.model.CarouselItemDto;
import com.harmadavtian.disneyapp.model.HeroMovieCarousel;
import com.harmadavtian.disneyapp.repository.HeroMovieCarouselRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HeroCarouselService {

    private final HeroMovieCarouselRepository heroMovieCarouselRepository;

    public HeroCarouselService(HeroMovieCarouselRepository heroMovieCarouselRepository) {
        this.heroMovieCarouselRepository = heroMovieCarouselRepository;
    }

    public List<CarouselItemDto> getCarouselByLocation(String location) {
        List<HeroMovieCarousel> rows = heroMovieCarouselRepository.findByLocationAndPublishedOrderBySortOrder(location,
                Boolean.TRUE);
        return rows.stream().map(r -> {
            CarouselItemDto dto = new CarouselItemDto();
            dto.setCarouselId(r.getId());
            dto.setSortOrder(r.getSortOrder());
            if (r.getMovie() != null) {
                dto.setMovieId(r.getMovie().getId());
                dto.setTitle(r.getMovie().getTitle());
                dto.setShortDescription(r.getMovie().getShortDescription());
                dto.setImage1(r.getMovie().getImage1());
                dto.setImage2(r.getMovie().getImage2());
                // Resolve a background image URL for frontend convenience. Prefer image2
                // (larger/background), fallback to image1.
                if (r.getMovie().getImage2() != null && !r.getMovie().getImage2().isEmpty()) {
                    dto.setBackgroundImage("/movies/" + r.getMovie().getImage2());
                } else if (r.getMovie().getImage1() != null && !r.getMovie().getImage1().isEmpty()) {
                    dto.setBackgroundImage("/movies/" + r.getMovie().getImage1());
                }
                dto.setUrlId(r.getMovie().getUrlId());
            }
            return dto;
        }).collect(Collectors.toList());
    }
}
