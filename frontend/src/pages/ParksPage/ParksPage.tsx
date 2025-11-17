import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchParks } from "../../store/slices/parksSlice";
import { fetchAttractionsByPark } from "../../store/slices/attractionsSlice";
import { ParkChooser } from "./components/ParkChooser/ParkChooser";
import { AttractionsList } from "./components/AttractionsList/AttractionsList";
import { AttractionDetails } from "./components/AttractionDetails/AttractionDetails";
import "./ParksPage.scss";

/**
 * ParksPage - Three-column immersive parks and attractions explorer
 *
 * Layout:
 * - Column 1 (40%): Park chooser with vertical scroll/snap
 * - Column 2 (20%): Attractions list for selected park
 * - Column 3 (40%): Selected attraction details
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
        </div>

        {/* Column 2: Attractions List (20%) */}
        <div className="parks-page__column parks-page__column--attractions">
          <AttractionsList
            attractions={currentAttractions}
            loading={attractionsLoading}
            parkName={selectedPark?.name}
            selectedAttraction={selectedAttraction}
          />
        </div>

        {/* Column 3: Attraction Details (40%) */}
        <div className="parks-page__column parks-page__column--details">
          <AttractionDetails
            attraction={selectedAttraction}
            loading={attractionsLoading}
          />
        </div>
      </div>
    </div>
  );
};
