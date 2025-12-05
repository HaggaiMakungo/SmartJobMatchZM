# 🚀 Quick Start Guide - Authentication Screens

## Step-by-Step Visual Guide

### 1️⃣ Create Test User (Backend)
```bash
cd C:\Dev\ai-job-matching\backend
python create_mobile_test_user.py
```
✅ Look for: "Test user created successfully!"

---

### 2️⃣ Start Backend Server
```bash
cd C:\Dev\ai-job-matching\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
✅ Look for: "Application startup complete"
⚠️ Important: Use `--host 0.0.0.0` for mobile access!

---

### 3️⃣ Update API URL (If Testing on Phone)

**Find Your IP:**
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```
Look for: `192.168.X.X`

**Update `src/services/api.ts`:**
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:8000/api'  // ← Put YOUR IP here
  : 'https://your-production-api.com/api';
```

---

### 4️⃣ Start Mobile App
```bash
cd C:\Dev\ai-job-matching\frontend\jobmatch
npm start
```

Press `a` for Android or `i` for iOS (if using simulators)
**OR** scan QR code with Expo Go app

---

### 5️⃣ Test Login Flow

#### Welcome Screen
```
┌─────────────────────────┐
│                         │
│    💼 JobMatch          │
│    AI-Powered Job       │
│    Matching for Zambia  │
│                         │
│  [  Get Started  ]      │ ← Tap this
│  [ Create Account ]     │
│                         │
│   Made in Zambia 🇿🇲    │
└─────────────────────────┘
```

#### Login Screen
```
┌─────────────────────────┐
│      👤 Welcome Back     │
│                         │
│ 🧪 Fill Test User ←─────┼─ TAP THIS!
│                         │
│ Email: [             ]  │
│ Password: [          ]  │
│ Forgot Password?        │
│                         │
│    [  Sign In  ]        │ ← Then tap this
│                         │
│ Don't have account?     │
│ Sign Up                 │
└─────────────────────────┘
```

#### Home Screen (After Login)
```
┌─────────────────────────┐
│ Welcome back,           │
│ Brian Mwale 👋          │
│                         │
│ ┌────────┐ ┌────────┐  │
│ │   0    │ │  0%    │  │
│ │ Apps   │ │ Match  │  │
│ └────────┘ └────────┘  │
│                         │
│ Recommended for You     │
│ [Job Card Placeholder]  │
│                         │
├─────────────────────────┤
│ 🏠  🔍  📋  👤  ←────────┼─ Bottom Tabs
└─────────────────────────┘
```

---

## 🎯 Quick Test Checklist

### ✅ Before Testing
- [ ] Backend running (port 8000)
- [ ] Test user created
- [ ] IP address updated in api.ts
- [ ] Expo Go installed on phone
- [ ] Same WiFi network

### ✅ During Testing
- [ ] App loads without errors
- [ ] "Fill Test User" button works
- [ ] Login successful
- [ ] See home screen with user name
- [ ] Bottom tabs work
- [ ] Profile shows Brian Mwale
- [ ] Logout works

---

## 🐛 Troubleshooting

### Error: "Network Error"
```
❌ Problem: Can't connect to backend
✅ Solution:
   1. Check backend is running: http://localhost:8000/docs
   2. Update api.ts with YOUR IP (not localhost)
   3. Restart app: Press 'r' in terminal
```

### Error: "Invalid credentials"
```
❌ Problem: Wrong email/password
✅ Solution:
   1. Re-run: python create_mobile_test_user.py
   2. Use: brian.mwale@example.com / password123
   3. Check caps lock is OFF
```

### App Won't Load
```
❌ Problem: Stuck on splash screen
✅ Solution:
   1. Press 'r' to reload
   2. Clear cache: npm start --clear
   3. Restart Expo Go app
```

### Icons Not Showing
```
❌ Problem: Missing Hugeicons
✅ Solution:
   npm install @hugeicons/react-native react-native-svg
   npm start
```

---

## 📱 Test User Credentials

**Copy-Paste These:**
```
Email:    brian.mwale@example.com
Password: password123
Phone:    5554446663
```

---

## 🎨 Screen Preview

### Login Screen Colors
- Background: Gunmetal gradient (#202c39 → #283845)
- Icon circle: Tangerine (#f29559)
- Input background: Secondary (#283845)
- Input border: Sage (#b8b08d)
- Button: Tangerine (#f29559)
- Links: Tangerine (#f29559)

### Home Screen Colors
- Background: Gunmetal gradient
- Cards: Secondary with Sage borders
- Stats numbers: White
- Badge: Peach background (#f2d492)
- Active tab: Tangerine (#f29559)

---

## 🚀 Next Steps After Testing

Once authentication works, we'll build:

1. **Job Feed** - Browse AI-matched jobs
2. **Job Details** - View full job info
3. **Applications** - Track your applications
4. **Profile** - Manage your resume

---

## 💡 Pro Tips

1. **Quick Reload:** Shake your phone or press 'r' in terminal
2. **Debug Menu:** Shake phone, tap "Debug JS Remotely"
3. **Clear Cache:** If weird errors, try `npm start --clear`
4. **Backend API Docs:** Visit `http://localhost:8000/docs`

---

**Questions? Issues? Let me know! 🎉**

Made in Zambia 🇿🇲
