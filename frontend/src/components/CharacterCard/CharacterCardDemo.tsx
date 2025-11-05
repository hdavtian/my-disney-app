import { CharacterCard } from "../CharacterCard/CharacterCard";
import { Character } from "../../types/Character";

/**
 * Demo component showing CharacterCard with different prop configurations
 * This demonstrates all the new quiz-specific functionality
 */
export const CharacterCardDemo = () => {
  const sampleCharacter: Character = {
    id: "1",
    name: "Mickey Mouse",
    category: "hero",
    short_description: "Disney's iconic mouse",
    profile_image1: "mickey.jpg",
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h4>Default (All features enabled)</h4>
        <CharacterCard
          character={sampleCharacter}
          onClick={(id) => console.log("Clicked character:", id)}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <h4>Quiz Mode (Title hidden, Navigation disabled)</h4>
        <CharacterCard
          character={sampleCharacter}
          showTitle={false}
          disableNavigation={true}
          onClick={(id) => console.log("Quiz clicked:", id)}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <h4>No Favorites (Favorite button hidden)</h4>
        <CharacterCard
          character={sampleCharacter}
          enableFavoriting={false}
          onClick={(id) => console.log("No fav clicked:", id)}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <h4>Quiz Pure (Only image)</h4>
        <CharacterCard
          character={sampleCharacter}
          showTitle={false}
          enableFavoriting={false}
          disableNavigation={true}
          onClick={(id) => console.log("Pure quiz clicked:", id)}
        />
      </div>
    </div>
  );
};
