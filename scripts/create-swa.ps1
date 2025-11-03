# Azure Static Web App Creation Script
# Run this in PowerShell with Azure CLI installed

# Variables
$RESOURCE_GROUP = "rg-disney-movies-app"
$SWA_NAME = "swa-movie-app-fe"
$LOCATION = "westus2"
$GITHUB_REPO = "hdavtian/my-disney-app"
$BRANCH = "main"
$APP_LOCATION = "/frontend"
$OUTPUT_LOCATION = "dist"

# Azure CLI path
$AZ_CMD = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

# Login to Azure (if not already logged in)
# & $AZ_CMD login

# Note: Using existing resource group 'rg-disney-movies-app' (already contains blob storage)

# Create Static Web App with GitHub integration
Write-Host "Creating Static Web App..." -ForegroundColor Cyan
& $AZ_CMD staticwebapp create `
  --name $SWA_NAME `
  --resource-group $RESOURCE_GROUP `
  --source $GITHUB_REPO `
  --location $LOCATION `
  --branch $BRANCH `
  --app-location $APP_LOCATION `
  --output-location $OUTPUT_LOCATION `
  --login-with-github

# Get the default hostname
Write-Host "`nStatic Web App created successfully!" -ForegroundColor Green
$SWA_HOSTNAME = & $AZ_CMD staticwebapp show `
  --name $SWA_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "defaultHostname" `
  --output tsv

Write-Host "`nDefault URL: https://$SWA_HOSTNAME" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to GoDaddy and add CNAME record:" -ForegroundColor White
Write-Host "   Type: CNAME" -ForegroundColor White
Write-Host "   Name: movie-app.disney" -ForegroundColor White
Write-Host "   Value: $SWA_HOSTNAME" -ForegroundColor White
Write-Host "   TTL: 600 (10 minutes)" -ForegroundColor White
Write-Host "`n2. After DNS propagates, add custom domain in Azure portal" -ForegroundColor White

# Get deployment token for GitHub Actions
Write-Host "`nRetrieving deployment token..." -ForegroundColor Cyan
$DEPLOYMENT_TOKEN = & $AZ_CMD staticwebapp secrets list `
  --name $SWA_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "properties.apiKey" `
  --output tsv

Write-Host "Deployment token (save this for GitHub Actions): $DEPLOYMENT_TOKEN" -ForegroundColor Yellow
