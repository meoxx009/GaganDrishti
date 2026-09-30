# ==============================================================================
# GAGANDRISHTI: AUTOMATED ANTIGRAVITY <-> GITHUB CODE SYNCHRONIZATION SCRIPT
# ==============================================================================
param (
    [string]$CommitMessage = "feat: sync Antigravity updates to GitHub",
    [string]$RemoteBranch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🌾 GaganDrishti: Syncing Antigravity with GitHub Repository" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

# 1. Verify Git Installation
try {
    $gitVer = git --version
    Write-Host "[1/6] Git Installed: $gitVer" -ForegroundColor White
} catch {
    Write-Error "Git is not installed or not in PATH. Please install Git from https://git-scm.com/"
    exit 1
}

# 2. Check Remote Origin
$remotes = git remote -v
$targetRepo = "https://github.com/meoxx009/GaganDrishti.git"
if ($remotes -notmatch "origin") {
    Write-Host "[2/6] Setting remote origin to $targetRepo..." -ForegroundColor Yellow
    git remote add origin $targetRepo
} else {
    Write-Host "[2/6] Remote origin already configured." -ForegroundColor White
}

# 3. Ensure branch is main
$currentBranch = (git branch --show-current).Trim()
Write-Host "[3/6] Current branch: $currentBranch" -ForegroundColor White
if ($currentBranch -ne $RemoteBranch) {
    Write-Host "      Switching / Renaming to $RemoteBranch..." -ForegroundColor Yellow
    git branch -M $RemoteBranch
}

# 4. Stage Changes
Write-Host "[4/6] Staging all modified and new files (git add .)..." -ForegroundColor White
git add .

# 5. Check if there are changes to commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $fullMsg = "$CommitMessage ($timestamp)"
    Write-Host "[5/6] Committing changes: '$fullMsg'..." -ForegroundColor White
    git commit -m $fullMsg
} else {
    Write-Host "[5/6] Working directory clean. Nothing new to commit." -ForegroundColor Yellow
}

# 6. Push to GitHub
Write-Host "[6/6] Pushing code to GitHub ($targetRepo on $RemoteBranch)..." -ForegroundColor White
try {
    git push -u origin $RemoteBranch
    Write-Host "`n✅ Successfully synchronized GaganDrishti with GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/meoxx009/GaganDrishti" -ForegroundColor Cyan
} catch {
    Write-Host "`n⚠️ Push could not complete automatically." -ForegroundColor Yellow
    Write-Host "Possible reasons:" -ForegroundColor White
    Write-Host "1. Authentication required: Please provide your GitHub Personal Access Token (PAT) or setup SSH key."
    Write-Host "2. Remote branch has changes: Run 'git pull --rebase origin $RemoteBranch' first."
    Write-Host "`nSee docs/GITHUB_SYNC_GUIDE.md for detailed instructions." -ForegroundColor Cyan
}
