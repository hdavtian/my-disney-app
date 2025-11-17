/**
 * Script to update attraction image filenames in disney_parks_attractions.json
 * Formula: park_url_id + "-" + url_id + "-" + [1-5]
 * Example: "disneys-animal-kingdom-avatar-flight-of-passage-1"
 */

const fs = require('fs');
const path = require('path');

// Path to the attractions JSON file
const attractionsFilePath = path.join(__dirname, '../backend/src/main/resources/database/disney_parks_attractions.json');

// Read the JSON file
console.log('Reading disney_parks_attractions.json...');
const data = JSON.parse(fs.readFileSync(attractionsFilePath, 'utf8'));

// Update each attraction's image fields
let updateCount = 0;
data.forEach(attraction => {
  if (attraction.park_url_id && attraction.url_id) {
    // Generate image filenames based on the formula
    for (let i = 1; i <= 5; i++) {
      const imageKey = `image_${i}`;
      const imageValue = `${attraction.park_url_id}-${attraction.url_id}-${i}`;
      attraction[imageKey] = imageValue;
    }
    updateCount++;
  } else {
    console.warn(`Warning: Attraction missing park_url_id or url_id:`, attraction.name || 'Unknown');
  }
});

// Write the updated data back to the file
console.log(`Updating ${updateCount} attractions...`);
fs.writeFileSync(attractionsFilePath, JSON.stringify(data, null, 2), 'utf8');

console.log('✓ Successfully updated attraction images!');
console.log(`  Total attractions processed: ${data.length}`);
console.log(`  Attractions updated: ${updateCount}`);
console.log('\nExample output:');
if (data.length > 0) {
  const sample = data[0];
  console.log(`  Attraction: ${sample.name}`);
  console.log(`  image_1: ${sample.image_1}`);
  console.log(`  image_2: ${sample.image_2}`);
  console.log(`  image_3: ${sample.image_3}`);
  console.log(`  image_4: ${sample.image_4}`);
  console.log(`  image_5: ${sample.image_5}`);
}
