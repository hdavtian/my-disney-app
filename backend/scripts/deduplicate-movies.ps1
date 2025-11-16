# Script to deduplicate movies in disney_movies.json by adding year suffixes to duplicate url_ids

$jsonPath = "../src/main/resources/database/disney_movies.json"
$content = Get-Content $jsonPath -Raw | ConvertFrom-Json

Write-Host "Analyzing duplicates..."

# First pass: identify all duplicates
$urlIdGroups = @{}
for ($i = 0; $i -lt $content.Count; $i++) {
    $movie = $content[$i]
    $urlId = $movie.url_id
    
    if ([string]::IsNullOrWhiteSpace($urlId) -or $urlId -eq "nbsp") {
        continue
    }
    
    if (-not $urlIdGroups.ContainsKey($urlId)) {
        $urlIdGroups[$urlId] = @()
    }
    $urlIdGroups[$urlId] += $i
}

# Second pass: add year suffix to ALL duplicates (including first occurrence)
$modifiedCount = 0
foreach ($urlId in $urlIdGroups.Keys) {
    $indices = $urlIdGroups[$urlId]
    
    # Only process if there are duplicates
    if ($indices.Count -gt 1) {
        Write-Host "`nProcessing duplicate url_id: '$urlId' ($($indices.Count) entries)"
        
        foreach ($idx in $indices) {
            $movie = $content[$idx]
            if ($movie.creation_year) {
                $newUrlId = "${urlId}_$($movie.creation_year)"
                Write-Host "  [$idx] '$urlId' -> '$newUrlId' (Title: $($movie.title), Year: $($movie.creation_year))"
                $movie.url_id = $newUrlId
                $modifiedCount++
            }
            else {
                Write-Host "  [$idx] WARNING: No creation_year for '$($movie.title)'"
            }
        }
    }
}

# Save back to file with proper formatting
$content | ConvertTo-Json -Depth 100 | Set-Content $jsonPath -Encoding UTF8

Write-Host "`n==================================="
Write-Host "Deduplication complete!"
Write-Host "Modified $modifiedCount movies"
Write-Host "Total movies: $($content.Count)"
Write-Host "==================================="
