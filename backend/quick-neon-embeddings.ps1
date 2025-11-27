# Quick Neon Embedding Generation
# Automated script that generates embeddings on Neon database

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Neon Database - Quick Embedding Generation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Neon connection details
$neonUrl = "jdbc:postgresql://ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech:5432/disneyapp?sslmode=require"
$apiKey = "xrn5gEMTwUWHtbLDSlvqY9f6sGAo71iB"

Write-Host "Step 1: Starting Spring Boot with Neon connection..." -ForegroundColor Green
Write-Host "Database: $neonUrl" -ForegroundColor Yellow
Write-Host ""

# Start Spring Boot in background
$env:DATABASE_URL = $neonUrl
$env:DATABASE_USERNAME = "neondb_owner"
$env:DATABASE_PASSWORD = "npg_YjoK0rwF2UIM"
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:ADMIN_API_KEY = $apiKey
$env:GOOGLE_GEMINI_API_KEY = "AIzaSyCgC7uviylEtYcI90V6mA-JsXOi-2ET0OI"

$job = Start-Job -ScriptBlock {
    param($scriptRoot)
    cd $scriptRoot
    mvn spring-boot:run 2>&1
} -ArgumentList $PSScriptRoot

Write-Host "Waiting for Spring Boot to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Step 2: Triggering embedding generation..." -ForegroundColor Green
Write-Host ""

try {
    $headers = @{
        "Content-Type" = "application/json"
        "X-Admin-API-Key" = $apiKey
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/embeddings/generate" -Method Post -Headers $headers -TimeoutSec 600
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Embeddings Generated" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
} finally {
    Write-Host ""
    Write-Host "Step 3: Stopping Spring Boot..." -ForegroundColor Yellow
    Stop-Job -Job $job
    Remove-Job -Job $job -Force
    
    # Clean up environment variables
    Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\DATABASE_USERNAME -ErrorAction SilentlyContinue
    Remove-Item Env:\DATABASE_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:\SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
    Remove-Item Env:\ADMIN_API_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:\GOOGLE_GEMINI_API_KEY -ErrorAction SilentlyContinue
    
    Write-Host "Done!" -ForegroundColor Green
    Write-Host ""
}
