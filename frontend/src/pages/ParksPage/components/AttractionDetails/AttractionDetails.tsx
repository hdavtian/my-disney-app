import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo } from "react";
import { Attraction } from "../../../../types/Attraction";
import { FavoriteButton } from "../../../../components/FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../../../config/assets";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import {
  setParksSearchQuery,
  setParksSearchMode,
  type SearchMode,
} from "../../../../store/slices/uiPreferencesSlice";
import {
  selectAttraction,
  fetchAllAttractions,
  setAttractionSearchFilter,
} from "../../../../store/slices/attractionsSlice";
import { selectPark } from "../../../../store/slices/parksSlice";
import "./AttractionDetails.scss";

interface AttractionDetailsProps {
  attraction: Attraction | null;
  loading: boolean;
  attractions: Attraction[];
  parkName?: string;
}

// Export search-related props and handlers
export interface SearchHandlers {
  searchableAttractions: Attraction[];
  handleSearch: (results: Attraction[], query: string) => void;
  handleSelectAttraction: (attraction: Attraction) => void;
  handleSearchModeChange: (mode: SearchMode) => void;
  searchQuery: string;
  searchMode: SearchMode;
  getParkName: (parkUrlId: string) => string;
  parkName?: string;
  loading: boolean;
}

export const useAttractionSearch = (
  attractions: Attraction[],
  parkName?: string
): SearchHandlers => {
  const dispatch = useAppDispatch();
  const { searchQuery, searchMode } = useAppSelector(
    (state) => state.uiPreferences.parks
  );
  const { allAttractions } = useAppSelector((state) => state.attractions);
  const { parks } = useAppSelector((state) => state.parks);

  // Fetch all attractions when switching to "all" mode
  useEffect(() => {
    if (searchMode === "all" && allAttractions.length === 0) {
      dispatch(fetchAllAttractions());
    }
  }, [searchMode, allAttractions.length, dispatch]);

  // Determine which attractions to search
  const searchableAttractions = useMemo(() => {
    return searchMode === "current" ? attractions : allAttractions;
  }, [searchMode, attractions, allAttractions]);

  // Get park name by URL ID helper
  const getParkName = useCallback(
    (parkUrlId: string) => {
      const park = parks.find((p) => p.url_id === parkUrlId);
      return park?.name || parkUrlId;
    },
    [parks]
  );

  // Handle search
  const handleSearch = useCallback(
    (_results: Attraction[], query: string) => {
      // Only dispatch if query actually changed to prevent infinite loops
      if (query !== searchQuery) {
        dispatch(setParksSearchQuery(query));
        dispatch(setAttractionSearchFilter(query));
      }
    },
    [dispatch, searchQuery]
  );

  // Handle attraction selection from search
  const handleSelectAttraction = useCallback(
    (selectedAttraction: Attraction) => {
      // Check if attraction is from a different park
      const isDifferentPark =
        selectedAttraction.park_url_id !== attractions[0]?.park_url_id;

      if (searchMode === "all" && isDifferentPark) {
        // Find and select the park first
        const targetPark = parks.find(
          (p) => p.url_id === selectedAttraction.park_url_id
        );
        if (targetPark) {
          dispatch(selectPark(targetPark));
          // Wait for park to load, then select attraction
          setTimeout(() => {
            dispatch(selectAttraction(selectedAttraction));
          }, 300);
        }
      } else {
        // Same park, just select the attraction
        dispatch(selectAttraction(selectedAttraction));
      }
    },
    [dispatch, searchMode, attractions, parks]
  );

  // Handle search mode toggle
  const handleSearchModeChange = useCallback(
    (mode: SearchMode) => {
      dispatch(setParksSearchMode(mode));
    },
    [dispatch]
  );

  const { loading: attractionsLoading } = useAppSelector(
    (state) => state.attractions
  );

  return {
    searchableAttractions,
    handleSearch,
    handleSelectAttraction,
    handleSearchModeChange,
    searchQuery,
    searchMode,
    getParkName,
    parkName,
    loading: attractionsLoading,
  };
};

export const AttractionDetails = ({
  attraction,
  loading,
  attractions: _attractions,
  parkName: _parkName,
}: AttractionDetailsProps) => {
  if (loading && !attraction) {
    return (
      <div className="attraction-details attraction-details--loading">
        <div className="attraction-details__loading-text">Loading...</div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="attraction-details attraction-details--empty">
        <p>Select an attraction to view details</p>
      </div>
    );
  }

  const bgImage = attraction.image_1
    ? getImageUrl("attractions", attraction.image_1)
    : "/placeholder.png";

  return (
    <motion.div
      key={attraction.url_id}
      className="attraction-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image */}
      <div className="attraction-details__background">
        <img
          src={bgImage}
          alt={attraction.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="attraction-details__overlay" />

      {/* Content */}
      <div className="attraction-details__content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="attraction-details__title">{attraction.name}</h2>

          <div className="attraction-details__meta">
            <FavoriteButton
              id={attraction.id}
              type="attraction"
              ariaLabel={`Favorite ${attraction.name}`}
              size={28}
            />
            {attraction.attraction_type && (
              <span className="attraction-details__badge">
                {attraction.attraction_type}
              </span>
            )}
            {attraction.thrill_level && (
              <span
                className={`attraction-details__badge attraction-details__badge--${attraction.thrill_level.toLowerCase()}`}
              >
                {attraction.thrill_level}
              </span>
            )}
            {attraction.is_operational !== undefined && (
              <span
                className={`attraction-details__badge ${
                  attraction.is_operational
                    ? "attraction-details__badge--operational"
                    : "attraction-details__badge--closed"
                }`}
              >
                {attraction.is_operational ? "Operational" : "Closed"}
              </span>
            )}
          </div>

          {attraction.short_description && (
            <p className="attraction-details__description">
              {attraction.short_description}
            </p>
          )}

          <div className="attraction-details__info">
            {attraction.land_area && (
              <div className="attraction-details__info-item">
                <strong>Land:</strong> {attraction.land_area}
              </div>
            )}
            {attraction.duration_minutes && (
              <div className="attraction-details__info-item">
                <strong>Duration:</strong> {attraction.duration_minutes} minutes
              </div>
            )}
            {attraction.height_requirement_inches && (
              <div className="attraction-details__info-item">
                <strong>Height Requirement:</strong>{" "}
                {attraction.height_requirement_inches}" (
                {Math.round(attraction.height_requirement_inches * 2.54)} cm)
              </div>
            )}
            {attraction.opening_date && (
              <div className="attraction-details__info-item">
                <strong>Opened:</strong> {attraction.opening_date[1]}/
                {attraction.opening_date[2]}/{attraction.opening_date[0]}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
