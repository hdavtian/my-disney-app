import { useEffect } from "react";
import { useFavorites } from "../../hooks/useFavorites";

/**
 * AppInitializer component that handles one-time initialization tasks
 * like hydrating favorites from localStorage into Redux state.
 */
export const AppInitializer = () => {
  const { hydrate } = useFavorites();

  useEffect(() => {
    // Hydrate favorites from localStorage on app mount
    hydrate();
  }, [hydrate]);

  return null;
};
