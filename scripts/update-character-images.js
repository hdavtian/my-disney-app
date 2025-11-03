const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../backend/src/main/resources/database/disney_characters.json');
const charactersData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Read the image directory
const imagesDir = path.join(__dirname, '../frontend/public/characters');
const imageFiles = fs.readdirSync(imagesDir);

// Separate profile and background images
const profileImages = imageFiles.filter(f => f.startsWith('prf_'));
const backgroundImages = imageFiles.filter(f => f.startsWith('s0_'));

console.log(`📊 Found ${charactersData.length} characters in JSON`);
console.log(`🖼️  Found ${profileImages.length} profile images`);
console.log(`🎨 Found ${backgroundImages.length} background images`);
console.log('\n');

// Function to normalize text for comparison
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars except spaces
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .trim();
}

// Function to find matching image
function findMatchingImage(characterName, imageList, prefix) {
  const normalizedName = normalize(characterName);
  
  // Try exact match first (after removing prefix and extension)
  let match = imageList.find(img => {
    const imgName = img
      .replace(prefix, '')
      .replace('.png', '')
      .replace('.jpg', '')
      .replace('.gif', '');
    return imgName === normalizedName;
  });
  
  if (match) return match;
  
  // Try partial match (image name contains character name or vice versa)
  match = imageList.find(img => {
    const imgName = img
      .replace(prefix, '')
      .replace('.png', '')
      .replace('.jpg', '')
      .replace('.gif', '');
    
    // Check if they match closely
    return imgName.includes(normalizedName) || normalizedName.includes(imgName);
  });
  
  return match || null;
}

// Process each character
let matchedProfile = 0;
let matchedBackground = 0;
let unmatched = [];

const updatedCharacters = charactersData.map(char => {
  const profileMatch = findMatchingImage(char.name, profileImages, 'prf_');
  const backgroundMatch = findMatchingImage(char.name, backgroundImages, 's0_');
  
  if (profileMatch) matchedProfile++;
  if (backgroundMatch) matchedBackground++;
  
  if (!profileMatch || !backgroundMatch) {
    unmatched.push({
      name: char.name,
      profile: profileMatch || 'NOT FOUND',
      background: backgroundMatch || 'NOT FOUND'
    });
  }
  
  return {
    ...char,
    profile_image_1: profileMatch || '',
    background_image_1: backgroundMatch || ''
  };
});

console.log(`✅ Matched ${matchedProfile} profile images`);
console.log(`✅ Matched ${matchedBackground} background images`);
console.log(`\n⚠️  ${unmatched.length} characters with missing images:\n`);

if (unmatched.length > 0) {
  unmatched.forEach(u => {
    console.log(`   ${u.name}:`);
    if (u.profile === 'NOT FOUND') console.log(`      ❌ Profile missing`);
    if (u.background === 'NOT FOUND') console.log(`      ❌ Background missing`);
  });
}

// Write the updated JSON back
fs.writeFileSync(jsonPath, JSON.stringify(updatedCharacters, null, 2));

console.log(`\n💾 Updated JSON file: ${jsonPath}`);
console.log(`\n✨ Done! All image references have been added.`);
