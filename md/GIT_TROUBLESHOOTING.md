# 🔧 Git Troubleshooting Guide - SmartJobMatchZM

Quick solutions to common Git problems you might encounter.

---

## 🚨 Common Errors & Solutions

### 1. "git is not recognized as an internal or external command"

**Problem:** Git is not installed or not in your system PATH.

**Solution:**
```bash
# Windows: Download and install from
https://git-scm.com/download/win

# During installation, make sure to select:
☑ "Git from the command line and also from 3rd-party software"

# After installation, restart your terminal/Command Prompt

# Verify installation:
git --version
```

---

### 2. "Permission denied (publickey)"

**Problem:** Trying to use SSH without setting up SSH keys.

**Solution Option A - Use HTTPS instead:**
```bash
# Remove SSH remote
git remote remove origin

# Add HTTPS remote
git remote add origin https://github.com/YOUR_USERNAME/SmartJobMatchZM.git
```

**Solution Option B - Set up SSH keys:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one)

# Copy public key (Windows)
type %USERPROFILE%\.ssh\id_ed25519.pub

# Copy public key (Linux/Mac)
cat ~/.ssh/id_ed25519.pub

# Go to GitHub → Settings → SSH Keys → New SSH Key
# Paste the key and save

# Test connection
ssh -T git@github.com
```

---

### 3. "fatal: remote origin already exists"

**Problem:** Trying to add a remote when one already exists.

**Solution:**
```bash
# View existing remotes
git remote -v

# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/SmartJobMatchZM.git

# Verify
git remote -v
```

---

### 4. "fatal: refusing to merge unrelated histories"

**Problem:** Local and remote repositories have different initial commits.

**Solution:**
```bash
# Pull with flag to allow unrelated histories
git pull origin main --allow-unrelated-histories

# If there are conflicts, resolve them
# Then commit the merge
git commit -m "Merge remote and local repositories"

# Push to remote
git push origin main
```

---

### 5. "error: failed to push some refs"

**Problem:** Remote has changes you don't have locally.

**Solution:**
```bash
# Pull the latest changes first
git pull origin main

# If using rebase (cleaner history):
git pull --rebase origin main

# Resolve any conflicts if they appear
# Then push
git push origin main
```

---

### 6. "Your branch is ahead of 'origin/main' by X commits"

**Problem:** You have local commits not pushed to GitHub.

**Solution:**
```bash
# Push your commits
git push origin main

# If rejected, pull first then push
git pull origin main
git push origin main
```

---

### 7. "fatal: not a git repository"

**Problem:** You're not in a Git repository folder.

**Solution:**
```bash
# Check current directory
pwd  # Linux/Mac
cd   # Windows

# Navigate to your project
cd C:\Dev\ai-job-matchingV2

# Verify it's a Git repo
git status

# If not initialized:
git init
```

---

### 8. Large file causing issues (>100MB)

**Problem:** GitHub rejects pushes with files over 100MB.

**Solution Option A - Remove from history:**
```bash
# Remove file from Git (keep locally)
git rm --cached path/to/large/file

# Add to .gitignore
echo "path/to/large/file" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove large file from tracking"
```

**Solution Option B - Use Git LFS:**
```bash
# Install Git LFS
# Windows: Download from https://git-lfs.github.com/
# Linux: sudo apt-get install git-lfs
# Mac: brew install git-lfs

# Initialize Git LFS
git lfs install

# Track large file types
git lfs track "*.psd"
git lfs track "*.zip"

# Add .gitattributes
git add .gitattributes

# Add and commit large files
git add large-file.psd
git commit -m "Add large file with LFS"
git push
```

---

### 9. Accidentally committed .env file with secrets

**Problem:** Sensitive data pushed to GitHub.

**Solution:**
```bash
# IMMEDIATELY remove from Git history
git rm --cached .env

# Add to .gitignore
echo ".env" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove .env from tracking"

# Force push (WARNING: Only if you're the only one working on this)
git push -f origin main

# IMPORTANT: Rotate all exposed API keys/passwords immediately!
```

---

### 10. "detached HEAD state"

**Problem:** Git says you're in "detached HEAD state".

**Solution:**
```bash
# Create a new branch from current state
git checkout -b temp-branch

# Or just go back to main
git checkout main

# Or go to specific branch
git checkout develop
```

---

### 11. Merge conflict

**Problem:** Git can't automatically merge changes.

**Solution:**
```bash
# Pull to see conflicts
git pull origin main

# Git will mark conflicts in files like:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> branch-name

# Open conflicted files
# Choose which changes to keep
# Remove conflict markers (<<<<<<, =======, >>>>>>>)

# Stage resolved files
git add conflicted-file.py

# Continue merge
git commit -m "Resolve merge conflicts"

# Push
git push origin main
```

---

### 12. Want to undo last commit

**Problem:** Just committed something you shouldn't have.

**Solution:**
```bash
# Undo last commit, keep changes (most common)
git reset --soft HEAD~1

# Undo last commit, discard changes (CAREFUL!)
git reset --hard HEAD~1

# Undo last commit, unstage changes
git reset HEAD~1
```

---

### 13. Want to discard all local changes

**Problem:** Messed up local files, want to start fresh.

**Solution:**
```bash
# Discard all uncommitted changes (CANNOT BE UNDONE!)
git reset --hard HEAD

# Remove untracked files too
git clean -fd

# Pull latest from remote
git pull origin main
```

---

### 14. GitHub asks for username/password repeatedly

**Problem:** HTTPS authentication not cached.

**Solution:**
```bash
# Windows - Cache credentials
git config --global credential.helper wincred

# Linux - Cache for 1 hour
git config --global credential.helper cache

# Linux - Cache for longer
git config --global credential.helper 'cache --timeout=3600'

# Mac - Use keychain
git config --global credential.helper osxkeychain
```

---

### 15. "You have divergent branches"

**Problem:** Local and remote branches have different commits.

**Solution:**
```bash
# Option 1: Rebase (cleaner history)
git pull --rebase origin main

# Option 2: Merge
git pull origin main

# Option 3: Force push (ONLY if you're sure)
git push --force origin main
```

---

## 🛠️ Useful Recovery Commands

### View what happened
```bash
git log --oneline       # See commit history
git reflog              # See all Git actions (even undone ones)
git status              # Current state
git diff                # See changes
```

### Undo operations
```bash
git checkout -- file    # Discard changes to file
git reset HEAD file     # Unstage file
git reset --soft HEAD~1 # Undo commit, keep changes
git reset --hard HEAD~1 # Undo commit, discard changes
git revert <commit>     # Create new commit that undoes changes
```

### Clean up
```bash
git clean -n            # Preview what will be deleted
git clean -f            # Delete untracked files
git clean -fd           # Delete untracked files and directories
```

---

## 🔍 Debug Commands

```bash
# Verbose output
git status -v
git pull -v
git push -v

# See remote URL
git remote -v

# See what Git is doing
git config --list

# Check Git version
git --version
```

---

## 🆘 Nuclear Options (Last Resort)

### Start completely fresh (CAREFUL!)

```bash
# Backup your code first!
cp -r . ../backup-ai-job-matchingV2

# Remove Git completely
rm -rf .git

# Reinitialize
git init
git add .
git commit -m "Fresh start"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SmartJobMatchZM.git
git push -f origin main
```

---

## 📞 Getting More Help

### 1. Check Git Status First
Always start with:
```bash
git status
```
This tells you what's going on.

### 2. Read the Error Message
Git error messages are usually helpful. Read them carefully.

### 3. Google the Exact Error
Copy the error message and Google it. Likely someone solved it before.

### 4. Useful Resources
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Help](https://docs.github.com/)
- [Stack Overflow - Git Tag](https://stackoverflow.com/questions/tagged/git)
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Humorous but helpful guide

### 5. Git Command Help
```bash
git help <command>
git <command> --help
git <command> -h
```

---

## 💡 Prevention Tips

### Before Committing:
1. Always run `git status` first
2. Review changes with `git diff`
3. Stage files carefully
4. Write clear commit messages

### Before Pushing:
1. Pull latest changes first
2. Test your code
3. Review what you're pushing
4. Make sure no sensitive data is included

### Daily Habits:
1. Commit often (small, focused commits)
2. Push regularly
3. Pull before starting work
4. Use branches for features
5. Keep `.gitignore` updated

---

## 🎯 Quick Command Reference

```bash
# Setup
git init                              # Initialize repo
git config user.name "Name"          # Set name
git config user.email "email"        # Set email

# Basic Workflow
git status                           # Check status
git add .                            # Stage all
git commit -m "message"              # Commit
git push origin main                 # Push

# Branching
git branch                           # List branches
git checkout -b feature              # Create and switch
git checkout main                    # Switch branch
git branch -d feature                # Delete branch

# Syncing
git pull origin main                 # Pull updates
git fetch origin                     # Fetch updates
git remote -v                        # View remotes

# Undoing
git checkout -- file                 # Discard changes
git reset HEAD file                  # Unstage
git reset --soft HEAD~1              # Undo commit
git revert <commit>                  # Reverse commit

# Information
git log --oneline                    # View history
git diff                             # See changes
git reflog                           # See all actions
```

---

## 📝 Notes for Your Situation

### Your Project: SmartJobMatchZM
- Location: `C:\Dev\ai-job-matchingV2`
- Remote: `https://github.com/YOUR_USERNAME/SmartJobMatchZM.git`
- Main Branch: `main`
- Dev Branch: `develop`

### If initialization script fails:
1. Check Git is installed: `git --version`
2. Check you're in right directory: `cd`
3. Try manual commands from GIT_QUICKSTART.md
4. Check for spaces in file paths
5. Run Command Prompt as Administrator

---

**Remember:** Don't panic! Git is designed to prevent data loss. Most problems are fixable. Take a deep breath, read the error message, and follow the solutions above. 🌟

**Still stuck? Document your exact error and ask for help!**
