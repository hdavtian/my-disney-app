# Incremental Relationship Update Script
# Run this after updating franchise fields to add new relationships without losing existing ones

$ErrorActionPreference = "Stop"

Write-Host "=== Incremental Movie-Character Relationship Update ===" -ForegroundColor Cyan
Write-Host ""

# Load data files
Write-Host "Loading data files..." -ForegroundColor Cyan
$characters = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\disney_characters.json" -Raw | ConvertFrom-Json
$movies = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\disney_movies.json" -Raw | ConvertFrom-Json
$existingRelationships = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\movie_characters_relationships.json" -Raw | ConvertFrom-Json

Write-Host "Loaded $($characters.Count) characters, $($movies.Count) movies, $($existingRelationships.Count) existing relationships" -ForegroundColor Green

# Character role determination
function Get-CharacterRole {
    param([string]$characterUrlId)
    
    $protagonists = @('aladdin', 'alice', 'anna', 'ariel', 'aurora', 'belle', 'cinderella',
        'elsa', 'jasmine', 'moana', 'mulan', 'pocahontas', 'rapunzel', 'tiana',
        'simba', 'woody', 'buzz_lightyear', 'lightning_mcqueen', 'sulley', 'mike_wazowski',
        'merida', 'judy_hopps', 'miguel', 'raya', 'mirabel', 'peter_pan', 'bambi',
        'mowgli', 'robin_hood', 'basil', 'oliver', 'hercules', 'tarzan', 'kuzco',
        'milo', 'jim_hawkins', 'kenai', 'lewis', 'bolt', 'ralph', 'hiro', 'arlo',
        'nick_wilde', 'moana', 'ian', 'barley', 'joe_gardner', 'luca', 'mei_lee')
    
    $antagonists = @('ursula', 'jafar', 'gaston', 'scar', 'maleficent', 'cruella', 'hades',
        'shan_yu', 'captain_hook', 'queen_of_hearts', 'evil_queen', 'hans',
        'syndrome', 'lots_o_huggin_bear', 'darth_vader', 'kylo_ren', 'thanos',
        'loki', 'ultron', 'hela', 'killmonger', 'zemo', 'yzma', 'ratcliffe',
        'frollo', 'clayton', 'rourke', 'gantu', 'bowler_hat_guy', 'dr_facilier',
        'king_candy', 'bellwether', 'tamatoa', 'ernesto', 'screenslaver', 'namaari')
    
    $sidekicks = @('flounder', 'sebastian', 'timon', 'pumbaa', 'mushu', 'olaf', 'pascal',
        'sven', 'dug', 'abu', 'iago', 'meeko', 'flit', 'cri_kee', 'heihei',
        'pua', 'tuk_tuk', 'dante', 'rex', 'hamm', 'slinky', 'bullseye', 'aliens',
        'mater', 'luigi', 'guido', 'fillmore', 'sarge', 'ramone', 'flo',
        'baymax', 'wasabi', 'honey_lemon', 'go_go', 'fred', 'hei_hei', 'pua')
    
    if ($protagonists -contains $characterUrlId) {
        return @{ role = 'protagonist'; importance = 1 }
    } elseif ($antagonists -contains $characterUrlId) {
        return @{ role = 'antagonist'; importance = 1 }
    } elseif ($sidekicks -contains $characterUrlId) {
        return @{ role = 'sidekick'; importance = 2 }
    } else {
        return @{ role = 'supporting'; importance = 2 }
    }
}

# Fuzzy match function
function Test-FranchiseMatch {
    param(
        [string]$franchise,
        [string]$movieTitle
    )
    
    if ([string]::IsNullOrWhiteSpace($franchise)) { return $false }
    
    $normFranchise = $franchise.ToLower() -replace '[^\w\s]', '' -replace '\s+', ' '
    $normTitle = $movieTitle.ToLower() -replace '[^\w\s]', '' -replace '\s+', ' '
    
    if ($normTitle -like "*$normFranchise*") { return $true }
    if ($normFranchise -like "*$normTitle*") { return $true }
    
    $franchiseNoThe = $normFranchise -replace '^the\s+', ''
    $titleNoThe = $normTitle -replace '^the\s+', ''
    
    if ($titleNoThe -like "*$franchiseNoThe*") { return $true }
    if ($franchiseNoThe -like "*$titleNoThe*") { return $true }
    
    $franchiseWords = $normFranchise -split '\s+'
    $titleWords = $normTitle -split '\s+'
    
    $matchCount = 0
    foreach ($word in $franchiseWords) {
        if ($word.Length -gt 3 -and $titleWords -contains $word) {
            $matchCount++
        }
    }
    
    if ($franchiseWords.Count -gt 0 -and $matchCount / $franchiseWords.Count -ge 0.6) {
        return $true
    }
    
    return $false
}

# Build new relationships
$newRelationships = @()
$matchedCharacters = 0

Write-Host "`nGenerating relationships..." -ForegroundColor Cyan

foreach ($character in $characters) {
    $franchise = $character.franchise
    if ([string]::IsNullOrWhiteSpace($franchise)) {
        continue
    }
    
    $matchingMovies = @()
    foreach ($movie in $movies) {
        if (Test-FranchiseMatch -franchise $franchise -movieTitle $movie.title) {
            $matchingMovies += $movie
        }
    }
    
    if ($matchingMovies.Count -eq 0) {
        continue
    }
    
    $matchedCharacters++
    $roleInfo = Get-CharacterRole -characterUrlId $character.url_id
    
    foreach ($movie in $matchingMovies) {
        $newRelationships += [PSCustomObject]@{
            movie_url_id = $movie.url_id
            character_url_id = $character.url_id
            character_role = $roleInfo.role
            importance_level = $roleInfo.importance
            sort_order = 1
        }
    }
}

Write-Host "Generated $($newRelationships.Count) relationships" -ForegroundColor Green

# Merge with existing (deduplicate)
Write-Host "`nMerging with existing relationships..." -ForegroundColor Cyan
$allRelationships = @()
$allRelationships += $existingRelationships
$allRelationships += $newRelationships

$uniqueRelationships = @{}
foreach ($rel in $allRelationships) {
    if ([string]::IsNullOrWhiteSpace($rel.movie_url_id)) { continue }
    
    $key = "$($rel.movie_url_id)|$($rel.character_url_id)"
    if (-not $uniqueRelationships.ContainsKey($key)) {
        $uniqueRelationships[$key] = $rel
    }
}

$finalRelationships = $uniqueRelationships.Values | Sort-Object movie_url_id, importance_level

# Reassign sort_order per movie
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

# Calculate changes
$newCount = $reorderedRelationships.Count - $existingRelationships.Count

Write-Host "`nResults:" -ForegroundColor Cyan
Write-Host "  Previous: $($existingRelationships.Count) relationships" -ForegroundColor White
Write-Host "  New total: $($reorderedRelationships.Count) relationships" -ForegroundColor White
Write-Host "  Added: $newCount new relationships" -ForegroundColor $(if ($newCount -gt 0) { 'Green' } else { 'Yellow' })

# Save
$outputPath = "c:\sites\my-disney-app\backend\src\main\resources\database\movie_characters_relationships.json"
$reorderedRelationships | ConvertTo-Json -Depth 10 | Set-Content $outputPath

Write-Host "`nSaved to: $outputPath" -ForegroundColor Green
