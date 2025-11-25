import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation/Navigation";
import { HomePage } from "./components/HomePage/HomePage";
import { CharactersPage } from "./pages/CharactersPage/CharactersPage";
import { MoviesPage } from "./pages/MoviesPage/MoviesPage";
import { FavoritesPage } from "./pages/FavoritesPage/FavoritesPage";
import { AboutPage } from "./pages/AboutPage/AboutPage";
import { MovieDetailPage } from "./pages/MovieDetailPage/MovieDetailPage";
import { CharacterDetailPage } from "./pages/CharacterDetailPage/CharacterDetailPage";
import { DisneySearchPage } from "./pages/DisneySearchPage/DisneySearchPage";
import { ParksPage } from "./pages/ParksPage";
import { GamesPage } from "./pages/GamesPage";
import { DisclaimerPage } from "./pages/DisclaimerPage";
import { Footer } from "./components/Footer/Footer";
import { RequireDisclaimer } from "./components/AccessGate/RequireDisclaimer";
import { ScrollToTop } from "./components/ScrollToTop";
import { AppInitializer } from "./components/AppInitializer";
import { useTheme } from "./hooks/useTheme";

function App() {
  // Initialize theme system
  useTheme();

  return (
    <div className="app">
      <AppInitializer />
      <ScrollToTop />
      <Navigation />
      <main className="app-content">
        <Routes>
          <Route element={<RequireDisclaimer />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/parks" element={<ParksPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/search" element={<DisneySearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route
            path="*"
            element={
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1>404 - Page Not Found</h1>
                <p>The requested page could not be found.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
