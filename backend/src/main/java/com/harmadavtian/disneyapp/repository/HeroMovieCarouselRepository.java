package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.HeroMovieCarousel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeroMovieCarouselRepository extends JpaRepository<HeroMovieCarousel, Long> {
    List<HeroMovieCarousel> findByLocationAndPublishedOrderBySortOrder(String location, Boolean published);
}
