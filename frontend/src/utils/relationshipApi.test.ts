/**
 * Test script to verify movie-character relationship API integration.
 * Run this in the browser console to test the new API endpoints.
 */

import { fetchMovieCharacters, fetchCharacterMovies } from "./relationshipApi";

/**
 * Test fetching characters for a movie.
 */
export async function testFetchMovieCharacters(
  movieId: number = 1
): Promise<void> {
  console.log(`\n🎬 Testing fetchMovieCharacters(${movieId})...`);
  try {
    const characters = await fetchMovieCharacters(movieId);
    console.log(`✅ Success! Found ${characters.length} character(s):`);
    characters.forEach((char) => {
      console.log(`  - ${char.name} (ID: ${char.id}, URL: ${char.urlId})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test fetching movies for a character.
 */
export async function testFetchCharacterMovies(
  characterId: number = 92
): Promise<void> {
  console.log(`\n🎭 Testing fetchCharacterMovies(${characterId})...`);
  try {
    const movies = await fetchCharacterMovies(characterId);
    console.log(`✅ Success! Found ${movies.length} movie(s):`);
    movies.forEach((movie) => {
      console.log(
        `  - ${movie.title} (${movie.creationYear}) - ID: ${movie.id}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Run all relationship API tests.
 */
export async function runRelationshipApiTests(): Promise<void> {
  console.log("🧪 Running Movie-Character Relationship API Tests...\n");

  // Test 1: Movie with one character (Snow White)
  await testFetchMovieCharacters(1);

  // Test 2: Movie with multiple characters (Toy Story 3)
  await testFetchMovieCharacters(626);

  // Test 3: Character in one movie (Snow White)
  await testFetchCharacterMovies(92);

  // Test 4: Character in multiple movies (Woody)
  await testFetchCharacterMovies(157);

  console.log("\n✨ All tests completed!");
}

// Export for browser console testing
if (typeof window !== "undefined") {
  (window as any).testRelationshipApi = {
    testFetchMovieCharacters,
    testFetchCharacterMovies,
    runAll: runRelationshipApiTests,
  };
  console.log("💡 Relationship API test functions available:");
  console.log(
    "  - window.testRelationshipApi.testFetchMovieCharacters(movieId)"
  );
  console.log(
    "  - window.testRelationshipApi.testFetchCharacterMovies(characterId)"
  );
  console.log("  - window.testRelationshipApi.runAll()");
}
