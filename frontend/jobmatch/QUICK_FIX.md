# 🔧 Quick Fix for Missing Dependencies

## Problem
The app failed to start because `babel-preset-expo` is missing.

## Solution
Run these commands in your `frontend/jobmatch` folder:

### Windows (Command Prompt or PowerShell)
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npm install babel-preset-expo --save-dev
npm start
```

### Alternative: Install All Missing Dependencies
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npm install babel-preset-expo @babel/core --save-dev
npm install
npm start
```

## What This Does
- Installs `babel-preset-expo` as a dev dependency
- This preset is required by Expo to transform your React Native code
- It's referenced in your `babel.config.js` file

## After Installation
1. Run `npm start`
2. Press `a` for Android or scan the QR code
3. The app should now load successfully with your new color palette!

---

**Quick Copy-Paste:**
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch && npm install babel-preset-expo --save-dev && npm start
```
