# 📱 JobMatch Mobile App

AI-Powered Job Matching for Zambia - React Native Mobile Application

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind v4 (TailwindCSS)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5 + Axios
- **Forms**: React Hook Form + Zod
- **Storage**: Expo SecureStore + AsyncStorage
- **Icons**: Hugeicons React Native

## 📁 Project Structure

```
jobmatch/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Welcome/Landing screen
│   ├── (auth)/            # Authentication screens
│   └── (tabs)/            # Main app tabs
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # UI components (Button, Input, Card, etc.)
│   ├── constants/         # App constants and theme
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   │   ├── api.ts        # Axios instance
│   │   └── auth.service.ts
│   ├── store/            # Zustand stores
│   │   └── authStore.ts
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── ...
├── assets/               # Images, fonts, etc.
├── global.css           # TailwindCSS imports
├── tailwind.config.js   # TailwindCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional utilities:
```bash
npm install clsx tailwind-merge
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app

## 📱 Available Scripts

```bash
npm start          # Start Expo dev server
npm start:clear    # Start with cache cleared
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run type-check # Run TypeScript type checking
```

## 🎨 Theming

The app uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: #912F40 (Maroon)
- **Secondary**: #1E293B (Dark Blue)

Use TailwindCSS classes in your components:
```tsx
<View className="bg-primary p-4 rounded-lg">
  <Text className="text-white font-bold">Hello</Text>
</View>
```

## 🔐 Authentication Flow

1. User lands on welcome screen (`app/index.tsx`)
2. User can login or register (`app/(auth)/`)
3. After auth, user is redirected to main app (`app/(tabs)/`)

## 🌐 API Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000/api'  // For testing on real device
  : 'https://your-production-api.com/api';
```

## 📦 State Management

Using Zustand for global state:

```typescript
// Define store
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Use in component
const { user, setUser } = useAuthStore();
```

## 🎯 Data Fetching

Using TanStack Query for server state:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => api.get('/jobs'),
});
```

## 🎨 Using Hugeicons

```tsx
import { Job01Icon, UserIcon } from '@hugeicons/react-native';

<Job01Icon size={24} color="#912F40" variant="stroke" />
```

## 🔒 Security

- Sensitive data (tokens) stored in **Expo SecureStore**
- User preferences stored in **AsyncStorage**
- API requests include auth token automatically

## 📝 Form Handling

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## 🚧 Next Steps

1. ✅ Setup complete
2. 🔨 Create authentication screens
3. 🔨 Build job listing screens
4. 🔨 Implement application flow
5. 🔨 Add profile management
6. 🔨 Connect to backend API

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### TypeScript errors
```bash
npm run type-check
```

### Module not found
```bash
rm -rf node_modules
npm install
```

## 📚 Documentation

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [NativeWind Docs](https://www.nativewind.dev)
- [TanStack Query Docs](https://tanstack.com/query)
- [Hugeicons Docs](https://hugeicons.com)

## 🇿🇲 Made in Zambia

Built with ❤️ for the Zambian job market
