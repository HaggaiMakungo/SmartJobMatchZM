# ✅ Authentication Setup Checklist

## 📋 Pre-Launch Checklist

### Backend Setup
- [ ] Backend server is installed and dependencies are up to date
- [ ] Database is running (PostgreSQL)
- [ ] Created test user by running: `python create_mobile_test_user.py`
- [ ] Backend server started with: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [ ] Can access API docs at: http://localhost:8000/docs
- [ ] Test user exists (Brian Mwale - brian.mwale@example.com)

### Frontend Setup
- [ ] All dependencies installed: `npm install`
- [ ] Updated API URL in `src/services/api.ts` with your IP address
- [ ] Expo Go app installed on phone
- [ ] Phone and computer are on the same WiFi network
- [ ] App starts without errors: `npm start`

### Testing
- [ ] Welcome screen loads
- [ ] Can navigate to Login screen
- [ ] "Fill Test User" button works
- [ ] Login form validates empty fields
- [ ] Login with test user succeeds
- [ ] Redirects to Home screen after login
- [ ] Home screen shows user name (Brian Mwale)
- [ ] Bottom tabs are visible and tappable
- [ ] Can navigate to Profile tab
- [ ] Profile shows correct user info
- [ ] Logout button works
- [ ] After logout, returns to welcome screen
- [ ] Can navigate to Register screen
- [ ] Register form validates all fields
- [ ] Can create new account
- [ ] Auto-login after registration works

---

## 🎯 Quick Test (2 Minutes)

### Test 1: Login Flow ⏱️ 30 seconds
1. Open app → Welcome screen
2. Tap "Get Started"
3. Tap "Fill Test User"
4. Tap "Sign In"
5. ✅ Should see Home screen

### Test 2: Navigation ⏱️ 30 seconds
1. From Home, tap Search tab
2. Tap Applications tab
3. Tap Profile tab
4. ✅ All tabs should load

### Test 3: Logout ⏱️ 30 seconds
1. On Profile tab
2. Tap "Logout"
3. Confirm logout
4. ✅ Should return to Welcome screen

### Test 4: Register ⏱️ 30 seconds
1. From Welcome, tap "Create Account"
2. Fill in form with your info
3. Tap "Create Account"
4. ✅ Should auto-login to Home

---

## 🐛 Troubleshooting Checklist

### "Network Error" / "Cannot connect to API"
- [ ] Backend is running (check terminal)
- [ ] Backend accessible at http://localhost:8000/docs
- [ ] Updated API URL with YOUR computer's IP (not localhost)
- [ ] Phone and computer on same WiFi
- [ ] Firewall not blocking port 8000
- [ ] Try: `ipconfig` (Windows) or `ifconfig` (Mac) to find IP
- [ ] API URL format: `http://192.168.X.X:8000/api` (replace X.X)

### "Invalid credentials"
- [ ] Test user created (run script again)
- [ ] Using correct credentials:
  - Email: brian.mwale@example.com
  - Password: password123
- [ ] Caps lock is OFF
- [ ] No extra spaces in email/password

### App won't load / Stuck on splash
- [ ] Restart Expo: Press 'r' in terminal
- [ ] Clear cache: `npm start --clear`
- [ ] Close and reopen Expo Go app
- [ ] Check for error messages in terminal
- [ ] Try: Shake phone → Reload

### Icons not showing
- [ ] Installed: `npm install @hugeicons/react-native react-native-svg`
- [ ] Restart app: `npm start`
- [ ] Check terminal for errors

### "outlineWidth" error
- [ ] Already fixed in Input component!
- [ ] If you see this, avoid using `outline` styles
- [ ] Use explicit `borderWidth: 1` instead

### Keyboard covers input fields
- [ ] Already handled with KeyboardAvoidingView
- [ ] On iOS: behavior="padding"
- [ ] On Android: behavior="height"
- [ ] Try: Adjust `keyboardVerticalOffset` prop

---

## 📊 Success Criteria

Your authentication is working if ALL of these are true:

✅ **Login Screen**
- Test user button fills form correctly
- Login succeeds with valid credentials
- Login fails with invalid credentials (shows error)
- Loading spinner appears during login
- Redirects to home after successful login

✅ **Register Screen**
- Form validates all fields (shows errors)
- Password confirmation works
- Registration creates new user
- Auto-login after registration
- Redirects to home after signup

✅ **Home Screen**
- Shows correct user name
- Stats cards visible
- Bottom navigation works
- All 4 tabs are accessible

✅ **Profile Screen**
- Shows user avatar
- Displays email and phone
- Logout button present
- Logout confirmation dialog
- Returns to welcome after logout

✅ **Security**
- Token stored in SecureStore
- Token sent with API requests
- Token cleared on logout
- 401 errors handled (redirect to login)

---

## 🎨 Visual Checklist

### Colors Match Theme?
- [ ] Gradient backgrounds (Gunmetal #202c39 → #283845)
- [ ] Primary buttons (Tangerine #f29559)
- [ ] Input borders (Sage #b8b08d)
- [ ] Success/badges (Peach #f2d492)
- [ ] Active tabs (Tangerine)
- [ ] Inactive tabs (Sage)

### UI Elements Present?
- [ ] Icons show up (not blank squares)
- [ ] Loading spinners work
- [ ] Error messages are readable
- [ ] Forms have proper spacing
- [ ] Buttons have proper padding
- [ ] Text is readable (good contrast)

---

## 📱 Device-Specific Checks

### Android
- [ ] Keyboard doesn't cover inputs
- [ ] Back button works correctly
- [ ] StatusBar color looks good
- [ ] Splash screen appears
- [ ] Notifications (if any) work

### iOS
- [ ] Safe area respected (notch/island)
- [ ] Keyboard dismisses properly
- [ ] StatusBar style is correct
- [ ] Splash screen appears
- [ ] Animations smooth

---

## 🚀 Performance Checks

- [ ] App loads in under 5 seconds
- [ ] Login response under 2 seconds
- [ ] Navigation transitions smooth
- [ ] No lag when typing
- [ ] Scrolling is smooth
- [ ] No memory leaks (app doesn't crash after 5+ minutes)

---

## 📄 Documentation Checks

- [ ] README.md exists and is updated
- [ ] AUTH_SETUP_COMPLETE.md covers everything
- [ ] QUICK_START_AUTH.md is clear
- [ ] Test user credentials documented
- [ ] API endpoints documented
- [ ] Color palette documented

---

## 🎓 Knowledge Transfer

Can you answer these questions?

- [ ] Where is the auth token stored? (Expo SecureStore)
- [ ] How does the API get the token? (Axios interceptor)
- [ ] What happens on 401 error? (Redirect to login)
- [ ] Where are the auth screens? (app/(auth)/)
- [ ] Where are the main app screens? (app/(tabs)/)
- [ ] How to create a test user? (run create_mobile_test_user.py)
- [ ] What's the test user password? (password123)
- [ ] How to update API URL? (src/services/api.ts)

---

## ✅ Final Sign-Off

When ALL items above are checked:

**Authentication System Status:** 
- [ ] ✅ READY FOR DEVELOPMENT
- [ ] ⚠️ NEEDS FIXES (list issues below)
- [ ] ❌ NOT WORKING (see troubleshooting)

**Issues Found:**
_List any problems here..._

---

**Tested By:** _________________
**Date:** _________________
**Device:** _________________
**OS Version:** _________________

---

## 🎉 Next Steps

Once authentication is fully working:
1. Build Job Feed screen
2. Add Job Details & Apply
3. Complete Profile screens
4. Add Search & Filters
5. Implement Notifications

**Current Status:** Authentication Complete! 🚀

Made in Zambia 🇿🇲
