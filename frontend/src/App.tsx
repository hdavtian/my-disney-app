import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation/Navigation";
import { HomePage } from "./components/HomePage/HomePage";
import { CharactersPage } from "./pages/CharactersPage/CharactersPage";
import { MoviesPage } from "./pages/MoviesPage/MoviesPage";
import { FavoritesPage } from "./pages/FavoritesPage/FavoritesPage";
import { BehindTheMagicPage } from "./pages/BehindTheMagicPage/BehindTheMagicPage";
import { MovieDetailPage } from "./pages/MovieDetailPage/MovieDetailPage";
import { CharacterDetailPage } from "./pages/CharacterDetailPage/CharacterDetailPage";
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
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/behind-the-magic" element={<BehindTheMagicPage />} />
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
