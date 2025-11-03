const fs = require('fs');
const axios = require('axios');
const { JSDOM } = require('jsdom');

// Load the movies data
const moviesPath = 'c:/sites/my-disney-app/database/disney_movies_comprehensive.json';
let movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

// Find movies that need descriptions
const moviesNeedingDescriptions = movies.filter(movie => 
    movie.source_url && 
    movie.source_url !== "" && 
    movie.source_url !== "N/A" && 
    (!movie.long_description || movie.long_description === "" || movie.long_description === "N/A")
);

console.log(`Found ${moviesNeedingDescriptions.length} movies that need descriptions`);

let processed = 0;
let successful = 0;

function cleanText(text) {
    if (!text) return "";
    
    // Remove extra whitespace and normalize
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove common navigation elements
    cleaned = cleaned.replace(/D23 Logo.*?$/g, '');
    cleaned = cleaned.replace(/JOIN.*?EVENTS.*?DISCOUNTS.*?$/g, '');
    cleaned = cleaned.replace(/SEARCH RESULTS FOR.*?$/g, '');
    cleaned = cleaned.replace(/Filter by: ALL.*?$/g, '');
    
    return cleaned;
}

async function fetchDescription(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            maxRedirects: 5
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        // Look for content in different ways
        let description = '';
        
        // Try to find D23-specific content patterns
        const mainContent = document.querySelector('main') || 
                          document.querySelector('.content') || 
                          document.querySelector('#content') ||
                          document.body;
        
        if (mainContent) {
            const paragraphs = mainContent.querySelectorAll('p');
            let bestDescription = '';
            
            for (let p of paragraphs) {
                const text = p.textContent.trim();
                // Look for paragraphs that seem like movie descriptions
                if (text.length > 100 && 
                    (text.includes('film') || text.includes('movie') || text.includes('story') || text.includes('directed'))) {
                    if (text.length > bestDescription.length) {
                        bestDescription = text;
                    }
                }
            }
            
            description = bestDescription;
        }
        
        const cleaned = cleanText(description);
        return cleaned.length > 50 ? cleaned : null;
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log(`  Timeout for ${url}`);
        } else if (error.response) {
            console.log(`  HTTP ${error.response.status} for ${url}`);
        } else {
            console.log(`  Error for ${url}: ${error.message}`);
        }
        return null;
    }
}

async function processMovies() {
    const batchSize = 100; // Process 100 movies at a time!
    for (let i = 0; i < Math.min(batchSize, moviesNeedingDescriptions.length); i++) {
        const movie = moviesNeedingDescriptions[i];
        console.log(`\nProcessing ${i + 1}/${Math.min(batchSize, moviesNeedingDescriptions.length)}: ${movie.title}`);
        
        try {
            const description = await fetchDescription(movie.source_url);
            
            if (description) {
                // Find the movie in the original array and update it
                const movieIndex = movies.findIndex(m => 
                    m.title === movie.title && m.source_url === movie.source_url
                );
                
                if (movieIndex >= 0) {
                    movies[movieIndex].long_description = description;
                    
                    // Create short description
                    let shortDesc = description;
                    if (shortDesc.length > 150) {
                        shortDesc = shortDesc.substring(0, 147) + "...";
                    }
                    movies[movieIndex].short_description = shortDesc;
                    
                    successful++;
                    console.log(`✓ Updated: ${movie.title}`);
                    console.log(`  Short: ${shortDesc.substring(0, 80)}...`);
                } else {
                    console.log(`✗ Could not find movie in array: ${movie.title}`);
                }
            } else {
                console.log(`✗ Failed to get description: ${movie.title}`);
            }
            
            processed++;
            
            // Rate limiting - faster pace!
            if (i < Math.min(batchSize, moviesNeedingDescriptions.length) - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }
            
        } catch (error) {
            console.log(`✗ Error processing ${movie.title}: ${error.message}`);
            processed++;
        }
    }
    
    // Save the updated data
    console.log('\nSaving updated movie data...');
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2), 'utf8');
    console.log(`✓ Successfully saved updated data`);
    
    console.log(`\n=== BATCH COMPLETE ===`);
    console.log(`Processed: ${processed} movies`);
    console.log(`Successful: ${successful} movies`);
    console.log(`Remaining: ${moviesNeedingDescriptions.length - processed} movies`);
}

processMovies().catch(console.error);