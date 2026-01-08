# GitHub Preparation Script for CAMSS 2.0
# Cleans up temporary files and prepares repository for GitHub push

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CAMSS 2.0 - GitHub Preparation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$projectRoot = Get-Location

# Files to delete (temporary documentation and scripts)
$filesToDelete = @(
    "ALL-FIXES-COMPLETE.md",
    "ANALYTICS_FIXES.md",
    "DASHBOARD_IMPROVEMENTS.md",
    "FIXES-APPLIED.md",
    "Context.txt",
    "tree.txt",
    "setup_save_feature.bat",
    "START-APP.bat",
    "push-to-github.bat",
    "QUICK-START.md",
    "PRE-PUSH-CHECKLIST.md"
)

# Step 1: Delete temporary files
Write-Host "[1/5] Deleting temporary files..." -ForegroundColor Yellow

$deletedCount = 0
foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "  Deleted: $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "  Failed to delete: $file" -ForegroundColor Red
        }
    }
}

Write-Host "  Deleted $deletedCount files`n" -ForegroundColor Green

# Step 2: Security checks
Write-Host "[2/5] Running security checks..." -ForegroundColor Yellow

# Check if .env is tracked
$envTracked = git ls-files | Select-String -Pattern "\.env$"
if ($envTracked) {
    Write-Host "  WARNING: .env file is tracked by Git!" -ForegroundColor Red
    Write-Host "  Run: git rm --cached .env" -ForegroundColor Yellow
} else {
    Write-Host "  .env file is not tracked (Good)" -ForegroundColor Green
}

# Check if node_modules is tracked
$nodeTracked = git ls-files | Select-String -Pattern "node_modules"
if ($nodeTracked) {
    Write-Host "  WARNING: node_modules is tracked!" -ForegroundColor Red
} else {
    Write-Host "  node_modules is not tracked (Good)" -ForegroundColor Green
}

# Check if venv is tracked
$venvTracked = git ls-files | Select-String -Pattern "venv"
if ($venvTracked) {
    Write-Host "  WARNING: venv is tracked!" -ForegroundColor Red
} else {
    Write-Host "  venv is not tracked (Good)" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check for large files
Write-Host "[3/5] Checking for large files..." -ForegroundColor Yellow

$largeFiles = git ls-files | ForEach-Object {
    $size = (Get-Item $_).Length / 1MB
    if ($size -gt 50) {
        [PSCustomObject]@{
            File = $_
            Size = [math]::Round($size, 2)
        }
    }
} | Sort-Object Size -Descending

if ($largeFiles) {
    Write-Host "  WARNING: Large files detected (>50MB):" -ForegroundColor Red
    $largeFiles | ForEach-Object {
        Write-Host "    $($_.File): $($_.Size) MB" -ForegroundColor Yellow
    }
} else {
    Write-Host "  No large files detected (Good)" -ForegroundColor Green
}

Write-Host ""

# Step 4: Repository statistics
Write-Host "[4/5] Repository statistics..." -ForegroundColor Yellow

$trackedFiles = (git ls-files | Measure-Object).Count
$totalSize = [math]::Round(((git ls-files | ForEach-Object { (Get-Item $_).Length } | Measure-Object -Sum).Sum / 1MB), 2)

Write-Host "  Tracked files: $trackedFiles" -ForegroundColor Cyan
Write-Host "  Total size: $totalSize MB" -ForegroundColor Cyan

# Check current branch
$currentBranch = git branch --show-current
Write-Host "  Current branch: $currentBranch" -ForegroundColor Cyan

# Check if there's a remote
$remotes = git remote -v
if ($remotes) {
    Write-Host "  Remote configured: Yes" -ForegroundColor Green
} else {
    Write-Host "  Remote configured: No" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Git status
Write-Host "[5/5] Current Git status..." -ForegroundColor Yellow
Write-Host ""

git status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PREPARATION COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git status" -ForegroundColor White
Write-Host "  2. Stage changes: git add ." -ForegroundColor White
Write-Host "  3. Commit: git commit -m `"Initial commit: AI-powered job matching platform`"" -ForegroundColor White
Write-Host ""
Write-Host "  4. Create repository on GitHub, then:" -ForegroundColor White
Write-Host "     git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor White
Write-Host "     git branch -M main" -ForegroundColor White
Write-Host "     git push -u origin main" -ForegroundColor White
Write-Host ""

# Pause
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
