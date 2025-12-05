# 🧪 Quick Test Guide - Personal Employer Mode

## 🚀 Quick Start (30 seconds)

```bash
cd frontend/jobmatch
npx expo start
```

Then scan the QR code with Expo Go app on your phone.

---

## 👤 Test User Credentials

**Mark Ziligone (Personal Employer)**
- **Email:** mark.ziligone@example.com
- **Password:** password123

---

## ✅ 10-Step Test Flow

### 1. Login 🔐
- On Get Started screen, tap **"Get Started"**
- Tap the **"👼 Personal Employer (Mark Ziligone)"** button
- Credentials auto-fill ✨
- Tap **"Sign In"**
- ✅ Should land on Personal Employer Home

---

### 2. Explore Home Screen 🏠
- See greeting: "Good evening, Mark! 👋"
- Profile photo visible (top left)
- 4 quick action boxes visible
- 3 job listings under "Your Jobs"
- 3 recommended candidates
- Monthly stats at bottom
- FAB button (bottom right)

---

### 3. Test Quick Actions ⚡
**Tap "Post New Job":**
- ✅ Should navigate to Post Job Form
- Press back arrow
- ✅ Should return to Home

**Tap "My Jobs":**
- ✅ Should navigate to Jobs tab
- Tap Home tab to return

---

### 4. Post a New Job 📝
**From Home, tap FAB (+) or "Post New Job":**

1. **Title:** "Test Driver Needed"
2. **Category:** Select "🚗 Driver"
3. **Description:** "Need reliable driver for school runs"
4. **When:** Select "This week"
5. **Duration:** Select "Ongoing"
6. **Location:** "Kabulonga, Lusaka"
7. **Payment:** Keep "Fixed", enter "2500"
8. **Toggle "Show Preview"** - See live preview
9. Tap **"Post Job"**
10. ✅ Success alert appears
11. Tap OK
12. ✅ Navigates to Jobs screen

---

### 5. Check Jobs Screen 💼
- See quick stats at top
- Filter buttons: All, Active, Reviewing, Drafts, Closed
- 5 job cards visible (or 6 if your new job appears)
- Each card shows:
  - Status badge
  - Applicant count
  - View count
  - Edit & Delete buttons
- FAB button present

**Test Filters:**
- Tap "Active" - see only active jobs
- Tap "Draft" - see only drafts
- Tap "All" - see all jobs again

---

### 6. View Alerts 🔔
**Tap Alerts tab (bottom bar):**
- See header with unread count
- "Smart Digest Mode" toggle visible
- Filter tabs: All (7), Jobs, AI Insights, Updates
- 7 notification cards

**Test Filters:**
- Tap "Unread (3)" - see only unread
- ✅ 3 unread notifications visible
- Tap "All (7)" - see all again
- Tap "Mark all read"
- ✅ Unread count becomes 0
- ✅ See "All Caught Up!" message

**Test Actions:**
- Tap any notification's action button
- ✅ Button responds visually

---

### 7. Check Profile 👤
**Tap Profile tab (bottom bar):**
- See profile card with photo
- "Personal Employer" badge
- Contact info: email, phone, location
- Stats: 5 Jobs | 2 Hires | 4.8⭐
- 4 sections visible:
  1. Account
  2. Preferences
  3. Support
  4. Logout button (red)

---

### 8. Test Theme Toggle 🌙 ↔️ ☀️
**In Profile, under Preferences:**
- Tap **Theme** row
- ✅ Icon should change (Moon → Sun or vice versa)
- ✅ All colors should invert immediately
- ✅ Background: Peach ↔️ Gunmetal
- ✅ Text: Gunmetal ↔️ Peach
- ✅ Action boxes stay Peach Yellow

**Test in all tabs:**
- Go to Home - ✅ theme applied
- Go to Jobs - ✅ theme applied
- Go to Alerts - ✅ theme applied
- Go back to Profile - ✅ theme persists

---

### 9. Test "My Jobs" Navigation 🔗
**In Profile, under Account:**
- Tap **"My Jobs"** row
- ✅ Should navigate to Jobs tab
- ✅ Jobs screen visible
- Tap Profile tab to return

---

### 10. Test Logout 🚪
**In Profile, scroll to bottom:**
- Tap red **"Logout"** button
- ✅ Alert dialog appears: "Are you sure you want to log out?"
- Tap **"Cancel"** - ✅ stays on profile
- Tap **"Logout"** again
- Tap **"Logout"** in dialog
- ✅ Should return to **Get Started screen** ✨

---

## ✅ Success Checklist

After completing the 10 steps, you should have:

- [ ] Logged in as Mark Ziligone
- [ ] Seen personalized home screen
- [ ] Posted a test job
- [ ] Viewed Jobs screen with filters
- [ ] Checked 7 alerts with unread filter
- [ ] Viewed profile with stats
- [ ] Toggled theme (dark/light)
- [ ] Navigated via "My Jobs"
- [ ] Logged out successfully
- [ ] Returned to Get Started screen

**All checkboxes ticked? Perfect! 🎉**

---

## 🐛 Common Issues & Fixes

### Issue: App crashes on login
**Fix:** Make sure backend is running and test users exist
```bash
cd backend
python create_mobile_employers.py
python -m uvicorn app.main:app --reload
```

### Issue: White screen after navigation
**Fix:** Clear cache and restart
```bash
npx expo start -c
```

### Issue: Theme doesn't persist
**Fix:** Check AsyncStorage permissions, restart app

### Issue: Alerts show no icon
**Fix:** This should be fixed - check that Lucide icons are imported correctly

---

## 🎯 What to Look For

### Good Signs ✅
- Smooth animations
- No console errors
- Quick load times
- Responsive touches
- Clear text
- Proper colors
- Working navigation
- Theme changes apply everywhere

### Red Flags ❌
- Lag or stuttering
- Console warnings/errors
- Navigation doesn't work
- Colors look wrong
- Text is unreadable
- Images don't load
- Theme doesn't switch
- Logout doesn't redirect

---

## 📊 Expected Results

### Home Screen
- Greeting changes based on time
- 4 quick action boxes clickable
- FAB navigates to post job
- Jobs and candidates visible

### Post Job Form
- All 9 category chips visible
- Preview shows on toggle
- Submit shows success alert
- Redirects to Jobs screen

### Jobs Screen
- 5 jobs visible initially
- Filters work correctly
- Status badges color-coded
- Edit/Delete buttons present

### Alerts Screen
- 7 notifications total
- 3 marked unread
- Filters show correct counts
- "Mark all read" works

### Profile Screen
- Photo loads correctly
- Stats display properly
- Theme toggle changes icon
- "My Jobs" navigates correctly
- Logout returns to Get Started

---

## 🚀 Performance Benchmarks

Expected performance on modern phone:

| Action | Expected Time |
|--------|---------------|
| Login | < 2 seconds |
| Tab switch | Instant |
| Theme toggle | Instant |
| Open form | < 0.5 seconds |
| Submit form | < 1 second |
| Filter alerts | Instant |
| Logout | < 1 second |

If any action takes longer, there might be an issue.

---

## 💡 Pro Tips

1. **Test on real device** - Simulator doesn't show real performance
2. **Try both themes** - Make sure everything looks good in light and dark
3. **Test with slow network** - See how app handles delays
4. **Fill forms completely** - Test validation and edge cases
5. **Navigate back and forth** - Make sure state persists
6. **Try rapid taps** - Check for race conditions
7. **Rotate device** - See if layout responds
8. **Background and resume** - State should persist

---

## 🎓 Advanced Testing

### Test Navigation Stack
1. Home → Post Job → Back → Jobs → Profile → Home
2. Verify no memory leaks
3. Check state persistence

### Test Theme Consistency
1. Toggle theme in Profile
2. Visit all tabs
3. All should use new theme
4. Restart app
5. Theme should persist

### Test Form States
1. Start filling form
2. Switch tabs
3. Return to form
4. Data should be lost (expected - no draft save)

---

## 📝 Test Report Template

```
Date: _______________
Tester: _______________
Device: _______________
OS Version: _______________

✅ Login successful
✅ Home screen loads
✅ Post job form works
✅ Jobs screen filters
✅ Alerts display correctly
✅ Profile loads with data
✅ Theme toggle works
✅ Navigation functional
✅ Logout redirects
✅ No console errors

Issues Found:
1. _______________
2. _______________
3. _______________

Overall Rating: ___/10
```

---

**Last Updated:** November 8, 2025  
**Status:** Ready for Testing  
**Mode:** Personal Employer  
**Test User:** Mark Ziligone  

---

**Happy Testing! 🧪✨**

Made in Zambia 🇿🇲
