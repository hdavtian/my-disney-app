import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import { Character } from "../../types/Character";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/virtual";

interface CharacterCarouselProps {
  characters?: Character[];
  isSearchActive?: boolean;
  loading?: boolean;
}

export const CharacterCarousel = ({
  characters: propCharacters,
  isSearchActive = false,
  loading: propLoading = false,
}: CharacterCarouselProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    characters: storeCharacters,
    loading: storeLoading,
    error,
  } = useAppSelector((state) => state.characters);

  useEffect(() => {
    if (!propCharacters) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, propCharacters]);

  const characters = propCharacters || storeCharacters;
  const loading = propLoading || storeLoading;

  const handleCharacterClick = (characterId: string) => {
    navigate(`/character/${characterId}`);
  };

  if (loading) {
    return (
      <div className="character-carousel">
        <div className="character-carousel__loading">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-carousel">
        <div className="character-carousel__error">Error: {error}</div>
      </div>
    );
  }

  if (characters.length === 0 && isSearchActive) {
    return (
      <div className="character-carousel">
        <div className="character-carousel__empty">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.3, marginBottom: "1rem" }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p>No characters found matching your search</p>
          <span
            style={{ fontSize: "0.875rem", opacity: 0.6, marginTop: "0.5rem" }}
          >
            Try a different search term
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="character-carousel">
      <div className="character-carousel__container">
        <Swiper
          modules={[Navigation, Virtual]}
          navigation={{
            prevEl: ".character-carousel__nav--prev",
            nextEl: ".character-carousel__nav--next",
          }}
          virtual
          slidesPerView={10}
          slidesPerGroup={10}
          spaceBetween={16}
          breakpoints={{
            0: {
              slidesPerView: 1,
              slidesPerGroup: 1,
              spaceBetween: 16,
            },
            481: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 6,
              slidesPerGroup: 6,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 8,
              slidesPerGroup: 8,
              spaceBetween: 16,
            },
          }}
          watchSlidesProgress
        >
          {characters.map((character, index) => (
            <SwiperSlide key={character.id} virtualIndex={index}>
              <div className="character-circle">
                {/* Clickable character link */}
                <a
                  href={`/character/${character.id}`}
                  className="character-circle__link"
                  aria-label={`View details for ${character.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCharacterClick(character.id);
                  }}
                >
                  <div className="character-circle__image">
                    <img
                      src={
                        character.profile_image1
                          ? getImageUrl("characters", character.profile_image1)
                          : character.imageUrl ||
                            `https://picsum.photos/seed/${character.id}-char/300/300`
                      }
                      alt={character.name}
                      loading="lazy"
                    />
                    <div className="character-circle__overlay">
                      <span className="character-circle__category">
                        {character.category || "Disney"}
                      </span>
                    </div>
                  </div>
                  <h4 className="character-circle__name">{character.name}</h4>
                </a>
                {/* Favorite button (clickable independently) */}
                <div className="character-circle__favorite">
                  <FavoriteButton
                    id={character.id}
                    type="character"
                    ariaLabel={`Favorite ${character.name}`}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Controls */}
        <button
          className="character-carousel__nav character-carousel__nav--prev"
          aria-label="Previous characters"
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
          className="character-carousel__nav character-carousel__nav--next"
          aria-label="Next characters"
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
      </div>
    </div>
  );
};
