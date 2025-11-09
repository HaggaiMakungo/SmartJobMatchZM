# 🎯 Quick Start Guide

## ⚡ Install Missing Packages

Run this command to install the utilities we need:

```bash
cd frontend/jobmatch
npm install clsx tailwind-merge react-native-gesture-handler
```

## 🚀 Start the App

1. **Start the Expo dev server:**
```bash
npm start
```

2. **On your phone:**
   - Install **Expo Go** from Play Store/App Store
   - Scan the QR code shown in terminal

3. **Or use an emulator:**
   - Android: `npm run android`
   - iOS: `npm run ios` (Mac only)

## 📱 Testing on Your Phone

**Important**: Your phone and computer must be on the same WiFi network!

### If using your computer's IP:
Update `src/services/api.ts` with your local IP:

```typescript
// Find your IP address:
// Windows: ipconfig (look for IPv4)
// Mac/Linux: ifconfig | grep inet

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.XXX:8000/api'  // Replace XXX with your IP
  : 'https://your-production-api.com/api';
```

## ✅ What's Been Set Up

- ✅ NativeWind v4 with TailwindCSS
- ✅ Expo Router (file-based routing)
- ✅ Zustand (state management)
- ✅ TanStack Query (data fetching)
- ✅ React Hook Form + Zod (forms)
- ✅ Hugeicons (icons)
- ✅ Axios with interceptors
- ✅ Secure token storage
- ✅ TypeScript paths configured
- ✅ Reusable UI components
- ✅ Utility functions
- ✅ Welcome screen with beautiful gradient

## 📂 Project Structure Created

```
app/
  _layout.tsx          ← Root layout with providers
  index.tsx            ← Welcome screen

src/
  components/ui/       ← Button, Input, Card components
  services/           ← API & Auth services
  store/              ← Zustand stores
  types/              ← TypeScript types
  utils/              ← Helper functions
  constants/          ← Theme & constants
```

## 🎨 Current Theme

Primary Color: **#912F40** (Maroon)
Secondary Color: **#1E293B** (Dark Blue)

## 🔥 Next Features to Build

1. **Authentication Screens** (`app/(auth)/`)
   - Login
   - Register
   - Forgot Password

2. **Main App Tabs** (`app/(tabs)/`)
   - Home (Job Feed)
   - Search
   - Applications
   - Profile

3. **Job Details & Application Flow**

## 🐛 Common Issues

### "Unable to resolve module"
```bash
npm start -- --clear
```

### TypeScript errors
```bash
npm run type-check
```

### Expo Go can't connect
- Make sure phone and PC are on same WiFi
- Check firewall settings
- Try using tunnel: `npm start -- --tunnel`

## 📞 Need Help?

Just ask me! I'm here to help build your JobMatch app! 🚀

---

**Ready to start building?** Let me know what screen you want to create first! 🎯
