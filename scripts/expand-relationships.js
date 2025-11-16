const fs = require('fs');
const path = require('path');

// Load existing JSON files
const moviesPath = path.join(__dirname, '../backend/src/main/resources/database/disney_movies.json');
const charactersPath = path.join(__dirname, '../backend/src/main/resources/database/disney_characters.json');
const analysisPath = path.join(__dirname, '../backend/src/main/resources/database/movie_characters_analysis.txt');
const outputPath = path.join(__dirname, '../backend/src/main/resources/database/movie_characters_relationships.json');

const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));
const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
const analysisText = fs.readFileSync(analysisPath, 'utf-8');

// Helper: Find movie url_id by title
function findMovieUrlId(title) {
  const normalized = title.toLowerCase().trim();
  const movie = movies.find(m => 
    m.title.toLowerCase() === normalized ||
    m.title.toLowerCase().includes(normalized) ||
    normalized.includes(m.title.toLowerCase())
  );
  return movie ? movie.url_id : null;
}

// Helper: Find character url_id by name
function findCharacterUrlId(name) {
  const normalized = name.toLowerCase().trim()
    .replace(/\//g, ' ') // Handle "Iron Man/Tony Stark"
    .split(/\s+/)[0]; // Take first word for matching
  
  const char = characters.find(c => {
    const charName = c.name.toLowerCase();
    return charName === normalized ||
           charName.includes(normalized) ||
           normalized.includes(charName.split(' ')[0]);
  });
  return char ? char.url_id : null;
}

// Extract relationships from analysis file
const relationships = [];
let currentSection = '';

// Parse the analysis file
const lines = analysisText.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Match pattern: "123. CHARACTER_NAME → Movie Title (Year)"
  const match = line.match(/^(\d+\.|[\d]+)\s+([A-Z\s\/]+?)\s+→\s+(.+?)\s+\((\d{4})\)/);
  
  if (match) {
    const [, , characterName, movieTitle, year] = match;
    
    const charUrlId = findCharacterUrlId(characterName);
    const movieUrlId = findMovieUrlId(movieTitle);
    
    if (charUrlId && movieUrlId) {
      // Determine role and importance based on context
      let role = 'supporting';
      let importance = 2;
      
      const lowerChar = characterName.toLowerCase();
      const lowerMovie = movieTitle.toLowerCase();
      
      // Protagonist heuristics
      if (lowerMovie.includes(lowerChar) || 
          ['ariel', 'belle', 'simba', 'woody', 'buzz', 'elsa', 'anna', 'moana', 'mulan', 'ralph'].includes(lowerChar.split(' ')[0].toLowerCase())) {
        role = 'protagonist';
        importance = 1;
      }
      // Antagonist heuristics
      else if (['ursula', 'scar', 'jafar', 'gaston', 'hans', 'hopper', 'loki'].includes(lowerChar.split(' ')[0].toLowerCase())) {
        role = 'antagonist';
        importance = 1;
      }
      // Sidekick heuristics
      else if (['flounder', 'sebastian', 'timon', 'pumbaa', 'mushu', 'pascal', 'olaf', 'dug'].includes(lowerChar.split(' ')[0].toLowerCase())) {
        role = 'sidekick';
        importance = 2;
      }
      
      relationships.push({
        movie_url_id: movieUrlId,
        character_url_id: charUrlId,
        character_role: role,
        importance_level: importance,
        sort_order: relationships.filter(r => r.movie_url_id === movieUrlId).length + 1
      });
      
      console.log(`✅ Added: ${characterName} → ${movieTitle} (${year})`);
    } else {
      console.log(`⚠️  Skipped: ${characterName} → ${movieTitle} (${year}) - No URL match`);
    }
  }
}

// Write output
fs.writeFileSync(outputPath, JSON.stringify(relationships, null, 2));
console.log(`\n✅ Successfully created ${relationships.length} relationships`);
console.log(`📄 Output: ${outputPath}`);
