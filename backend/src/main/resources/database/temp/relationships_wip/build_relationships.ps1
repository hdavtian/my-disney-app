# Improved Movie-Character Relationship Builder Script
# This script creates comprehensive character-movie relationships

$ErrorActionPreference = "Stop"

Write-Host "Loading data files..." -ForegroundColor Cyan
$characters = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\disney_characters.json" -Raw | ConvertFrom-Json
$movies = Get-Content "c:\sites\my-disney-app\backend\src\main\resources\database\disney_movies.json" -Raw | ConvertFrom-Json

Write-Host "Loaded $($characters.Count) characters, $($movies.Count) movies" -ForegroundColor Green

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
    
    # Normalize strings for comparison
    $normFranchise = $franchise.ToLower() -replace '[^\w\s]', '' -replace '\s+', ' '
    $normTitle = $movieTitle.ToLower() -replace '[^\w\s]', '' -replace '\s+', ' '
    
    # Direct match
    if ($normTitle -like "*$normFranchise*") { return $true }
    if ($normFranchise -like "*$normTitle*") { return $true }
    
    # Remove "The" prefix and try again
    $franchiseNoThe = $normFranchise -replace '^the\s+', ''
    $titleNoThe = $normTitle -replace '^the\s+', ''
    
    if ($titleNoThe -like "*$franchiseNoThe*") { return $true }
    if ($franchiseNoThe -like "*$titleNoThe*") { return $true }
    
    # Check if franchise is a significant part of title
    $franchiseWords = $normFranchise -split '\s+'
    $titleWords = $normTitle -split '\s+'
    
    $matchCount = 0
    foreach ($word in $franchiseWords) {
        if ($word.Length -gt 3 -and $titleWords -contains $word) {
            $matchCount++
        }
    }
    
    # If most significant words match, consider it a match
    if ($franchiseWords.Count -gt 0 -and $matchCount / $franchiseWords.Count -ge 0.6) {
        return $true
    }
    
    return $false
}

# Build relationships
$relationships = @()
$matchedCharacters = 0
$totalMatches = 0

Write-Host "`nBuilding relationships..." -ForegroundColor Cyan

foreach ($character in $characters) {
    $franchise = $character.franchise
    if ([string]::IsNullOrWhiteSpace($franchise)) {
        continue
    }
    
    # Find all matching movies
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
    
    # Create relationship for each matching movie
    $sortOrder = 1
    foreach ($movie in $matchingMovies) {
        $relationships += [PSCustomObject]@{
            movie_url_id = $movie.url_id
            character_url_id = $character.url_id
            character_role = $roleInfo.role
            importance_level = $roleInfo.importance
            sort_order = $sortOrder
        }
        $sortOrder++
        $totalMatches++
    }
    
    if ($matchedCharacters % 20 -eq 0) {
        Write-Host "Processed $matchedCharacters characters, $totalMatches relationships..." -ForegroundColor Yellow
    }
}

Write-Host "`nGenerated $($relationships.Count) relationships from $matchedCharacters characters" -ForegroundColor Green

# Save to temp file
$outputPath = "c:\sites\my-disney-app\backend\src\main\resources\database\temp\relationships_wip\generated_relationships.json"
$relationships | ConvertTo-Json -Depth 10 | Set-Content $outputPath
Write-Host "Saved to: $outputPath" -ForegroundColor Green

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Characters matched: $matchedCharacters / $($characters.Count)" -ForegroundColor White
Write-Host "  Total relationships: $($relationships.Count)" -ForegroundColor White
