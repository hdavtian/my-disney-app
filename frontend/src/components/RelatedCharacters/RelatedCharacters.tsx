import { useEffect, useState } from "react";
import { CharacterSummary, Character } from "../../types/Character";
import { fetchMovieCharacters } from "../../utils/relationshipApi";
import { CharacterCard } from "../CharacterCard/CharacterCard";
import "./RelatedCharacters.scss";

export interface RelatedCharactersProps {
  movieId: number | string;
  displayStyle?: "grid" | "carousel";
}

export const RelatedCharacters = ({
  movieId,
  displayStyle = "grid",
}: RelatedCharactersProps) => {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert CharacterSummary to Character type for CharacterCard
  const toCharacter = (summary: CharacterSummary): Character => ({
    id: String(summary.id),
    name: summary.name,
    profile_image1: summary.profile_image1,
    short_description: summary.short_description,
    category: (summary.category as Character["category"]) || "other",
  });

  useEffect(() => {
    let isMounted = true;

    const loadCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieCharacters(movieId);

        if (isMounted) {
          setCharacters(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load characters"
          );
          console.error("[RelatedCharacters] Error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCharacters();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  if (loading) {
    return (
      <div className="related-characters">
        <h2 className="related-characters__title">Characters in This Movie</h2>
        <div className={`related-characters__${displayStyle}`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="related-characters__skeleton">
              <div className="skeleton skeleton--image"></div>
              <div className="skeleton skeleton--text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-characters">
        <h2 className="related-characters__title">Characters in This Movie</h2>
        <div className="related-characters__error">
          <p>Unable to load characters at this time.</p>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="related-characters">
        <h2 className="related-characters__title">Characters in This Movie</h2>
        <div className="related-characters__empty">
          <p>No character information available for this movie yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="related-characters">
      <h2 className="related-characters__title">
        Characters in This Movie
        <span className="related-characters__count">({characters.length})</span>
      </h2>
      <div className={`related-characters__${displayStyle}`}>
        {characters.map((characterSummary, index) => (
          <CharacterCard
            key={characterSummary.id}
            character={toCharacter(characterSummary)}
            index={index}
            showTitle={true}
            enableFavoriting={true}
          />
        ))}
      </div>
    </div>
  );
};
