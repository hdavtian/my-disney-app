package com.harmadavtian.disneyapp.controller;

import com.harmadavtian.disneyapp.model.CarouselItemDto;
import com.harmadavtian.disneyapp.service.HeroCarouselService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/carousels")
public class CarouselController {

    private final HeroCarouselService heroCarouselService;

    public CarouselController(HeroCarouselService heroCarouselService) {
        this.heroCarouselService = heroCarouselService;
    }

    @GetMapping
    public ResponseEntity<List<CarouselItemDto>> getCarousel(
            @RequestParam(name = "location", defaultValue = "homepage") String location) {
        List<CarouselItemDto> dtos = heroCarouselService.getCarouselByLocation(location);
        return ResponseEntity.ok(dtos);
    }
}
