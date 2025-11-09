# 🚀 Quick Git Setup Guide for SmartJobMatchZM

## ⚡ Super Fast Setup (Recommended)

### Windows Users:
1. **Double-click** `INITIALIZE_GIT.bat`
2. Enter your GitHub username and email when prompted
3. Wait for completion
4. Follow the on-screen instructions

### Linux/Mac Users:
```bash
chmod +x initialize_git.sh
./initialize_git.sh
```

---

## 📋 Manual Setup (If Scripts Don't Work)

### Step 1: Initialize Git
Open terminal in project root and run:

```bash
git init
git config user.name "YourGitHubUsername"
git config user.email "your.email@example.com"
```

### Step 2: First Commit
```bash
git add .
git status  # Review what will be committed
git commit -m "Initial commit: SmartJobMatchZM project setup with FastAPI backend and React frontend"
git branch -M main
```

### Step 3: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `SmartJobMatchZM`
3. Description: `AI-Powered Job Matching Platform for Zambia`
4. Choose **Public** or **Private**
5. ⚠️ **DO NOT** check any boxes (README, .gitignore, license)
6. Click **"Create repository"**

### Step 4: Connect and Push

**Option A - HTTPS (Easier for beginners):**
```bash
git remote add origin https://github.com/YOUR_USERNAME/SmartJobMatchZM.git
git push -u origin main
```

**Option B - SSH (Better for frequent use):**
```bash
git remote add origin git@github.com:YOUR_USERNAME/SmartJobMatchZM.git
git push -u origin main
```

### Step 5: Create Development Branch (Optional but Recommended)
```bash
git checkout -b develop
git push -u origin develop
```

---

## ✅ Verify Setup

Check that everything worked:

```bash
git remote -v          # Should show your GitHub URL
git branch -a          # Should show main and develop
git log --oneline      # Should show your initial commit
```

Visit your repository on GitHub - you should see all your files!

---

## 🌿 Branching Strategy

### Main Branches
- `main` → Production-ready code (protected)
- `develop` → Active development

### Feature Branches
Create feature branches from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/matching-algorithm

# Make your changes...
git add .
git commit -m "feat(matching): implement hybrid skills matching"
git push -u origin feature/matching-algorithm

# Create Pull Request on GitHub
# After merge, update local:
git checkout develop
git pull origin develop
git branch -d feature/matching-algorithm
```

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation
- `test/description` - Test additions

Examples:
- `feature/job-search-api`
- `fix/auth-token-expiry`
- `refactor/matching-engine`
- `docs/api-endpoints`

---

## 📝 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, no code change
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

### Examples:
```bash
git commit -m "feat(api): add job matching endpoint"
git commit -m "fix(auth): resolve JWT token validation issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(matching): simplify scoring logic"
git commit -m "test(matching): add unit tests for skills matching"
```

---

## 🔄 Daily Workflow

```bash
# Morning: Update your local repo
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your code...
# Make changes, test, repeat

# Commit your changes
git add .
git status  # Review changes
git commit -m "feat(scope): description of what you did"

# Push to GitHub
git push -u origin feature/your-feature-name

# On GitHub:
# 1. Create Pull Request
# 2. Request review (if working in team)
# 3. Merge when approved

# Back locally: Clean up
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

---

## 🛠️ Useful Commands

### Checking Status
```bash
git status              # See what's changed
git log --oneline       # View commit history
git log --graph --all   # Visual branch history
git diff                # See unstaged changes
git diff --staged       # See staged changes
git branch -a           # List all branches
```

### Undoing Changes
```bash
git checkout -- file.py      # Discard changes in file
git reset HEAD file.py       # Unstage file
git reset --soft HEAD~1      # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (lose changes)
git revert <commit-hash>     # Create new commit that undoes changes
```

### Branch Management
```bash
git branch feature-name           # Create branch (don't switch)
git checkout -b feature-name      # Create and switch
git branch -d feature-name        # Delete local branch (safe)
git branch -D feature-name        # Force delete local branch
git push origin --delete feature  # Delete remote branch
```

### Syncing
```bash
git fetch origin          # Download changes (don't merge)
git pull origin main      # Download and merge changes
git pull --rebase origin main  # Rebase instead of merge
```

---

## 🚨 Common Issues & Solutions

### Issue: "Git is not recognized"
**Solution:** Install Git from [git-scm.com](https://git-scm.com/download/win)

### Issue: "Permission denied (publickey)"
**Solution:** Use HTTPS instead of SSH, or [set up SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Issue: "Repository not found"
**Solution:** Check your username and repository name are correct

### Issue: "Failed to push - rejected"
**Solution:** 
```bash
git pull origin main --rebase
git push origin main
```

### Issue: "Large files causing issues"
**Solution:** Use Git LFS:
```bash
git lfs install
git lfs track "*.csv"
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

---

## 📦 What's Tracked in Git

### ✅ Tracked (Committed to Git)
- All source code (`.py`, `.js`, `.jsx`)
- Configuration files (`.json`, `.yaml`)
- Documentation (`.md`)
- Project structure files
- `.gitignore`, `.gitattributes`
- Small datasets in `datasets/` folder
- Dependencies lists (`requirements.txt`, `package.json`)

### ❌ Not Tracked (In .gitignore)
- Virtual environments (`venv/`, `node_modules/`)
- Environment variables (`.env` files)
- Database files (`.db`, `.sqlite`)
- Python cache (`__pycache__/`, `*.pyc`)
- IDE settings (`.vscode/`, `.idea/`)
- Build outputs (`dist/`, `build/`)
- Log files (`*.log`)
- Uploaded files
- ML model caches

---

## 🎯 Next Steps After Setup

1. ✅ Initialize Git repo
2. ✅ Create GitHub repository  
3. ✅ Push initial commit
4. 🔄 Set up branch protection (Settings → Branches)
5. 🔄 Add repository description and topics
6. 🔄 Invite collaborators (if team project)
7. 🔄 Enable GitHub Actions (for CI/CD later)
8. 🚀 Start building features!

---

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)

---

## 🔒 Security Reminders

### Before Every Commit:
- ✅ Review `git status` carefully
- ✅ Check no `.env` files are included
- ✅ Verify no API keys or passwords in code
- ✅ Ensure sensitive data is in `.gitignore`

### Never Commit:
- API keys or tokens
- Database passwords
- Private keys
- Personal information
- Large binary files (use Git LFS)

---

## 💡 Pro Tips

1. **Commit Often**: Small, focused commits are better than large ones
2. **Write Good Messages**: Your future self will thank you
3. **Pull Before Push**: Always sync before pushing
4. **Use Branches**: Never commit directly to `main`
5. **Review Your Changes**: Use `git diff` before committing
6. **Keep It Clean**: Delete merged branches regularly

---

## 🎓 Learning Resources

### Beginner
- [Git Basics - Official Tutorial](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Hello World](https://guides.github.com/activities/hello-world/)

### Intermediate
- [Git Branching Strategy](https://nvie.com/posts/a-successful-git-branching-model/)
- [Interactive Git Tutorial](https://learngitbranching.js.org/)

### Advanced
- [Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

## ✨ Ready to Start?

Run one of these:

**Windows:**
```cmd
INITIALIZE_GIT.bat
```

**Linux/Mac:**
```bash
chmod +x initialize_git.sh
./initialize_git.sh
```

Then follow the on-screen instructions!

---

**Questions?** Check the [Git Documentation](https://git-scm.com/doc) or GitHub's [Help Center](https://docs.github.com/).

**Happy Coding! 🚀**
