# PowerShell script to manually run V2 migration on Neon production database
# This is needed when Flyway version history is out of sync

# INSTRUCTIONS:
# 1. Get your Neon DATABASE_URL from Azure Container Apps environment variables
# 2. Replace the connection details below
# 3. Run this script: .\run-v2-migration-neon.ps1

# TODO: Replace these with your actual Neon credentials
$DB_HOST = "your-neon-host.neon.tech"  # e.g., "ep-cool-darkness-123456.us-east-2.aws.neon.tech"
$DB_NAME = "disneyapp"
$DB_USER = "disneyapp_owner"
$DB_PASSWORD = "your-password"
$DB_PORT = "5432"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Neon Production Database - V2 Migration Runner" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is installed
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlExists) {
    Write-Host "ERROR: psql is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install PostgreSQL client tools or use Neon SQL Editor instead" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Copy the SQL from V2__Create_movie_characters_junction_table.sql" -ForegroundColor Yellow
    Write-Host "and run it manually in Neon's SQL Editor at: https://console.neon.tech" -ForegroundColor Yellow
    exit 1
}

# Read V2 migration SQL
$migrationFile = "src\main\resources\db\migration\V2__Create_movie_characters_junction_table.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

$migrationSql = Get-Content $migrationFile -Raw

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Connecting to Neon database..." -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host "User: $DB_USER" -ForegroundColor Gray
Write-Host ""

# First, check if movie_characters table already exists
$checkTableQuery = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movie_characters');"
Write-Host "Checking if movie_characters table exists..." -ForegroundColor Yellow
$tableExists = psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -t -A -c $checkTableQuery

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to connect to database" -ForegroundColor Red
    Write-Host "Please verify your connection details" -ForegroundColor Yellow
    exit 1
}

if ($tableExists -eq "t") {
    Write-Host "✓ movie_characters table already exists - migration already applied!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now update flyway_schema_history to record V2:" -ForegroundColor Yellow
    
    # Check if flyway_schema_history exists
    $checkFlywayQuery = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flyway_schema_history');"
    $flywayExists = psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -t -A -c $checkFlywayQuery
    
    if ($flywayExists -eq "f") {
        Write-Host "Creating flyway_schema_history table..." -ForegroundColor Yellow
        $createFlywayTable = @"
CREATE TABLE flyway_schema_history (
    installed_rank INTEGER NOT NULL,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INTEGER,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    PRIMARY KEY (installed_rank)
);
"@
        psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c $createFlywayTable
    }
    
    # Record V1 and V2 in flyway history
    $recordMigrations = @"
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
VALUES 
    (1, '1', 'Create tables', 'SQL', 'V1__Create_tables.sql', NULL, 'manual', 0, true),
    (2, '2', 'Create movie characters junction table', 'SQL', 'V2__Create_movie_characters_junction_table.sql', NULL, 'manual', 0, true)
ON CONFLICT (installed_rank) DO NOTHING;
"@
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c $recordMigrations
    
    Write-Host "✓ Flyway history updated!" -ForegroundColor Green
} else {
    Write-Host "Running V2 migration..." -ForegroundColor Yellow
    
    # Run the migration
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ V2 migration executed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Now recording in flyway_schema_history..." -ForegroundColor Yellow
        
        # Record in flyway history
        $recordV2 = @"
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
VALUES (2, '2', 'Create movie characters junction table', 'SQL', 'V2__Create_movie_characters_junction_table.sql', NULL, 'manual', 0, true)
ON CONFLICT (installed_rank) DO NOTHING;
"@
        psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c $recordV2
        
        Write-Host "✓ Migration complete!" -ForegroundColor Green
    } else {
        Write-Host "✗ Migration failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Restart your Azure Container App to load new code" -ForegroundColor Yellow
Write-Host "2. Test the production site" -ForegroundColor Yellow
Write-Host "3. Call POST /api/admin/reseed-relationships to seed 80 relationships" -ForegroundColor Yellow
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
