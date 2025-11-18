import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchParks } from "../../store/slices/parksSlice";
import { fetchAttractionsByPark } from "../../store/slices/attractionsSlice";
import { ParkChooser } from "./components/ParkChooser/ParkChooser";
import { AttractionsList } from "./components/AttractionsList/AttractionsList";
import { useAttractionSearch } from "./components/AttractionDetails/AttractionDetails";
import { AttractionDetails } from "./components/AttractionDetails/AttractionDetails";
import { SearchInput } from "../../components/SearchInput";
import "./ParksPage.scss";

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

  // Fetch all parks on mount
  useEffect(() => {
    dispatch(fetchParks());
  }, [dispatch]);

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

  // Use search hook
  const searchHandlers = useAttractionSearch(
    currentAttractions,
    selectedPark?.name
  );

  console.log("📊 Current state:", {
    selectedPark: selectedPark?.name,
    attractionsByPark,
    currentAttractions: currentAttractions.length,
    attractionsLoading,
  });

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
          <AttractionDetails
            attraction={selectedAttraction}
            loading={attractionsLoading}
            attractions={currentAttractions}
            parkName={selectedPark?.name}
          />
        </div>

        {/* Column 3: Attractions List (20%) - Quick picker */}
        <div className="parks-page__column parks-page__column--attractions">
          <AttractionsList
            attractions={currentAttractions}
            loading={attractionsLoading}
            parkName={selectedPark?.name}
            selectedAttraction={selectedAttraction}
          />
        </div>
      </div>
    </div>
  );
};
