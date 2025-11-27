# Generate Embeddings for Neon Production Database
# This script connects to Neon and generates embeddings for all content

# Neon connection details
$env:DATABASE_URL = "jdbc:postgresql://ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech:5432/disneyapp?sslmode=require"
$env:DATABASE_USERNAME = "neondb_owner"
$env:DATABASE_PASSWORD = "npg_YjoK0rwF2UIM"
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:ADMIN_API_KEY = "xrn5gEMTwUWHtbLDSlvqY9f6sGAo71iB"
$env:GOOGLE_GEMINI_API_KEY = "AIzaSyCgC7uviylEtYcI90V6mA-JsXOi-2ET0OI"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Generate Embeddings for Neon Database" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Profile: prod" -ForegroundColor Yellow
Write-Host "Database: Neon PostgreSQL" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor Green
Write-Host "  1. Start Spring Boot connected to Neon" -ForegroundColor White
Write-Host "  2. Wait for you to call the embedding generation endpoint" -ForegroundColor White
Write-Host "  3. Generate embeddings for characters, movies, and parks" -ForegroundColor White
Write-Host ""
Write-Host "After Spring Boot starts, run this in another terminal:" -ForegroundColor Magenta
Write-Host ""
Write-Host '  $headers = @{' -ForegroundColor Gray
Write-Host '    "Content-Type" = "application/json"' -ForegroundColor Gray
Write-Host '    "X-Admin-API-Key" = "xrn5gEMTwUWHtbLDSlvqY9f6sGAo71iB"' -ForegroundColor Gray
Write-Host '  }' -ForegroundColor Gray
Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/api/admin/embeddings/generate" -Method Post -Headers $headers' -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to start Spring Boot"

# Run Spring Boot
cd $PSScriptRoot
mvn spring-boot:run

# Clean up environment variables
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\DATABASE_USERNAME -ErrorAction SilentlyContinue
Remove-Item Env:\DATABASE_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
Remove-Item Env:\ADMIN_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\GOOGLE_GEMINI_API_KEY -ErrorAction SilentlyContinue
