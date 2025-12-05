# 🎨 Recruiter Dashboard - Theme Alignment Guide

**Goal:** Match the Recruiter Dashboard (Next.js) to the Mobile App's design system

---

## 🎯 Current vs Target Design

### Mobile App Design (Target)
- **Primary Color:** `#202c39` (Gunmetal) - Main backgrounds, text
- **Secondary:** `#283845` (Gunmetal-2) - Accents
- **Background:** `#f2d492` (Peach Yellow) - Page background
- **Cards:** `#FFFFFF` (White) - Card backgrounds
- **Accent:** `#f29559` (Tangerine) - Buttons, highlights
- **Action Box:** `#f2d492` (Peach Yellow) - Action buttons background
- **Sage:** `#b8b08d` - Tertiary accents
- **Card Border:** `#e5d5b7` - Soft borders

### Current Dashboard Design
- Uses default shadcn/ui colors (zinc/slate)
- Blue accents
- Standard white/gray theme
- Doesn't match mobile app

---

## 📦 What to Install/Remove

### ✅ KEEP (Already Installed)
```json
{
  "tailwindcss": "^3.4.1",
  "tailwindcss-animate": "^1.0.7",
  "@tailwindcss/typography": "^0.5.10",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.1"
}
```

### ❌ NO NEED TO REMOVE
Everything is fine! Just need to update Tailwind config and component colors.

### 🎨 Icons - CHANGE THESE

**Current:** Lucide React (different icon library)
**Target:** Ionicons (same as mobile app)

```bash
# Remove lucide-react
npm uninstall lucide-react

# Install @expo/vector-icons for web (includes Ionicons)
npm install @expo/vector-icons

# OR use react-icons (has Ionicons)
npm install react-icons
```

**Recommended:** Use `react-icons` for web - it's lighter and includes Ionicons.

---

## 🔧 Configuration Changes

### 1. Update `tailwind.config.ts`

Replace the entire config with mobile app colors:

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mobile app color palette
        gunmetal: {
          DEFAULT: '#202c39',
          light: '#283845',
        },
        peach: {
          DEFAULT: '#f2d492',
          light: '#f5dca7',
        },
        tangerine: '#f29559',
        sage: '#b8b08d',
        
        // Semantic colors matching mobile
        border: "#e5d5b7",
        input: "#e5d5b7",
        ring: "#f29559",
        background: "#f2d492",
        foreground: "#202c39",
        
        primary: {
          DEFAULT: "#202c39",
          foreground: "#f2d492",
        },
        secondary: {
          DEFAULT: "#283845",
          foreground: "#f2d492",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5dca7",
          foreground: "#202c39",
        },
        accent: {
          DEFAULT: "#f29559",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#202c39",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#202c39",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### 2. Update `globals.css`

Add mobile app-inspired CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Mobile App Colors */
    --gunmetal: 32 44 57;
    --gunmetal-light: 40 56 69;
    --peach: 242 212 146;
    --peach-light: 245 220 167;
    --tangerine: 242 149 89;
    --sage: 184 176 141;
    
    /* Semantic Variables */
    --background: var(--peach);
    --foreground: var(--gunmetal);
    --card: 255 255 255;
    --card-foreground: var(--gunmetal);
    --popover: 255 255 255;
    --popover-foreground: var(--gunmetal);
    --primary: var(--gunmetal);
    --primary-foreground: var(--peach);
    --secondary: var(--gunmetal-light);
    --secondary-foreground: var(--peach);
    --muted: var(--peach-light);
    --muted-foreground: var(--gunmetal);
    --accent: var(--tangerine);
    --accent-foreground: 255 255 255;
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;
    --border: 229 213 183;
    --input: 229 213 183;
    --ring: var(--tangerine);
    --radius: 16px;
  }

  .dark {
    --background: var(--gunmetal);
    --foreground: var(--peach);
    --card: var(--gunmetal-light);
    --card-foreground: var(--peach);
    --popover: var(--gunmetal-light);
    --popover-foreground: var(--peach);
    --primary: var(--peach);
    --primary-foreground: var(--gunmetal);
    --secondary: var(--peach-light);
    --secondary-foreground: var(--gunmetal);
    --muted: var(--sage);
    --muted-foreground: var(--peach-light);
    --accent: var(--tangerine);
    --accent-foreground: 255 255 255;
    --border: var(--sage);
    --input: var(--sage);
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

## 🎨 Component Updates

### Button Component
```tsx
// src/components/ui/button.tsx
// Change variants to use new colors

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gunmetal text-peach hover:bg-gunmetal/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-peach/50 hover:text-gunmetal",
        secondary: "bg-tangerine text-white hover:bg-tangerine/90",
        ghost: "hover:bg-peach/50 hover:text-gunmetal",
        link: "text-tangerine underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Icon Replacements

**Before (Lucide):**
```tsx
import { Home, Users, Briefcase, FileText } from 'lucide-react'
```

**After (React Icons - Ionicons):**
```tsx
import { IoHome, IoPeople, IoBriefcase, IoDocument } from 'react-icons/io5'
```

**Icon Mapping:**
| Lucide | Ionicons (react-icons/io5) |
|--------|---------------------------|
| Home | IoHome |
| Users | IoPeople |
| Briefcase | IoBriefcase |
| FileText | IoDocument |
| Settings | IoSettings |
| LogOut | IoLogOut |
| Plus | IoAdd |
| Edit | IoCreate |
| Trash | IoTrash |
| ChevronRight | IoChevronForward |
| ChevronLeft | IoChevronBack |
| Search | IoSearch |
| Filter | IoFunnel |
| X | IoClose |
| Check | IoCheckmark |

---

## 📝 Step-by-Step Implementation

### Step 1: Install Icons (5 min)
```bash
cd frontend/recruiter
npm uninstall lucide-react
npm install react-icons
```

### Step 2: Update Tailwind Config (5 min)
1. Copy the new `tailwind.config.ts` from above
2. Replace your current config
3. Save

### Step 3: Update Global CSS (5 min)
1. Update `src/app/globals.css`
2. Replace with CSS from above
3. Save

### Step 4: Update Components (30 min)
1. **Button** - Update variants
2. **Badge** - Update colors
3. **Card** - Already good (uses CSS variables)
4. **Input** - Already good
5. **Replace Icons** - Change all Lucide imports to Ionicons

### Step 5: Update Pages (1 hour)
1. **Dashboard** - Replace icons
2. **Jobs** - Replace icons
3. **Applications** - Replace icons
4. **Candidates** - Replace icons
5. **Messages** - Replace icons
6. **Settings** - Replace icons

### Step 6: Test (15 min)
```bash
npm run dev
```
1. Check all pages
2. Verify colors match mobile
3. Test light/dark mode
4. Check icons display correctly

---

## 🎯 Final Result

After these changes:
- ✅ Peach yellow background (matches mobile)
- ✅ Gunmetal primary colors
- ✅ Tangerine accents
- ✅ White cards with soft borders
- ✅ Ionicons (same as mobile)
- ✅ Consistent typography
- ✅ Matching border radius (16px)

**Total Time:** ~2 hours to fully align

---

## 📚 Reference Files

**Mobile App Theme:**
- `frontend/jobmatch/src/store/themeStore.ts` - Color definitions
- `frontend/jobmatch/src/utils/theme.ts` - Theme utilities
- `frontend/jobmatch/src/constants/theme.ts` - Constants

**Dashboard (to update):**
- `frontend/recruiter/tailwind.config.ts` - Tailwind config
- `frontend/recruiter/src/app/globals.css` - Global styles
- `frontend/recruiter/src/components/ui/*` - UI components
- All page files - Icon replacements

---

## 🏢 ZedSafe HR Manager Login

After running the seed script, use these credentials:

**Company:** ZedSafe Logistics  
**Industry:** Logistics & Supply Chain  
**Role:** HR Manager / Corporate Recruiter  

**Login Details:**
- **Name:** Chipo Musonda
- **Email:** `chipo.musonda@zedsafe.co.zm`
- **Password:** `ZedSafe2024`

**Notes:**
- This user manages CORPORATE jobs (not personal/small jobs)
- Can create, edit, delete corporate job postings
- Can view and manage applicants
- Dashboard shows statistics for corporate jobs only

---

## 🚀 Quick Start Commands

```bash
# 1. Seed the HR Manager user
cd backend
python seed_hr_manager.py

# 2. Install new icon library
cd ../frontend/recruiter
npm uninstall lucide-react
npm install react-icons

# 3. Start dashboard
npm run dev

# 4. Login at http://localhost:3000
# Use: chipo.musonda@zedsafe.co.zm / ZedSafe2024
```

---

**Created:** November 14, 2025, 3:30 AM  
**Status:** Ready to implement  
Made in Zambia 🇿🇲
