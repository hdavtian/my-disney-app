# Merge and Deduplicate Relationships Script
# Combines generated relationships with existing ones, removes errors

$ErrorActionPreference = "Stop"

Write-Host "Loading relationship files..." -ForegroundColor Cyan
$generated = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\temp\relationships_wip\generated_relationships.json" -Raw | ConvertFrom-Json
$existing = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\movie_characters_relationships.json" -Raw | ConvertFrom-Json

Write-Host "Loaded $($generated.Count) generated and $($existing.Count) existing relationships" -ForegroundColor Green

# Known errors to remove (wrong character-movie pairs)
$knownErrors = @(
    @{ movie = 'the_lion_king'; character = 'scarlet_witch' },  # Scarlet Witch not in Lion King
    @{ movie = 'the_nightmare_before_christmas'; character = 'captain_jack_sparrow' },  # Jack Sparrow not in Nightmare
    @{ movie = 'frozen_film'; character = 'han_solo' },  # Han Solo not in Frozen
    @{ movie = 'marvels_the_avengers'; character = 'captain_hook' },  # Captain Hook not in Avengers
    @{ movie = 'marvels_the_avengers'; character = 'black_panther' },  # Black Panther not in first Avengers
    @{ movie = 'monsters_inc'; character = 'oogie_boogie' },  # Oogie Boogie not in Monsters Inc
    @{ movie = 'superdad'; character = 'scarlet_witch' },  # Wrong movie
    @{ movie = 'superdad'; character = 'russell' },  # Russell is from Up
    @{ movie = 'superdad'; character = 'dug' },  # Dug is from Up
    @{ movie = 'star_wars_the_force_awakens'; character = 'thanos' }  # Thanos not in Star Wars
)

# Filter out errors from existing relationships
$cleanExisting = $existing | Where-Object {
    $rel = $_
    $isError = $false
    foreach ($knownError in $knownErrors) {
        if ($rel.movie_url_id -eq $knownError.movie -and $rel.character_url_id -eq $knownError.character) {
            $isError = $true
            break
        }
    }
    -not $isError
}

Write-Host "Removed $($existing.Count - $cleanExisting.Count) erroneous relationships" -ForegroundColor Yellow

# Combine all relationships
$allRelationships = @()
$allRelationships += $generated
$allRelationships += $cleanExisting

# Remove duplicates (same movie + character combination)
$uniqueRelationships = @{}
foreach ($rel in $allRelationships) {
    $key = "$($rel.movie_url_id)|$($rel.character_url_id)"
    if (-not $uniqueRelationships.ContainsKey($key)) {
        $uniqueRelationships[$key] = $rel
    } else {
        # If duplicate, prefer the one with better role assignment
        $existing = $uniqueRelationships[$key]
        if ($rel.character_role -eq 'protagonist' -and $existing.character_role -ne 'protagonist') {
            $uniqueRelationships[$key] = $rel
        }
    }
}

$finalRelationships = $uniqueRelationships.Values | Sort-Object movie_url_id, importance_level, sort_order

# Reassign sort_order per movie to ensure sequential ordering
$movieGroups = $finalRelationships | Group-Object movie_url_id
$reorderedRelationships = @()

foreach ($group in $movieGroups) {
    $sortOrder = 1
    foreach ($rel in ($group.Group | Sort-Object importance_level, character_role)) {
        $rel.sort_order = $sortOrder
        $reorderedRelationships += $rel
        $sortOrder++
    }
}

Write-Host "`nFinal counts:" -ForegroundColor Cyan
Write-Host "  Generated relationships: $($generated.Count)" -ForegroundColor White
Write-Host "  Clean existing relationships: $($cleanExisting.Count)" -ForegroundColor White
Write-Host "  Total after deduplication: $($reorderedRelationships.Count)" -ForegroundColor White
Write-Host "  Unique movie-character pairs: $($uniqueRelationships.Count)" -ForegroundColor White

# Save final output
$outputPath = "c:\sites\my-disney-app\backend\src\main\resources\database\movie_characters_relationships.json"
$reorderedRelationships | ConvertTo-Json -Depth 10 | Set-Content $outputPath

Write-Host "`nSaved updated relationships to: $outputPath" -ForegroundColor Green

# Show some statistics
$movieCount = ($reorderedRelationships | Select-Object -ExpandProperty movie_url_id -Unique).Count
$characterCount = ($reorderedRelationships | Select-Object -ExpandProperty character_url_id -Unique).Count

Write-Host "`nStatistics:" -ForegroundColor Cyan
Write-Host "  Movies with characters: $movieCount" -ForegroundColor White
Write-Host "  Characters in movies: $characterCount" -ForegroundColor White
Write-Host "  Average relationships per character: $([math]::Round($reorderedRelationships.Count / $characterCount, 2))" -ForegroundColor White
