# PowerShell script to create a fresh InitialCreate migration
# This will backup existing migrations and create a new consolidated migration

Write-Host "Creating fresh InitialCreate migration for production database setup..." -ForegroundColor Green

# Navigate to the Infrastructure project directory
Set-Location "ManitasCreativas.Infrastructure"

# Backup existing migrations
$migrationsPath = "Migrations"
$backupPath = "Migrations_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (Test-Path $migrationsPath) {
    Write-Host "Backing up existing migrations to $backupPath..." -ForegroundColor Yellow
    Copy-Item -Path $migrationsPath -Destination $backupPath -Recurse
    
    # Remove existing migrations except the snapshot
    Get-ChildItem -Path $migrationsPath -Name "*.cs" | Where-Object { $_ -ne "AppDbContextModelSnapshot.cs" } | ForEach-Object {
        Remove-Item -Path "$migrationsPath/$_" -Force
        Write-Host "Removed $_" -ForegroundColor Red
    }
    
    Get-ChildItem -Path $migrationsPath -Name "*.Designer.cs" | ForEach-Object {
        Remove-Item -Path "$migrationsPath/$_" -Force
        Write-Host "Removed $_" -ForegroundColor Red
    }
}

# Create new InitialCreate migration
Write-Host "Creating new InitialCreate migration..." -ForegroundColor Green
dotnet ef migrations add InitialCreate --startup-project ..\ManitasCreativas.WebApi --verbose

Write-Host "InitialCreate migration created successfully!" -ForegroundColor Green
Write-Host "Backup of previous migrations saved in: $backupPath" -ForegroundColor Yellow
