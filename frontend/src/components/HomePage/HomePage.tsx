import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/redux";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import { MovieCarousel } from "../MovieCarousel/MovieCarousel";
import { CharacterCarousel } from "../CharacterCarousel/CharacterCarousel";
import { SearchInput } from "../SearchInput/SearchInput";
import { Movie } from "../../types/Movie";
import { Character } from "../../types/Character";
import { useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { fetchCharacters } from "../../store/slices/charactersSlice";

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const allMovies = useAppSelector((state) => state.movies.movies);
  const moviesLoading = useAppSelector((state) => state.movies.loading);
  const allCharacters = useAppSelector((state) => state.characters.characters);
  const charactersLoading = useAppSelector((state) => state.characters.loading);

  useEffect(() => {
    if (allMovies.length === 0) {
      dispatch(fetchMovies());
    }
    if (allCharacters.length === 0) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, allMovies.length, allCharacters.length]);

  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [characterSearchQuery, setCharacterSearchQuery] = useState("");

  const handleMovieSearch = (results: Movie[], query: string) => {
    setFilteredMovies(results);
    setMovieSearchQuery(query);
  };

  const handleCharacterSearch = (results: Character[], query: string) => {
    setFilteredCharacters(results);
    setCharacterSearchQuery(query);
  };

  // Only use filtered results if there's an active search query (3+ chars)
  const moviesToDisplay =
    movieSearchQuery.length >= 3 ? filteredMovies : allMovies;
  const charactersToDisplay =
    characterSearchQuery.length >= 3 ? filteredCharacters : allCharacters;

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Hero Wrapper - Full height minus navigation */}
      <div className="main-hero-wrapper">
        {/* Background Image Layer */}
        <div className="hero-background-images" />

        {/* Hero Carousel - 40% height */}
        <div className="hero-carousel-section">
          <HeroCarousel />
        </div>
      </div>

      {/* Below Fold Wrapper */}
      <div className="below-fold-wrapper">
        {/* Movie Slider Row */}
        <div className="movie-slider-section">
          <div className="section-header">
            <h2 className="section-title">Disney Movies</h2>
            <SearchInput<Movie>
              items={allMovies}
              onSearch={handleMovieSearch}
              searchFields={["title", "director", "rating"]}
              placeholder="Search movies..."
              getDisplayText={(movie) => movie.title}
              getSecondaryText={(movie) => {
                const year = movie.creation_year || movie.releaseYear || "";
                const director = movie.director || "";
                if (year && director) return `${year} • ${director}`;
                if (year) return String(year);
                if (director) return director;
                return "";
              }}
              onSelectItem={(movie) => {
                // Navigate to movie detail page when item is selected from dropdown
                navigate(`/movie/${movie.id}`);
              }}
            />
          </div>
          <MovieCarousel
            movies={moviesToDisplay}
            isSearchActive={movieSearchQuery.length >= 3}
            loading={moviesLoading}
          />
        </div>

        {/* Character Circles Row */}
        <div className="character-circles-section">
          <div className="section-header">
            <h2 className="section-title">Beloved Characters</h2>
            <SearchInput<Character>
              items={allCharacters}
              onSearch={handleCharacterSearch}
              searchFields={["name"]}
              placeholder="Search characters..."
              getDisplayText={(character) => character.name}
              getSecondaryText={(character) => {
                const debut =
                  character.debut || character.first_appearance || "";
                const category = character.category || "";
                if (debut && category) return `${debut} • ${category}`;
                if (debut) return debut;
                if (category) return category;
                return "";
              }}
              onSelectItem={(character) => {
                // Navigate to character detail page when item is selected from dropdown
                navigate(`/character/${character.id}`);
              }}
            />
          </div>
          <CharacterCarousel
            characters={charactersToDisplay}
            isSearchActive={characterSearchQuery.length >= 3}
            loading={charactersLoading}
          />
        </div>

        {/* <div className="below-fold-row">
          <h3>Coming Soon Content Row 1</h3>
          <p>This area will be populated with additional content.</p>
        </div>

        <div className="below-fold-row">
          <h3>Coming Soon Content Row 2</h3>
          <p>This area will be populated with additional content.</p>
        </div> */}
      </div>
    </motion.div>
  );
};
