# Git Repository Setup Instructions

## 📋 Initial Git Setup

### 1. Initialize Git Repository

Open your terminal in the project root (`C:\Dev\ai-job-matchingV2`) and run:

```bash
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: Project setup with proper structure and documentation"
```

## 🌐 Connect to GitHub

### 1. Create Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `SmartJobMatchZM`
4. Description: `AI-Powered Job Matching Platform for Zambia`
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have them)
7. Click **"Create repository"**

### 2. Add Remote and Push

GitHub will show you commands. Use these:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/SmartJobMatchZM.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔐 Using SSH Instead (Recommended)

If you prefer SSH:

```bash
# Add SSH remote
git remote add origin git@github.com:YOUR_USERNAME/SmartJobMatchZM.git

# Push
git branch -M main
git push -u origin main
```

## 🌿 Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch (create from main)

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop
```

### Feature Branches
For new features:

```bash
# Create feature branch from develop
git checkout develop
git checkout -b feature/matching-algorithm

# Work on your feature...
git add .
git commit -m "feat(matching): implement hybrid skills matching"

# Push feature branch
git push -u origin feature/matching-algorithm
```

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/job-search`)
- `fix/` - Bug fixes (e.g., `fix/auth-token-expiry`)
- `refactor/` - Code refactoring (e.g., `refactor/matching-engine`)
- `docs/` - Documentation (e.g., `docs/api-guide`)
- `test/` - Adding tests (e.g., `test/matching-algorithm`)

## 📝 Commit Message Best Practices

Follow Conventional Commits:

```bash
# Format
<type>(<scope>): <subject>

# Examples
git commit -m "feat(api): add job matching endpoint"
git commit -m "fix(auth): resolve JWT token validation"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(matching): simplify scoring logic"
git commit -m "test(api): add integration tests for matching"
```

### Commit Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

## 🚀 Daily Workflow

```bash
# Start your day - update local repo
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature

# Make changes, then:
git add .
git commit -m "feat(scope): description"

# Push to GitHub
git push -u origin feature/your-feature

# Create Pull Request on GitHub
# After PR is approved and merged, update local:
git checkout develop
git pull origin develop

# Delete merged feature branch
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

## 🔄 Syncing with Remote

```bash
# Fetch latest changes
git fetch origin

# Update current branch
git pull origin main

# Update all branches
git fetch --all
git pull --all
```

## 🛠️ Useful Git Commands

### Status and Information
```bash
git status                 # Check current status
git log --oneline         # View commit history
git branch -a             # List all branches
git diff                  # See unstaged changes
```

### Undoing Changes
```bash
git checkout -- file.py   # Discard changes in file
git reset HEAD file.py    # Unstage file
git revert <commit>       # Revert a commit
git reset --soft HEAD~1   # Undo last commit (keep changes)
```

### Branch Management
```bash
git branch -d branch-name      # Delete local branch
git push origin --delete branch # Delete remote branch
git checkout -b new-branch     # Create and switch to branch
```

## 📦 Git LFS (for Large Files)

If you plan to track large files (models, datasets):

```bash
# Install Git LFS (Windows)
# Download from: https://git-lfs.github.com/

# Initialize Git LFS
git lfs install

# Track large file types (already in .gitattributes)
git lfs track "*.csv"
git lfs track "*.h5"
git lfs track "*.pkl"

# Verify tracking
git lfs ls-files

# Normal git workflow after that
git add .
git commit -m "Add large dataset files"
git push
```

## 🔒 .gitignore Best Practices

Already configured in `.gitignore`:
- ✅ Python cache files (`__pycache__/`, `*.pyc`)
- ✅ Virtual environments (`venv/`, `env/`)
- ✅ Environment variables (`.env`)
- ✅ IDE settings (`.vscode/`, `.idea/`)
- ✅ Node modules (`node_modules/`)
- ✅ Build outputs (`dist/`, `build/`)
- ✅ Database files (`*.db`, `*.sqlite`)
- ✅ Logs (`*.log`)
- ✅ OS files (`.DS_Store`, `Thumbs.db`)

## 🎯 Next Steps

1. ✅ Initialize Git repo
2. ✅ Create GitHub repository
3. ✅ Push initial commit
4. 🔄 Set up branch protection rules (optional)
5. 🔄 Enable GitHub Actions
6. 🔄 Start building features!

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git LFS](https://git-lfs.github.com/)

## ⚠️ Important Notes

### Before First Push
- Review all files with `git status`
- Check `.env` files are NOT included
- Verify sensitive data is not tracked
- Confirm `.gitignore` is working

### Security
- Never commit API keys or passwords
- Use environment variables for secrets
- Keep `.env` files in `.gitignore`
- Review commits before pushing

### Collaboration
- Always pull before starting work
- Create feature branches, not direct commits to main
- Write descriptive commit messages
- Keep commits small and focused
- Review your own PR before asking others

---

**Ready to push?** Follow the steps above and let's get your code on GitHub! 🚀
