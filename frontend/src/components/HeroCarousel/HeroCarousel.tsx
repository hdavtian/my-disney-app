import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../config/assets";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  buttonText: string;
}

// Start empty; we fetch items from the backend and avoid hard-coded CDN fallbacks.
const INITIAL_SLIDES: HeroSlide[] = [];
const SLIDE_INTERVAL_MS = 8000; // 8 seconds between slides

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_SLIDES);
  const [loading, setLoading] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    if (slides.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) =>
        slides.length > 0 ? (prev + 1) % slides.length : 0
      );
    }, SLIDE_INTERVAL_MS);
  }

  useEffect(() => {
    // Start the auto-advance when loading is finished. Restart whenever slides length changes.
    if (!loading) {
      startTimer();
    }
    return () => clearTimer();
  }, [slides.length, loading]);

  useEffect(() => {
    // Update background image with fade effect
    const heroBackground = document.querySelector(
      ".hero-background-images"
    ) as HTMLElement;
    if (!loading && heroBackground && slides.length > 0) {
      heroBackground.style.opacity = "0.7";

      setTimeout(() => {
        heroBackground.style.backgroundImage = `url(${slides[currentSlide].backgroundImage})`;
        heroBackground.style.opacity = "1";
      }, 300);
    }
  }, [currentSlide, slides]);

  // Fetch carousel items from backend
  useEffect(() => {
    const controller = new AbortController();
    async function fetchCarousel() {
      try {
        // Use relative API path; Vite dev server proxies /api to backend (configured in vite.config.ts)
        const res = await fetch(`/api/carousels?location=homepage`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch carousel");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: HeroSlide[] = data.map((item: any) => ({
            id: String(
              item.movieId ||
                item.movie_id ||
                item.carouselId ||
                item.carousel_id
            ),
            title: item.title || item.name || "",
            description: item.shortDescription || item.short_description || "",
            // Prefer backend-resolved backgroundImage (uses image2 when available). Support both camelCase and snake_case keys.
            backgroundImage:
              item.backgroundImage ||
              item.background_image ||
              (item.image2
                ? getImageUrl("movies", item.image2)
                : item.image1
                ? getImageUrl("movies", item.image1)
                : ""),
            buttonText: "View Details",
          }));

          // Preload images (resolve quickly on error to avoid blocking)
          const images = mapped.map((s) => s.backgroundImage).filter(Boolean);
          await Promise.all(
            images.map(
              (src) =>
                new Promise((resolve) => {
                  const img = new Image();
                  img.onload = () => resolve(true);
                  img.onerror = () => resolve(true);
                  img.src = src as string;
                })
            )
          );

          setSlides(mapped);
          setCurrentSlide(0);
          setLoading(false);
          // eslint-disable-next-line no-console
          console.info(`Loaded ${mapped.length} carousel slides`);
        }
      } catch (e) {
        // keep mockSlides on error, but surface the error to console for debugging
        // so developers can see why the API fetch failed (CORS/proxy/backend down etc.)
        // eslint-disable-next-line no-console
        console.error("Failed to fetch carousel items:", e);
      }
    }
    fetchCarousel();
    return () => controller.abort();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      slides.length > 0 ? (prev + 1) % slides.length : 0
    );
    // restart the timer on manual interaction
    clearTimer();
    startTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (slides.length === 0) return 0;
      return (prev - 1 + slides.length) % slides.length;
    });
    clearTimer();
    startTimer();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    clearTimer();
    startTimer();
  };

  if (loading) {
    return (
      <div className="hero-carousel">
        <div
          className="hero-carousel__loader"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            pointerEvents: "auto",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              border: "4px solid rgba(255,255,255,0.2)",
              borderTopColor: "#fff",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-slide"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Left Column - 60% */}
            <div className="hero-slide__content">
              <motion.h1
                className="hero-slide__title"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {slides[currentSlide]?.title}
              </motion.h1>

              <motion.p
                className="hero-slide__description"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {slides[currentSlide]?.description}
              </motion.p>

              <motion.button
                className="hero-slide__button"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const movieId = slides[currentSlide]
                    ? slides[currentSlide].id
                    : null;
                  if (movieId) {
                    window.location.href = `/movie/${movieId}`;
                  }
                }}
              >
                {slides[currentSlide]?.buttonText || "View Details"}
              </motion.button>
            </div>

            {/* Right Column - 40% (blank for now) */}
            <div className="hero-slide__media">
              {/* This will be populated later */}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <button
          className="hero-carousel__nav hero-carousel__nav--prev"
          onClick={prevSlide}
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
          onClick={nextSlide}
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

        {/* Dots Indicator */}
        <div className="hero-carousel__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel__dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
