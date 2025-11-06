import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { getImageUrl } from "../../config/assets";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import { HeroCard, type HeroSlide } from "./HeroCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Start empty; we fetch items from the backend and avoid hard-coded CDN fallbacks.
const INITIAL_SLIDES: HeroSlide[] = [];

export const HeroCarousel = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_SLIDES);
  const [loading, setLoading] = useState<boolean>(true);

  // Update background image when slide changes
  const handleSlideChange = (swiper: SwiperType) => {
    const heroBackground = document.querySelector(
      ".hero-background-images"
    ) as HTMLElement;

    if (!loading && heroBackground && slides.length > 0) {
      // Use realIndex instead of activeIndex to handle loop mode correctly
      // realIndex gives the actual slide index, while activeIndex can be a cloned slide
      const currentIndex = swiper.realIndex;

      // Fade out
      heroBackground.style.opacity = "0";

      // Change image and fade in
      setTimeout(() => {
        heroBackground.style.backgroundImage = `url(${slides[currentIndex].backgroundImage})`;
        heroBackground.style.opacity = "1";
      }, 300);
    }
  };

  // Fetch carousel items from backend
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true; // Track if component is still mounted

    async function fetchCarousel() {
      try {
        // Use configured API URL to work in both development and production environments
        const res = await fetch(
          getApiUrl(`${API_ENDPOINTS.CAROUSELS}?location=homepage`),
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch carousel");
        const data = await res.json();

        // Check if component unmounted during fetch
        if (!isMounted) return;

        if (Array.isArray(data) && data.length > 0) {
          const mapped: HeroSlide[] = data.map((item: any) => {
            // Helper to extract filename from legacy path and use getImageUrl
            const resolveImageUrl = (path: string | undefined): string => {
              if (!path) return "";

              // Check if backend returned a legacy path like "/movies/filename.jpg"
              const moviesMatch = path.match(/^\/movies\/(.+)$/);
              if (moviesMatch) {
                return getImageUrl("movies", moviesMatch[1]);
              }

              const charactersMatch = path.match(/^\/characters\/(.+)$/);
              if (charactersMatch) {
                return getImageUrl("characters", charactersMatch[1]);
              }

              // If it's already a full URL or doesn't match pattern, return as-is
              return path;
            };

            return {
              id: String(
                item.movieId ||
                  item.movie_id ||
                  item.carouselId ||
                  item.carousel_id
              ),
              title: item.title || item.name || "",
              description:
                item.shortDescription || item.short_description || "",
              // Prefer backend-resolved backgroundImage, but convert legacy paths to use getImageUrl
              backgroundImage:
                resolveImageUrl(
                  item.backgroundImage || item.background_image
                ) ||
                (item.image2
                  ? getImageUrl("movies", item.image2)
                  : item.image1
                  ? getImageUrl("movies", item.image1)
                  : ""),
              buttonText: "View Details",
            };
          });

          // Start background image preloading without blocking (progressive loading)
          const images = mapped.map((s) => s.backgroundImage).filter(Boolean);
          images.forEach((src) => {
            const img = new Image();
            img.src = src as string;
            // Images load in background, no blocking
          });

          // Show carousel content immediately, images will load progressively
          if (isMounted) {
            setSlides(mapped);
            setLoading(false);
            // eslint-disable-next-line no-console
            console.info(`Loaded ${mapped.length} carousel slides`);
          }
        } else if (isMounted) {
          // No slides returned, hide loading spinner
          setLoading(false);
        }
      } catch (e) {
        // Only log and update state if component is still mounted
        if (isMounted) {
          // Ignore AbortError - it's expected during cleanup
          if (e instanceof Error && e.name === "AbortError") {
            // eslint-disable-next-line no-console
            console.log("Carousel fetch aborted (component unmounted)");
          } else {
            // keep mockSlides on error, but surface the error to console for debugging
            // so developers can see why the API fetch failed (CORS/proxy/backend down etc.)
            // eslint-disable-next-line no-console
            console.error("Failed to fetch carousel items:", e);
          }

          // Critical: Set loading to false even on error to hide spinner
          // This prevents infinite spinner when using remote Azure images that take longer to load
          setLoading(false);
        }
      }
    }
    fetchCarousel();

    return () => {
      isMounted = false; // Mark component as unmounted
      controller.abort(); // Abort fetch if still pending
    };
  }, []);

  if (loading) {
    return (
      <div className="hero-carousel">
        <div className="hero-carousel__container">
          <div className="hero-slide hero-slide--skeleton">
            {/* Left Column - Content Skeleton */}
            <div className="hero-slide__content">
              <div className="skeleton skeleton--title"></div>
              <div className="skeleton skeleton--description"></div>
              <div className="skeleton skeleton--description skeleton--description-short"></div>
              <div className="skeleton skeleton--button"></div>
            </div>

            {/* Right Column - Empty for now */}
            <div className="hero-slide__media">
              {/* This will be populated later */}
            </div>
          </div>

          {/* Skeleton Navigation Controls */}
          <div className="hero-carousel__nav hero-carousel__nav--prev skeleton skeleton--nav"></div>
          <div className="hero-carousel__nav hero-carousel__nav--next skeleton skeleton--nav"></div>

          {/* Skeleton Dots */}
          <div className="hero-carousel__dots">
            <div className="skeleton skeleton--dot"></div>
            <div className="skeleton skeleton--dot"></div>
            <div className="skeleton skeleton--dot"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__container">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          navigation={{
            prevEl: ".hero-carousel__nav--prev",
            nextEl: ".hero-carousel__nav--next",
          }}
          pagination={{
            el: ".hero-carousel__dots",
            clickable: true,
            bulletClass: "hero-carousel__dot",
            bulletActiveClass: "active",
          }}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
          }}
          loop={slides.length > 1}
          onSlideChange={handleSlideChange}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <HeroCard slide={slide} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Controls */}
        <button
          className="hero-carousel__nav hero-carousel__nav--prev"
          aria-label="Previous slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          className="hero-carousel__nav hero-carousel__nav--next"
          aria-label="Next slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Custom Pagination Dots */}
        <div className="hero-carousel__dots"></div>
      </div>
    </div>
  );
};
