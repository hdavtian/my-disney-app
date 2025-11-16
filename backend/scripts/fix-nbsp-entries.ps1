# Script to fix nbsp entries in disney_movies.json by extracting proper titles from source_url

$jsonPath = "../src/main/resources/database/disney_movies.json"
$content = Get-Content $jsonPath -Raw | ConvertFrom-Json

Write-Host "Finding nbsp entries..."

$modifiedCount = 0

for ($i = 0; $i -lt $content.Count; $i++) {
    $movie = $content[$i]
    
    # Check if this is an nbsp entry
    if ($movie.url_id -eq "nbsp" -or $movie.title -eq "&nbsp;") {
        Write-Host "`n[Index $i] Found nbsp entry:"
        Write-Host "  Source URL: $($movie.source_url)"
        Write-Host "  Year: $($movie.creation_year)"
        
        # Extract title from source_url
        if ($movie.source_url -match '/a-to-z/([^/]+)/?$') {
            $urlSlug = $matches[1]
            
            # Convert URL slug to proper title
            # Replace hyphens with spaces and title case
            $titleWords = $urlSlug -split '-' | ForEach-Object {
                if ($_ -match '^\d+$') {
                    $_  # Keep numbers as-is
                }
                elseif ($_.Length -eq 1) {
                    $_.ToUpper()  # Single letters uppercase
                }
                else {
                    # Title case
                    $_.Substring(0, 1).ToUpper() + $_.Substring(1).ToLower()
                }
            }
            $properTitle = $titleWords -join ' '
            
            # Special handling for common patterns
            $properTitle = $properTitle -replace '\bAnd\b', 'and'
            $properTitle = $properTitle -replace '\bThe\b', 'the'
            $properTitle = $properTitle -replace '\bOf\b', 'of'
            $properTitle = $properTitle -replace '\bIn\b', 'in'
            $properTitle = $properTitle -replace '\bA\b', 'a'
            $properTitle = $properTitle -replace '\bFor\b', 'for'
            $properTitle = $properTitle -replace '\bWith\b', 'with'
            $properTitle = $properTitle -replace '\bTo\b', 'to'
            
            # Fix first word to be capitalized
            if ($properTitle -match '^(the|a|an) (.+)$') {
                $properTitle = $matches[1].Substring(0, 1).ToUpper() + $matches[1].Substring(1) + ' ' + $matches[2]
            }
            
            # Generate url_id (lowercase, underscores)
            $newUrlId = $urlSlug -replace '-', '_'
            
            Write-Host "  -> Title: '$properTitle'"
            Write-Host "  -> URL ID: '$newUrlId'"
            
            $movie.title = $properTitle
            $movie.url_id = $newUrlId
            $modifiedCount++
        }
        else {
            Write-Host "  WARNING: Could not extract title from source_url"
        }
    }
}

# Save back to file with proper formatting
$content | ConvertTo-Json -Depth 100 | Set-Content $jsonPath -Encoding UTF8

Write-Host "`n==================================="
Write-Host "nbsp fix complete!"
Write-Host "Modified $modifiedCount movies"
Write-Host "Total movies: $($content.Count)"
Write-Host "==================================="
