# Quick Testing Guide - JobMatch Fixes

## 🚀 Quick Start

```bash
# Start the backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start the mobile app
cd frontend/jobmatch
npx expo start
```

---

## 📋 Test Scenarios

### 1. Jobs Pagination (5 per page)

**Steps:**
1. Navigate to Jobs tab (💼)
2. Scroll down to "Jobs on the Market" section
3. Verify only 5 jobs are displayed
4. Check page indicator shows "Page 1 of X"
5. Tap "Next" button
6. Verify page changes to 2 and new jobs load
7. Verify "Previous" button now enabled
8. Go to last page
9. Verify "Next" button is disabled

**Expected:**
- ✅ Only 5 jobs per page
- ✅ Navigation buttons work correctly
- ✅ Page indicator updates
- ✅ Disabled states work

---

### 2. Category Filtering

**Steps:**
1. On Jobs screen, tap different category filters
2. Try "Technology", "Marketing", "Healthcare", etc.
3. Verify jobs update based on category
4. Check pagination resets to page 1 on category change
5. Try a category that might not exist (should show empty state)

**Expected:**
- ✅ Categories match CSV data
- ✅ Jobs filter correctly
- ✅ Pagination resets on filter change
- ✅ Empty state for categories with no jobs

**Backend Check:**
```bash
curl http://localhost:8000/api/jobs/categories
```
Should return: `["Technology", "Marketing", "Healthcare", ...]`

---

### 3. Home Screen Quick Actions

**Steps:**
1. Go to Home tab (🏠)
2. Check the 4 quick action cards
3. Verify they say:
   - "Build Profile" (with User icon)
   - "Find Matches" (with Target icon, no number)
   - "Jobs Available" (with number)
   - "Saved Jobs" (with number)

**Expected:**
- ✅ "Build Profile" redirects to Profile tab
- ✅ "Find Matches" redirects to job-matches screen
- ✅ No confusing "3" label on Find Matches
- ✅ All icons display correctly

---

### 4. Top Matches Heading

**Steps:**
1. On Home screen, scroll to "Your Top Matches" section
2. Check the heading

**Expected:**
- ✅ Shows "Your Top Matches (3)" or however many matches exist
- ✅ Number in parentheses matches card count

---

### 5. Jobs Available Count

**Steps:**
1. Login as Brian Mwale (marketing profile)
2. Check "Jobs Available" number on home screen
3. Should show jobs relevant to marketing category
4. Compare with total jobs in database

**Expected:**
- ✅ Number shows relevant jobs only
- ✅ Number is NOT the full 600 jobs
- ✅ Based on user's matched categories

**Backend Check:**
```bash
# Get Brian's matches
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/match/ai/jobs?limit=3
```

---

### 6. Match Me Now Button

**Steps:**
1. Go to Jobs tab
2. Tap the "Match Me Now" button (below carousel)
3. Verify it redirects to job-matches screen

**Expected:**
- ✅ Button says "Match Me Now" (NOT "Refresh Matches")
- ✅ Redirects to /job-matches
- ✅ Button has correct styling (accent color)

---

### 7. Save Job Functionality

**Test A: Save from Job Details**
1. Tap any job card to open details
2. Tap the heart icon (top right)
3. Verify heart turns red and fills
4. Go back to home screen
5. Check "Saved Jobs" count increased

**Test B: Unsave Job**
1. Go back to same job details
2. Heart should still be red/filled
3. Tap heart again
4. Verify heart becomes outline
5. Check home screen count decreased

**Test C: Persistence**
1. Save a job
2. Close and restart the app
3. Go to same job details
4. Verify heart is still red/filled

**Test D: API Integration**
```bash
# Check saved jobs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/candidate/saved-jobs
```

**Expected:**
- ✅ Heart toggles between filled and outline
- ✅ Color changes (red when saved, default when not)
- ✅ State persists across app restarts
- ✅ Home screen count updates in real-time
- ✅ Backend API calls work correctly

---

## 🐛 Common Issues & Solutions

### Issue: Categories Don't Match

**Problem:** Category filter shows jobs that don't match

**Solution:**
1. Check backend categories:
```bash
curl http://localhost:8000/api/jobs/categories
```
2. Verify CSV files have consistent category names
3. Update CSV if needed:
   - `Corp_jobs.csv` - check `category` column
   - `PJobs.csv` - check `category` column

---

### Issue: Pagination Not Working

**Problem:** All jobs show at once

**Solution:**
1. Check `jobsPerPage` is set to 5
2. Verify `currentJobs` is used in render (not `allJobs`)
3. Check console for errors

---

### Issue: Save Job Not Working

**Problem:** Heart doesn't toggle or doesn't persist

**Solutions:**
1. Check backend endpoints are running:
```bash
curl -X POST -H "Authorization: Bearer TOKEN" http://localhost:8000/api/candidate/saved-jobs/1
```
2. Verify React Query is invalidating cache
3. Check browser/app storage permissions
4. Look for errors in console

---

### Issue: Jobs Available Shows Wrong Number

**Problem:** Shows all 600 jobs instead of relevant ones

**Solution:**
1. Verify `matchedCategories` is populated:
```typescript
console.log('Matched categories:', matchedCategories);
```
2. Check CAMSS matching is returning categories
3. Verify profile has skills/experience

---

## 📊 Performance Testing

### Test 1: Large Dataset
1. Add more jobs to database (100+)
2. Test pagination performance
3. Verify smooth scrolling
4. Check memory usage

### Test 2: Slow Network
1. Enable network throttling in Dev Tools
2. Test save job functionality
3. Verify loading states appear
4. Check error handling

### Test 3: Offline Mode
1. Disable network
2. Test cached data loads
3. Verify graceful error messages
4. Enable network and test sync

---

## 🎯 Test User Credentials

```
Job Seeker (Brian Mwale):
Email: brian.mwale@example.com
Password: password123
Profile: Marketing specialist with 6+ years experience
Expected: High matches for Marketing jobs

Employer (Mark Ziligone):
Email: mark.ziligone@example.com  
Password: password123
Type: Personal Employer
Jobs: 5 posted jobs
```

---

## ✅ Definition of Done

All fixes are complete when:

- [ ] Pagination shows 5 jobs per page with working navigation
- [ ] Categories match CSV and filter correctly
- [ ] Home screen has correct labels and counts
- [ ] "Match Me Now" button redirects properly
- [ ] Save job persists across sessions
- [ ] All API calls successful
- [ ] No console errors
- [ ] Dark mode works correctly
- [ ] Performance is smooth
- [ ] Error handling works

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]
Tester: [Name]
Device: [iOS/Android]
App Version: [Version]

### Pagination
- [ ] Pass / [ ] Fail - Shows 5 jobs per page
- [ ] Pass / [ ] Fail - Navigation buttons work
- [ ] Pass / [ ] Fail - Page indicator correct
Notes: _______

### Categories
- [ ] Pass / [ ] Fail - Match CSV data
- [ ] Pass / [ ] Fail - Filter jobs correctly
Notes: _______

### Home Screen
- [ ] Pass / [ ] Fail - Correct labels
- [ ] Pass / [ ] Fail - Accurate counts
Notes: _______

### Match Me Now
- [ ] Pass / [ ] Fail - Button redirects
Notes: _______

### Save Job
- [ ] Pass / [ ] Fail - Toggle works
- [ ] Pass / [ ] Fail - Persists across restarts
- [ ] Pass / [ ] Fail - Count updates
Notes: _______

Overall Status: [ ] PASS / [ ] FAIL
```

---

## 🔧 Debug Commands

```bash
# View React Query cache
# (In browser DevTools console or React Native debugger)

# Check saved jobs state
console.log(queryClient.getQueryData(['saved-jobs']));

# Check all jobs data
console.log(queryClient.getQueryData(['allJobs', 'All']));

# Check matches
console.log(queryClient.getQueryData(['topMatches']));

# View current page state (add to component)
console.log('Current page:', currentPage);
console.log('Total pages:', totalPages);
console.log('Current jobs:', currentJobs.length);
```

---

## 📞 Support

If tests fail:
1. Check backend logs: `tail -f backend/logs/app.log`
2. Check Expo logs: Look in terminal running `expo start`
3. Review React Native errors in app
4. Check network tab in DevTools
5. Verify database has data: `python backend/check_data.py`

---

**Happy Testing! 🎉**
