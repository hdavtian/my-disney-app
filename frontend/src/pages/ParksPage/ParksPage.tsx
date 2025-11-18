import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchParks } from "../../store/slices/parksSlice";
import { fetchAttractionsByPark } from "../../store/slices/attractionsSlice";
import { ParkChooser } from "./components/ParkChooser/ParkChooser";
import { AttractionsList } from "./components/AttractionsList/AttractionsList";
import { useAttractionSearch } from "./components/AttractionDetails/AttractionDetails";
import { AttractionDetails } from "./components/AttractionDetails/AttractionDetails";
import { SearchInput } from "../../components/SearchInput";
import "./ParksPage.scss";

type LoadStage = "parks" | "attractions" | "details" | "complete";

/**
 * ParksPage - Three-column immersive parks and attractions explorer
 *
 * Layout (reorganized for better UX):
 * - Column 1 (40%): Park chooser with vertical scroll/snap
 * - Column 2 (40%): Selected attraction details (center stage)
 * - Column 3 (20%): Attractions list for selected park (quick picker)
 */
export const ParksPage = () => {
  const dispatch = useAppDispatch();
  const {
    parks,
    selectedPark,
    loading: parksLoading,
  } = useAppSelector((state) => state.parks);
  const {
    attractionsByPark,
    selectedAttraction,
    loading: attractionsLoading,
  } = useAppSelector((state) => state.attractions);

  // Track load stage for sequential rendering
  const [loadStage, setLoadStage] = useState<LoadStage>("parks");
  const [minDisplayReached, setMinDisplayReached] = useState(false);

  // Fetch all parks on mount
  useEffect(() => {
    dispatch(fetchParks());
  }, [dispatch]);

  // Stage 1: Parks loaded -> Move to attractions stage
  useEffect(() => {
    if (!parksLoading && parks.length > 0 && loadStage === "parks") {
      console.log("✅ Stage 1 complete: Parks loaded");
      // Minimum display time to prevent flash
      const timer = setTimeout(() => {
        setMinDisplayReached(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [parksLoading, parks.length, loadStage]);

  useEffect(() => {
    if (minDisplayReached && loadStage === "parks") {
      setLoadStage("attractions");
      setMinDisplayReached(false);
    }
  }, [minDisplayReached, loadStage]);

  // Fetch attractions when park is selected
  useEffect(() => {
    if (selectedPark) {
      console.log(
        "🎢 Fetching attractions for park:",
        selectedPark.url_id,
        selectedPark.name
      );
      dispatch(fetchAttractionsByPark(selectedPark.url_id));
    }
  }, [dispatch, selectedPark]);

  // Get attractions for current park
  const currentAttractions = selectedPark
    ? attractionsByPark[selectedPark.url_id] || []
    : [];

  // Stage 2: Attractions loaded -> Wait for animations to complete before showing details
  const handleAttractionsAnimationsComplete = useCallback(() => {
    console.log("✅ Stage 2 complete: Attractions animated");
    setLoadStage("details");
  }, []);

  // Reset to attractions stage when park changes (after initial load)
  useEffect(() => {
    if (loadStage === "complete" && selectedPark) {
      console.log("🔄 Park changed, resetting to attractions stage");
      setLoadStage("attractions");
    }
  }, [selectedPark?.url_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark as complete once details are shown
  useEffect(() => {
    if (loadStage === "details") {
      const timer = setTimeout(() => {
        setLoadStage("complete");
        console.log("✅ Stage 3 complete: All content loaded");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadStage]);

  // Use search hook
  const searchHandlers = useAttractionSearch(
    currentAttractions,
    selectedPark?.name
  );

  // Determine what to show based on load stage
  const shouldShowAttractionsList =
    loadStage === "attractions" ||
    loadStage === "details" ||
    loadStage === "complete";
  const shouldShowDetails = loadStage === "details" || loadStage === "complete";

  if (parksLoading && parks.length === 0) {
    return (
      <div className="parks-page parks-page--loading">
        <div className="parks-page__loading-message">
          Loading Disney Parks...
        </div>
      </div>
    );
  }

  return (
    <div className="parks-page">
      <div className="parks-page__container">
        {/* Column 1: Park Chooser (40%) */}
        <div className="parks-page__column parks-page__column--parks">
          <ParkChooser parks={parks} selectedPark={selectedPark} />

          {/* Floating Search Container */}
          <div className="parks-page__floating-search">
            <div className="parks-page__search-row">
              <SearchInput
                items={searchHandlers.searchableAttractions}
                onSearch={searchHandlers.handleSearch}
                searchFields={["name", "attraction_type", "land_area", "theme"]}
                placeholder={
                  searchHandlers.searchMode === "current"
                    ? `Search ${searchHandlers.parkName || "attractions"}...`
                    : "Search all parks..."
                }
                minCharacters={2}
                initialValue={searchHandlers.searchQuery}
                getDisplayText={(attr) => attr.name}
                getSecondaryText={(attr) =>
                  searchHandlers.searchMode === "all"
                    ? `${searchHandlers.getParkName(attr.park_url_id)} • ${
                        attr.attraction_type || "Attraction"
                      }`
                    : attr.attraction_type || "Attraction"
                }
                onSelectItem={searchHandlers.handleSelectAttraction}
                keepQueryOnSelect
              />

              <div className="parks-page__search-mode">
                <label className="parks-page__search-radio">
                  <input
                    type="radio"
                    name="searchMode"
                    value="current"
                    checked={searchHandlers.searchMode === "current"}
                    onChange={() =>
                      searchHandlers.handleSearchModeChange("current")
                    }
                  />
                  <span>Current Park</span>
                </label>
                <label className="parks-page__search-radio">
                  <input
                    type="radio"
                    name="searchMode"
                    value="all"
                    checked={searchHandlers.searchMode === "all"}
                    onChange={() =>
                      searchHandlers.handleSearchModeChange("all")
                    }
                  />
                  <span>All Parks</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Attraction Details (40%) - Center stage */}
        <div className="parks-page__column parks-page__column--details">
          <AnimatePresence mode="wait">
            {shouldShowDetails && selectedAttraction && (
              <motion.div
                key={selectedAttraction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="parks-page__details-wrapper"
              >
                <AttractionDetails
                  attraction={selectedAttraction}
                  loading={attractionsLoading}
                  attractions={currentAttractions}
                  parkName={selectedPark?.name}
                />
              </motion.div>
            )}
            {!shouldShowDetails && (
              <motion.div
                key="loading-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="parks-page__column-loading"
              >
                <p>Loading attraction details...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Attractions List (20%) - Quick picker */}
        <div className="parks-page__column parks-page__column--attractions">
          <AnimatePresence mode="wait">
            {shouldShowAttractionsList ? (
              <motion.div
                key={`attractions-${selectedPark?.url_id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="parks-page__attractions-wrapper"
              >
                <AttractionsList
                  attractions={currentAttractions}
                  loading={attractionsLoading}
                  parkName={selectedPark?.name}
                  selectedAttraction={selectedAttraction}
                  onAnimationsComplete={
                    loadStage === "attractions"
                      ? handleAttractionsAnimationsComplete
                      : undefined
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                key="loading-attractions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="parks-page__column-loading"
              >
                <p>Loading park...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
