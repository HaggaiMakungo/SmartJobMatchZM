#!/bin/bash
# ============================================================================
# SmartJobMatchZM - Git Repository Initialization Script (Linux/Mac)
# ============================================================================

echo ""
echo "========================================"
echo "SmartJobMatchZM Git Setup"
echo "========================================"
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is not installed"
    echo "Please install Git:"
    echo "  Ubuntu/Debian: sudo apt-get install git"
    echo "  macOS: brew install git"
    exit 1
fi

echo "[1/7] Checking current directory..."
cd "$(dirname "$0")"
echo "Current directory: $(pwd)"
echo ""

# Check if already initialized
if [ -d ".git" ]; then
    echo "[WARNING] Git repository already initialized!"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting..."
        exit 0
    fi
fi

echo "[2/7] Initializing Git repository..."
git init
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to initialize Git repository"
    exit 1
fi
echo "[SUCCESS] Repository initialized"
echo ""

echo "[3/7] Configuring Git settings..."
read -p "Please enter your GitHub username: " GIT_USERNAME
read -p "Please enter your GitHub email: " GIT_EMAIL

git config user.name "$GIT_USERNAME"
git config user.email "$GIT_EMAIL"

# Optional: Set global configs
git config --global core.autocrlf input
git config --global init.defaultBranch main

echo "[SUCCESS] Git configured"
echo "  Username: $GIT_USERNAME"
echo "  Email: $GIT_EMAIL"
echo ""

echo "[4/7] Checking files to be committed..."
git status
echo ""

echo "[5/7] Adding all files to staging area..."
git add .
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to add files"
    exit 1
fi
echo "[SUCCESS] Files staged"
echo ""

echo "[6/7] Creating initial commit..."
git commit -m "Initial commit: SmartJobMatchZM project setup with FastAPI backend and React frontend"
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to create commit"
    exit 1
fi
echo "[SUCCESS] Initial commit created"
echo ""

echo "[7/7] Setting default branch to 'main'..."
git branch -M main
echo "[SUCCESS] Branch renamed to main"
echo ""

echo "========================================"
echo "Git Repository Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to: https://github.com/new"
echo "   - Repository name: SmartJobMatchZM"
echo "   - Description: AI-Powered Job Matching Platform for Zambia"
echo "   - Keep it Public or Private (your choice)"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo "   - Click 'Create repository'"
echo ""
echo "2. Connect to GitHub (run ONE of these commands):"
echo ""
echo "   HTTPS (easier):"
echo "   git remote add origin https://github.com/$GIT_USERNAME/SmartJobMatchZM.git"
echo ""
echo "   SSH (recommended if you have SSH keys):"
echo "   git remote add origin git@github.com:$GIT_USERNAME/SmartJobMatchZM.git"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4. Create develop branch (optional but recommended):"
echo "   git checkout -b develop"
echo "   git push -u origin develop"
echo ""
echo "========================================"
echo ""

# Create helper file
cat > github_setup_commands.sh << EOF
#!/bin/bash
# Run these commands after creating your GitHub repository

git remote add origin https://github.com/$GIT_USERNAME/SmartJobMatchZM.git
git push -u origin main
git checkout -b develop
git push -u origin develop
EOF

chmod +x github_setup_commands.sh

echo "Commands saved to: github_setup_commands.sh"
echo "Make it executable with: chmod +x github_setup_commands.sh"
echo ""
