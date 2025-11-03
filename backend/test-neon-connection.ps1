# Test Neon Database Connection
# This script runs Spring Boot with prod profile pointing to Neon

# Set your Neon connection details (replace with your actual values)
$env:DATABASE_URL = "jdbc:postgresql://ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech:5432/disneyapp?sslmode=require"
$env:DATABASE_USERNAME = "neondb_owner"
$env:DATABASE_PASSWORD = "npg_YjoK0rwF2UIM"
$env:SPRING_PROFILES_ACTIVE = "prod"

Write-Host "Testing connection to Neon database..." -ForegroundColor Green
Write-Host "Profile: prod" -ForegroundColor Yellow
Write-Host "Database: $env:DATABASE_URL" -ForegroundColor Yellow

# Run Spring Boot
cd $PSScriptRoot
mvn spring-boot:run

# Clean up environment variables
Remove-Item Env:\DATABASE_URL
Remove-Item Env:\DATABASE_USERNAME
Remove-Item Env:\DATABASE_PASSWORD
Remove-Item Env:\SPRING_PROFILES_ACTIVE
