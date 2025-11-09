# Command Reference - JobMatch Development

Quick commands for developing, testing, and deploying the JobMatch fixes.

---

## 🚀 Development Commands

### Start Backend
```bash
cd C:\Dev\ai-job-matching\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npx expo start
```

### Start Frontend (Clear Cache)
```bash
npx expo start -c
```

### Start on iOS Simulator
```bash
npx expo start --ios
```

### Start on Android Emulator
```bash
npx expo start --android
```

---

## 🧪 Testing Commands

### Test Backend API
```bash
# Get categories
curl http://localhost:8000/api/jobs/categories

# Get all jobs
curl http://localhost:8000/api/jobs/all

# Get saved jobs (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/candidate/saved-jobs

# Save a job
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/candidate/saved-jobs/1

# Unsave a job
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/candidate/saved-jobs/1

# Get AI matches
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/match/ai/jobs?limit=5
```

### TypeScript Type Check
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npx tsc --noEmit
```

### Find Console Logs (Cleanup)
```bash
# Windows PowerShell
cd C:\Dev\ai-job-matching\frontend\jobmatch
Get-ChildItem -Path .\app -Recurse -Include *.tsx | Select-String "console.log"
Get-ChildItem -Path .\src -Recurse -Include *.ts,*.tsx | Select-String "console.log"

# Git Bash / Linux / Mac
grep -r "console.log" app/
grep -r "console.log" src/
```

### Find TODOs
```bash
# Windows PowerShell
Get-ChildItem -Path . -Recurse -Include *.tsx,*.ts | Select-String "TODO"

# Git Bash / Linux / Mac
grep -r "TODO" app/ src/
```

---

## 📊 Database Commands

### Check Database Data
```bash
cd C:\Dev\ai-job-matching\backend

# Python script (if exists)
python scripts/check_data.py

# Or manually with psql
psql -U postgres -d jobmatch_db -c "SELECT category, COUNT(*) FROM corporate_jobs GROUP BY category;"
psql -U postgres -d jobmatch_db -c "SELECT category, COUNT(*) FROM personal_jobs GROUP BY category;"
psql -U postgres -d jobmatch_db -c "SELECT COUNT(*) FROM saved_jobs;"
```

### Load Test Data
```bash
cd C:\Dev\ai-job-matching\backend
python scripts/load_jobs.py
python scripts/create_test_users.py
```

---

## 🔍 Debug Commands

### View React Query Cache (in app debugger)
```javascript
// In React Native Debugger console
queryClient.getQueryData(['saved-jobs'])
queryClient.getQueryData(['allJobs', 'Technology'])
queryClient.getQueryData(['topMatches'])
queryClient.getQueryData(['jobCategories'])

// Invalidate cache
queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
```

### Check State (add to component temporarily)
```typescript
// In any component
console.log('Current page:', currentPage);
console.log('Total pages:', totalPages);
console.log('Current jobs:', currentJobs);
console.log('Saved jobs:', savedJobs);
console.log('Matched categories:', matchedCategories);
```

### Network Debugging
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Test auth endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brian.mwale@example.com","password":"password123"}'
```

---

## 📦 Build Commands

### Build for iOS (EAS)
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
eas build --platform ios --profile preview
```

### Build for Android (EAS)
```bash
eas build --platform android --profile preview
```

### Build Locally (iOS)
```bash
npx expo prebuild --platform ios
cd ios
pod install
open JobMatch.xcworkspace
# Build in Xcode
```

### Build Locally (Android)
```bash
npx expo prebuild --platform android
cd android
.\gradlew assembleRelease
```

---

## 🚢 Deployment Commands

### Submit to App Store
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
eas submit --platform ios
```

### Submit to Play Store
```bash
eas submit --platform android
```

### Deploy Backend (Example - adjust for your setup)
```bash
cd C:\Dev\ai-job-matching\backend

# Using Docker
docker build -t jobmatch-backend .
docker run -p 8000:8000 jobmatch-backend

# Using systemd (Linux)
sudo systemctl restart jobmatch-backend

# Using PM2 (Node-like process manager for Python)
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name jobmatch-backend
```

---

## 📝 Git Commands

### Create Feature Branch
```bash
git checkout -b fix/pagination-and-save-job
```

### Commit Changes
```bash
git add app/(tabs)/index.tsx
git add app/(tabs)/jobs.tsx
git add app/job-details.tsx
git commit -m "Fix: Implement pagination, categories, and save job functionality

- Add pagination (5 jobs per page) to Jobs screen
- Fix category matching to align with CSV data
- Update home screen labels and smart job counting
- Change button to 'Match Me Now' with correct redirect
- Implement full save job functionality with persistence

Fixes #1, #2, #3, #4, #5"
```

### Push Branch
```bash
git push origin fix/pagination-and-save-job
```

### Create Pull Request
```bash
# On GitHub/GitLab/Bitbucket
# Title: "Fix pagination, categories, and save job functionality"
# Description: Link to FIXES_IMPLEMENTATION_SUMMARY.md
# Reviewers: [Team members]
```

---

## 🧹 Cleanup Commands

### Clear Expo Cache
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npx expo start -c
```

### Clear React Native Cache
```bash
# Windows
rd /s /q node_modules
rd /s /q .expo
npm install

# Linux/Mac
rm -rf node_modules
rm -rf .expo
npm install
```

### Reset Metro Bundler
```bash
npx react-native start --reset-cache
```

### Clear iOS Build
```bash
cd ios
pod cache clean --all
rm -rf ~/Library/Developer/Xcode/DerivedData
pod install
```

### Clear Android Build
```bash
cd android
.\gradlew clean
```

---

## 📊 Monitoring Commands

### View Backend Logs
```bash
# If using uvicorn directly
# Logs appear in console

# If using systemd
sudo journalctl -u jobmatch-backend -f

# If using Docker
docker logs -f jobmatch-backend

# If using PM2
pm2 logs jobmatch-backend
```

### View App Logs
```bash
# Expo logs (in terminal running expo start)
# Press 'i' for iOS logs
# Press 'a' for Android logs

# Or use React Native CLI
npx react-native log-ios
npx react-native log-android
```

### Monitor Performance
```javascript
// Add to app temporarily
import { PerformanceObserver } from 'react-native';

const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });
```

---

## 🔧 Troubleshooting Commands

### Metro Bundler Issues
```bash
# Kill Metro
taskkill /F /IM node.exe  # Windows
killall node  # Mac/Linux

# Clear cache and restart
npx expo start -c
```

### Port Already in Use
```bash
# Kill process on port 8000 (Backend)
# Windows
netstat -ano | findstr :8000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9

# Kill process on port 19000 (Expo)
# Windows
netstat -ano | findstr :19000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:19000 | xargs kill -9
```

### Simulator/Emulator Not Found
```bash
# List iOS simulators
xcrun simctl list devices

# Boot iOS simulator
xcrun simctl boot "iPhone 15 Pro"

# List Android emulators
emulator -list-avds

# Start Android emulator
emulator -avd Pixel_5_API_33
```

### Dependencies Issues
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Update Expo
npm install expo@latest

# Install missing dependencies
npx expo install --fix
```

---

## 📚 Documentation Commands

### Generate API Documentation (Backend)
```bash
cd C:\Dev\ai-job-matching\backend
python -m app.main
# Visit http://localhost:8000/docs
```

### View Documentation
```bash
# Open in default browser
start docs/README.md  # Windows
open docs/README.md   # Mac
xdg-open docs/README.md  # Linux

# Or open in VS Code
code docs/
```

---

## 🎯 Quick Testing Flow

### Full Test Cycle
```bash
# 1. Start Backend
cd C:\Dev\ai-job-matching\backend
python -m uvicorn app.main:app --reload

# 2. Start Frontend (new terminal)
cd C:\Dev\ai-job-matching\frontend\jobmatch
npx expo start

# 3. Run tests (new terminal)
cd C:\Dev\ai-job-matching\frontend\jobmatch
npm test

# 4. Check TypeScript
npx tsc --noEmit

# 5. Open documentation
code docs/TESTING_GUIDE.md
```

---

## 🚨 Emergency Commands

### Rollback to Previous Version
```bash
# If you need to quickly undo changes
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard [COMMIT_HASH]
git push --force origin main
```

### Quick Fix Deployment
```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug
# Make fix
git commit -m "Hotfix: [description]"
git push origin hotfix/critical-bug
# Deploy immediately
```

---

## 💾 Backup Commands

### Backup Database
```bash
# PostgreSQL backup
pg_dump -U postgres jobmatch_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres jobmatch_db < backup_20251109.sql
```

### Backup Code
```bash
# Create archive
git archive -o jobmatch_backup_$(date +%Y%m%d).zip HEAD

# Or manual copy
cp -r C:\Dev\ai-job-matching C:\Backups\jobmatch_$(date +%Y%m%d)
```

---

## 🔗 Useful URLs

```
Backend API Docs:     http://localhost:8000/docs
Expo DevTools:        http://localhost:19002
React Native Debugger: http://localhost:19000/debugger-ui
```

---

## 📞 Quick Help

```bash
# Get help on any command
npx expo start --help
git --help
docker --help

# Check versions
node --version
npm --version
python --version
expo --version
```

---

**Last Updated:** November 9, 2025  
**Maintained By:** Development Team

**Tip:** Bookmark this file for quick reference during development!
