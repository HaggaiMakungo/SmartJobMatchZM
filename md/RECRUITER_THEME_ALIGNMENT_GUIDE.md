# 🎨 Recruiter Dashboard - Complete Theme & Icon Alignment

**Created:** November 14, 2025, 3:45 AM  
**Status:** ✅ Ready to Implement  
**Time Required:** ~2 hours

---

## 🎯 Goal

Make the Next.js recruiter dashboard match the React Native mobile app exactly:
- **Same color palette** (Gunmetal, Peach, Tangerine, Sage)
- **Same icon library** (Ionicons via react-icons)
- **Consistent visual language** across both platforms

---

## 📦 Step 1: Install/Remove Packages (2 minutes)

### Remove lucide-react
```bash
cd frontend/recruiter
npm uninstall lucide-react
```

### Install react-icons
```bash
npm install react-icons
```

**Why?** Your mobile app uses Ionicons from `react-icons/io5`. The recruiter dashboard currently uses lucide-react. We need to switch to match.

---

## 🎨 Step 2: Update Color Palette (10 minutes)

### 2a. Update `tailwind.config.ts`

Replace the entire `colors` section:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY PALETTE (from mobile app)
        gunmetal: {
          DEFAULT: '#202c39',
          50: '#f5f6f7',
          100: '#e9ebee',
          200: '#d0d5db',
          300: '#a8b1bd',
          400: '#7a8699',
          500: '#5a667a',
          600: '#4a5365',
          700: '#3e4453',
          800: '#363c47',
          900: '#202c39', // Main gunmetal
          950: '#1a222c',
        },
        peach: {
          DEFAULT: '#f2d492',
          50: '#fdf9ed',
          100: '#faf1d4',
          200: '#f5e0a5',
          300: '#f2d492', // Main peach
          400: '#ecc26b',
          500: '#e4a23e',
          600: '#d58427',
          700: '#b26321',
          800: '#8f4e20',
          900: '#75411f',
          950: '#3f1f0d',
        },
        tangerine: {
          DEFAULT: '#f29559',
          50: '#fef6ef',
          100: '#fdebd9',
          200: '#fad2b2',
          300: '#f7b480',
          400: '#f29559', // Main tangerine
          500: '#ed7037',
          600: '#de5625',
          700: '#b9401f',
          800: '#933521',
          900: '#762f1e',
          950: '#40160d',
        },
        sage: {
          DEFAULT: '#b8b08d',
          50: '#f7f6f1',
          100: '#edeadf',
          200: '#dcd5be',
          300: '#c7bc97',
          400: '#b8b08d', // Main sage
          500: '#a59473',
          600: '#8f7a5f',
          700: '#76634f',
          800: '#635345',
          900: '#54473c',
          950: '#2d241f',
        },
        
        // shadcn/ui variables (mapped to our palette)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 2b. Update `globals.css`

Replace the CSS variables section:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Mode - Peach background, Gunmetal text */
    --background: 42 36% 75%; /* Peach #f2d492 */
    --foreground: 212 28% 18%; /* Gunmetal #202c39 */
    --card: 0 0% 100%; /* White cards */
    --card-foreground: 212 28% 18%;
    --popover: 0 0% 100%;
    --popover-foreground: 212 28% 18%;
    --primary: 24 76% 57%; /* Tangerine #f29559 */
    --primary-foreground: 0 0% 100%;
    --secondary: 42 36% 75%; /* Peach for secondary */
    --secondary-foreground: 212 28% 18%;
    --muted: 40 20% 65%; /* Sage #b8b08d */
    --muted-foreground: 212 28% 30%;
    --accent: 24 76% 57%; /* Tangerine for accents */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 40 20% 75%; /* Light sage border */
    --input: 40 20% 75%;
    --ring: 24 76% 57%; /* Tangerine ring */
    --radius: 0.5rem;
    
    /* Charts */
    --chart-1: 24 76% 57%; /* Tangerine */
    --chart-2: 42 36% 75%; /* Peach */
    --chart-3: 40 20% 65%; /* Sage */
    --chart-4: 212 28% 30%; /* Light gunmetal */
    --chart-5: 212 28% 50%; /* Mid gunmetal */
  }

  .dark {
    /* Dark Mode - Gunmetal background, Peach text */
    --background: 212 28% 18%; /* Gunmetal #202c39 */
    --foreground: 42 36% 75%; /* Peach #f2d492 */
    --card: 212 28% 22%; /* Slightly lighter gunmetal */
    --card-foreground: 42 36% 75%;
    --popover: 212 28% 22%;
    --popover-foreground: 42 36% 75%;
    --primary: 24 76% 57%; /* Tangerine #f29559 */
    --primary-foreground: 0 0% 100%;
    --secondary: 212 28% 25%;
    --secondary-foreground: 42 36% 75%;
    --muted: 40 20% 35%; /* Dark sage */
    --muted-foreground: 42 36% 60%;
    --accent: 24 76% 57%; /* Tangerine for accents */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 42 36% 75%;
    --border: 212 28% 30%; /* Dark border */
    --input: 212 28% 30%;
    --ring: 24 76% 57%; /* Tangerine ring */
    
    /* Charts */
    --chart-1: 24 76% 57%; /* Tangerine */
    --chart-2: 42 36% 75%; /* Peach */
    --chart-3: 40 20% 65%; /* Sage */
    --chart-4: 212 28% 40%; /* Lighter gunmetal */
    --chart-5: 212 28% 60%; /* Even lighter */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 🎨 Step 3: Replace All Icons (1-1.5 hours)

### Icon Mapping Reference

| Component | Old (lucide-react) | New (react-icons/io5) |
|-----------|-------------------|----------------------|
| Home | `<Home>` | `<IoHome>` |
| Users | `<Users>` | `<IoPeople>` |
| Briefcase | `<Briefcase>` | `<IoBriefcase>` |
| File | `<FileText>` | `<IoDocument>` |
| Settings | `<Settings>` | `<IoSettings>` |
| Bell | `<Bell>` | `<IoNotifications>` |
| User | `<User>` | `<IoPerson>` |
| Plus | `<Plus>` | `<IoAdd>` |
| Edit | `<Edit>` | `<IoCreate>` |
| Trash | `<Trash2>` | `<IoTrash>` |
| Eye | `<Eye>` | `<IoEye>` |
| Check | `<Check>` | `<IoCheckmark>` |
| X | `<X>` | `<IoClose>` |
| Search | `<Search>` | `<IoSearch>` |
| Filter | `<Filter>` | `<IoFunnel>` |
| Calendar | `<Calendar>` | `<IoCalendar>` |
| MapPin | `<MapPin>` | `<IoLocation>` |
| DollarSign | `<DollarSign>` | `<IoCash>` |
| Clock | `<Clock>` | `<IoTime>` |
| Mail | `<Mail>` | `<IoMail>` |
| Phone | `<Phone>` | `<IoCall>` |
| ChevronRight | `<ChevronRight>` | `<IoChevronForward>` |
| ChevronLeft | `<ChevronLeft>` | `<IoChevronBack>` |
| ChevronDown | `<ChevronDown>` | `<IoChevronDown>` |
| ChevronUp | `<ChevronUp>` | `<IoChevronUp>` |
| Menu | `<Menu>` | `<IoMenu>` |
| LogOut | `<LogOut>` | `<IoLogOut>` |

### Example: Update Dashboard Page

**Before:**
```typescript
import { Home, Users, Briefcase, FileText } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <Home className="w-6 h-6" />
      <Users className="w-6 h-6" />
    </div>
  );
}
```

**After:**
```typescript
import { IoHome, IoPeople, IoBriefcase, IoDocument } from 'react-icons/io5';

export default function DashboardPage() {
  return (
    <div>
      <IoHome className="w-6 h-6" />
      <IoPeople className="w-6 h-6" />
    </div>
  );
}
```

### Files to Update (in order of priority)

1. **Navigation Components**
   - `src/components/layout/Sidebar.tsx`
   - `src/components/layout/Header.tsx`
   - `src/components/layout/MobileNav.tsx`

2. **Main Pages**
   - `src/app/dashboard/page.tsx`
   - `src/app/jobs/page.tsx`
   - `src/app/applications/page.tsx`
   - `src/app/candidates/page.tsx`

3. **UI Components**
   - `src/components/ui/button.tsx` (if using icons)
   - `src/components/ui/badge.tsx`
   - Any custom components in `src/components/`

### Quick Find & Replace

Use VS Code's search & replace (Ctrl+Shift+F):

1. Search: `from ['"]lucide-react['"]`
2. Review each file manually
3. Update imports to `from 'react-icons/io5'`
4. Change icon names using the mapping table above

---

## 🎨 Step 4: Update Component Colors (30 minutes)

### Example: Button Component

Your buttons should use the tangerine color for primary actions:

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-tangerine hover:bg-tangerine-600 text-white",
        destructive: "bg-red-500 hover:bg-red-600 text-white",
        outline: "border border-gunmetal-300 hover:bg-peach-100",
        secondary: "bg-sage hover:bg-sage-600 text-white",
        ghost: "hover:bg-peach-100 hover:text-gunmetal",
        link: "text-tangerine underline-offset-4 hover:underline",
      },
    },
  }
);
```

### Example: Badge Component

```typescript
// src/components/ui/badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full ...",
  {
    variants: {
      variant: {
        default: "bg-tangerine text-white",
        secondary: "bg-sage text-white",
        outline: "border border-gunmetal-300 text-gunmetal",
        success: "bg-green-500 text-white",
        warning: "bg-yellow-500 text-white",
        danger: "bg-red-500 text-white",
      },
    },
  }
);
```

---

## ✅ Step 5: Test Everything (15 minutes)

### Checklist

- [ ] Run dev server: `npm run dev`
- [ ] Check all pages load without errors
- [ ] Toggle dark mode - colors should invert properly
- [ ] All icons display correctly (no missing icons)
- [ ] Buttons use tangerine color
- [ ] Backgrounds use peach (light) / gunmetal (dark)
- [ ] Text is readable in both modes
- [ ] Hover states work properly

### Test Flow

1. **Login Page** - Check form styling
2. **Dashboard** - Stats cards, charts
3. **Jobs List** - Table, buttons, badges
4. **Job Create/Edit** - Forms, dropdowns
5. **Applications** - Cards, actions
6. **Navigation** - Sidebar, mobile menu
7. **Settings** - Profile, theme toggle

---

## 📊 Progress Tracking

| Task | Time | Status |
|------|------|--------|
| Uninstall lucide-react | 1 min | ⏳ Todo |
| Install react-icons | 1 min | ⏳ Todo |
| Update tailwind.config.ts | 5 min | ⏳ Todo |
| Update globals.css | 5 min | ⏳ Todo |
| Replace icons in navigation | 15 min | ⏳ Todo |
| Replace icons in pages | 45 min | ⏳ Todo |
| Replace icons in components | 30 min | ⏳ Todo |
| Update button colors | 10 min | ⏳ Todo |
| Update badge colors | 10 min | ⏳ Todo |
| Test all pages | 15 min | ⏳ Todo |

**Total: ~2 hours**

---

## 🎯 Expected Result

### Before
- Generic Next.js dashboard with lucide-react icons
- Default shadcn/ui colors (slate, zinc)
- Disconnected from mobile app design

### After
- ✅ Matches mobile app color palette exactly
- ✅ Uses same icon library (Ionicons)
- ✅ Consistent brand identity
- ✅ Smooth dark mode support
- ✅ Professional, cohesive design

---

## 🆘 Troubleshooting

### Icons Not Showing
```bash
# Make sure react-icons is installed
npm list react-icons

# If missing, reinstall
npm install react-icons
```

### Colors Not Applying
```bash
# Rebuild Tailwind CSS
npm run build

# Clear cache and restart dev server
rm -rf .next
npm run dev
```

### Type Errors
```typescript
// If TypeScript complains about icon imports:
import type { IconType } from 'react-icons';

const MyIcon: IconType = IoHome;
```

---

## 📚 Resources

- **React Icons:** https://react-icons.github.io/react-icons/
- **Ionicons 5:** https://react-icons.github.io/react-icons/icons/io5/
- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors
- **shadcn/ui Theming:** https://ui.shadcn.com/docs/theming

---

## ✅ Final Checklist

Before considering the theme alignment complete:

- [ ] All lucide-react imports removed
- [ ] All icons use react-icons/io5
- [ ] tailwind.config.ts uses mobile app colors
- [ ] globals.css CSS variables updated
- [ ] All pages tested in light mode
- [ ] All pages tested in dark mode
- [ ] Icons consistent across all screens
- [ ] Colors match mobile app
- [ ] No console errors
- [ ] Production build succeeds

---

**Created:** November 14, 2025, 3:45 AM  
**Last Updated:** November 14, 2025, 3:45 AM  
**Status:** ✅ Ready to Implement  
**Estimated Time:** 2 hours  
Made in Zambia 🇿🇲
