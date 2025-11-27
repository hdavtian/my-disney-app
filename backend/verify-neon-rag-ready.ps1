# Verify Neon Database is RAG-Ready
# Checks if V4 migration (content_embeddings table, pgvector) exists in Neon

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Verify Neon Database is RAG-Ready" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Neon connection details
$neonHost = "ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech"
$neonDb = "disneyapp"
$neonUser = "neondb_owner"
$env:PGPASSWORD = "npg_YjoK0rwF2UIM"

Write-Host "Connecting to Neon database..." -ForegroundColor Yellow
Write-Host "Host: $neonHost" -ForegroundColor Gray
Write-Host "Database: $neonDb" -ForegroundColor Gray
Write-Host ""

# Check 1: pgvector extension
Write-Host "1. Checking pgvector extension..." -ForegroundColor Cyan
$pgvectorCheck = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

if ($pgvectorCheck -match "vector") {
    Write-Host "   ✓ pgvector extension installed" -ForegroundColor Green
    Write-Host "   $pgvectorCheck" -ForegroundColor Gray
} else {
    Write-Host "   ✗ pgvector extension NOT FOUND" -ForegroundColor Red
    Write-Host "   Run: CREATE EXTENSION vector;" -ForegroundColor Yellow
    $script:notReady = $true
}

Write-Host ""

# Check 2: content_embeddings table
Write-Host "2. Checking content_embeddings table..." -ForegroundColor Cyan
$tableCheck = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "\d content_embeddings" 2>&1

if ($tableCheck -match "embedding_id") {
    Write-Host "   ✓ content_embeddings table exists" -ForegroundColor Green
    
    # Count existing embeddings
    $count = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT COUNT(*) FROM content_embeddings;"
    Write-Host "   Existing embeddings: $count" -ForegroundColor Gray
} else {
    Write-Host "   ✗ content_embeddings table NOT FOUND" -ForegroundColor Red
    Write-Host "   V4 migration needs to be applied" -ForegroundColor Yellow
    $script:notReady = $true
}

Write-Host ""

# Check 3: Flyway migration status
Write-Host "3. Checking Flyway migration history..." -ForegroundColor Cyan
$flywayCheck = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;"

if ($flywayCheck -match "V4") {
    Write-Host "   ✓ V4 migration applied" -ForegroundColor Green
} else {
    Write-Host "   ⚠ V4 migration not in history (may need to run)" -ForegroundColor Yellow
}

Write-Host $flywayCheck -ForegroundColor Gray
Write-Host ""

# Check 4: Sample data count
Write-Host "4. Checking content data..." -ForegroundColor Cyan
$charCount = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT COUNT(*) FROM characters;"
$movieCount = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT COUNT(*) FROM movies;"
$parkCount = docker run --rm postgres:16 psql "postgresql://$neonUser@$neonHost/$neonDb?sslmode=require" -t -c "SELECT COUNT(*) FROM disney_parks;"

Write-Host "   Characters: $charCount" -ForegroundColor Gray
Write-Host "   Movies: $movieCount" -ForegroundColor Gray
Write-Host "   Parks: $parkCount" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
if ($script:notReady) {
    Write-Host "  STATUS: NOT READY FOR EMBEDDING GENERATION" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Deploy Spring Boot to Azure (will auto-run Flyway migrations)" -ForegroundColor White
    Write-Host "  2. OR manually apply V4 migration to Neon" -ForegroundColor White
    Write-Host "  3. Then run: .\quick-neon-embeddings.ps1" -ForegroundColor White
} else {
    Write-Host "  STATUS: READY FOR EMBEDDING GENERATION ✓" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next step:" -ForegroundColor Yellow
    Write-Host "  Run: .\quick-neon-embeddings.ps1" -ForegroundColor White
}

Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
