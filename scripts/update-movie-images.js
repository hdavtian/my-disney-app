const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../database/disney_movies_comprehensive.json');
const moviesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Read the image directory
const imagesDir = path.join(__dirname, '../frontend/public/movies');
const imageFiles = fs.readdirSync(imagesDir);

// Separate image_1 and image_2
const image1Files = imageFiles.filter(f => f.includes('_1.'));
const image2Files = imageFiles.filter(f => f.includes('_2.'));

console.log(`📊 Found ${moviesData.length} movies in JSON`);
console.log(`🖼️  Found ${image1Files.length} image_1 files`);
console.log(`🎨 Found ${image2Files.length} image_2 files`);
console.log('\n');

// Function to normalize text for comparison
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .trim();
}

// Function to find matching image
function findMatchingImage(movieTitle, imageList, suffix) {
  const normalizedTitle = normalize(movieTitle);
  
  // Try exact match first
  let match = imageList.find(img => {
    const imgName = img
      .replace(suffix, '')
      .replace('.jpg', '')
      .replace('.png', '')
      .replace('.gif', '');
    return imgName === normalizedTitle;
  });
  
  if (match) return match;
  
  // Try partial match
  match = imageList.find(img => {
    const imgName = img
      .replace(suffix, '')
      .replace('.jpg', '')
      .replace('.png', '')
      .replace('.gif', '');
    
    // Check if they match closely
    return imgName.includes(normalizedTitle) || normalizedTitle.includes(imgName);
  });
  
  return match || null;
}

// Process each movie
let matched1 = 0;
let matched2 = 0;
let unmatched = [];

const updatedMovies = moviesData.map(movie => {
  const image1Match = findMatchingImage(movie.title, image1Files, '_1');
  const image2Match = findMatchingImage(movie.title, image2Files, '_2');
  
  if (image1Match) matched1++;
  if (image2Match) matched2++;
  
  if (!image1Match || !image2Match) {
    unmatched.push({
      title: movie.title,
      image_1: image1Match || 'NOT FOUND',
      image_2: image2Match || 'NOT FOUND'
    });
  }
  
  return {
    ...movie,
    image_1: image1Match || '',
    image_2: image2Match || ''
  };
});

console.log(`✅ Matched ${matched1} image_1 files`);
console.log(`✅ Matched ${matched2} image_2 files`);
console.log(`\n⚠️  ${unmatched.length} movies with missing images:\n`);

if (unmatched.length > 0 && unmatched.length <= 20) {
  unmatched.forEach(u => {
    console.log(`   ${u.title}:`);
    if (u.image_1 === 'NOT FOUND') console.log(`      ❌ image_1 missing`);
    if (u.image_2 === 'NOT FOUND') console.log(`      ❌ image_2 missing`);
  });
} else if (unmatched.length > 20) {
  console.log(`   (Too many to display - ${unmatched.length} total)`);
  console.log(`   First 10:`);
  unmatched.slice(0, 10).forEach(u => {
    console.log(`   ${u.title}:`);
    if (u.image_1 === 'NOT FOUND') console.log(`      ❌ image_1 missing`);
    if (u.image_2 === 'NOT FOUND') console.log(`      ❌ image_2 missing`);
  });
}

// Write the updated JSON back
fs.writeFileSync(jsonPath, JSON.stringify(updatedMovies, null, 2));

console.log(`\n💾 Updated JSON file: ${jsonPath}`);
console.log(`\n✨ Done! All image references have been added.`);
