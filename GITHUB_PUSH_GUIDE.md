# GitHub Push Guide

## Quick Start

### Option 1: Using Batch File (Easiest)
```cmd
cd C:\Dev\ai-job-matchingV2
run-github-prep.bat
```

### Option 2: Using PowerShell Directly
```powershell
cd C:\Dev\ai-job-matchingV2
powershell -ExecutionPolicy Bypass -File prepare-for-github.ps1
```

### Option 3: Manual Commands
```cmd
cd C:\Dev\ai-job-matchingV2

# Review what will be committed
git status

# Stage all changes
git add .

# Commit
git commit -m "Initial commit: AI-powered job matching platform"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push
git push -u origin main
```

## What the Cleanup Script Does

### 1. Deletes Temporary Files
- ALL-FIXES-COMPLETE.md
- ANALYTICS_FIXES.md
- DASHBOARD_IMPROVEMENTS.md
- FIXES-APPLIED.md
- Context.txt
- tree.txt
- setup_save_feature.bat
- START-APP.bat
- push-to-github.bat
- QUICK-START.md
- PRE-PUSH-CHECKLIST.md

### 2. Security Checks
- Verifies .env is not tracked
- Verifies node_modules is not tracked
- Verifies venv is not tracked
- Checks for large files (>50MB)

### 3. Repository Statistics
- Shows number of tracked files
- Shows total repository size
- Shows current branch
- Shows remote configuration

### 4. Git Status
- Displays current changes
- Shows what will be committed

## Security Verification

### Files That WILL NOT Be Pushed (Protected by .gitignore)

**Environment & Secrets:**
- .env (contains database password)
- secrets.json
- API keys
- .pem files

**Dependencies:**
- node_modules/
- venv/
- __pycache__/

**User Data:**
- uploads/
- exports/
- *_export.csv

**Logs:**
- *.log
- logs/

**Large Files:**
- *.h5, *.pkl (ML models)
- embeddings/

**Temporary:**
- *.tmp, *.temp
- *.bak

### Verify Before Pushing

1. Check .env is not tracked:
```cmd
git ls-files | findstr .env
```
Should return nothing

2. Check node_modules is not tracked:
```cmd
git ls-files | findstr node_modules
```
Should return nothing

## Creating GitHub Repository

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `camss-job-matching` (or your choice)
3. Description: "AI-powered job matching platform for Zambia"
4. Choose Public or Private
5. DO NOT initialize with README (you already have one)
6. Click "Create repository"

### Step 2: Connect Local Repository
```cmd
cd C:\Dev\ai-job-matchingV2

# Add remote (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin main
```

If you get an error about branch name:
```cmd
# Rename branch to main if needed
git branch -M main

# Then push
git push -u origin main
```

## Troubleshooting

### Issue: "fatal: not a git repository"
```cmd
git init
git add .
git commit -m "Initial commit"
```

### Issue: "remote origin already exists"
```cmd
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Issue: "failed to push some refs"
```cmd
# Pull first if repository has files
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

### Issue: PowerShell Execution Policy Error
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or use bypass (temporary)
powershell -ExecutionPolicy Bypass -File prepare-for-github.ps1
```

### Issue: Large files rejected
```cmd
# Find large files
git ls-files | findstr /R "\.pkl$ \.h5$ \.model$"

# Remove from tracking
git rm --cached path/to/large/file

# Add to .gitignore
echo path/to/large/file >> .gitignore

# Commit changes
git add .gitignore
git commit -m "Remove large files"
```

## After Pushing

### Verify Upload
1. Visit your GitHub repository
2. Check README.md displays correctly
3. Verify .env is NOT visible
4. Check file count matches local repository

### Set Up GitHub Features

**Enable Issues:**
Settings > Features > Issues (check)

**Add Topics:**
Settings > Topics > Add:
- job-matching
- machine-learning
- fastapi
- react-native
- zambia
- recruitment
- ai

**Add Description:**
"AI-powered job matching platform for the Zambian labor market using hybrid BM25 + SBERT matching"

**Add Website:**
(Your deployment URL if available)

### Create .github/workflows for CI/CD (Optional)
```yaml
# .github/workflows/backend-tests.yml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/
```

## Next Steps

1. Run the cleanup script
2. Review changes with `git status`
3. Create GitHub repository
4. Push to GitHub
5. Set up GitHub features
6. Share with team/community

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Review the Troubleshooting section above
3. Check Git documentation: https://git-scm.com/doc
4. Check GitHub documentation: https://docs.github.com

---

Last Updated: December 2024
