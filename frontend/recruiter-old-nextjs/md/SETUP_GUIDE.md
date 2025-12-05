# ðŸš€ Recruiter Dashboard - Setup Guide

**Created:** November 14, 2025, 4:00 AM  
**Status:** âœ… Ready for Installation  
**Framework:** Next.js 14 + TypeScript + Tailwind CSS

---

## ðŸ" Project Structure Created

```
frontend/recruiter/
â"œâ"€â"€ src/
â"‚   â"œâ"€â"€ app/                  # Next.js 14 App Router
â"‚   â"‚   â"œâ"€â"€ layout.tsx         # Root layout
â"‚   â"‚   â"œâ"€â"€ page.tsx           # Home page
â"‚   â"‚   â""â"€â"€ globals.css        # Global styles with theme
â"‚   â"œâ"€â"€ components/           # Reusable components (empty, ready for you)
â"‚   â"œâ"€â"€ lib/
â"‚   â"‚   â""â"€â"€ services/         # API services (empty, ready for you)
â"‚   â""â"€â"€ types/                # TypeScript types (empty, ready for you)
â"œâ"€â"€ public/                   # Static assets
â"œâ"€â"€ package.json              # Dependencies
â"œâ"€â"€ tsconfig.json             # TypeScript config
â"œâ"€â"€ tailwind.config.js        # Tailwind with your color palette
â"œâ"€â"€ postcss.config.js         # PostCSS config
â"œâ"€â"€ next.config.js            # Next.js config with API proxy
â"œâ"€â"€ .env.local                # Environment variables
â""â"€â"€ .gitignore                # Git ignore file
```

---

## ðŸ"¦ Step 1: Install Dependencies

Open your terminal and run:

```bash
# Navigate to the recruiter folder
cd C:\Dev\ai-job-matchingV2\frontend\recruiter

# Install all dependencies
npm install
```

This will install:

### Core Dependencies
- ✅ **next** (^14.2.0) - Next.js framework
- ✅ **react** (^18.3.0) - React library
- ✅ **react-dom** (^18.3.0) - React DOM
- ✅ **typescript** (^5) - TypeScript

### UI & Styling
- ✅ **tailwindcss** (^3.4.0) - Utility-first CSS
- ✅ **lucide-react** (^0.263.1) - Icon library (same as mobile app!)
- ✅ **clsx** (^2.1.0) - Class name utility
- ✅ **tailwind-merge** (^2.3.0) - Merge Tailwind classes

### State & Data
- ✅ **zustand** (^4.5.0) - State management
- ✅ **axios** (^1.7.0) - HTTP client

### Forms & Validation
- ✅ **react-hook-form** (^7.51.0) - Form handling
- ✅ **zod** (^3.23.0) - Schema validation
- ✅ **@hookform/resolvers** (^3.3.0) - Form resolvers

### Utilities
- ✅ **date-fns** (^3.6.0) - Date utilities
- ✅ **recharts** (^2.12.0) - Charts for dashboard

---

## âš¡ Step 2: Start Development Server

After installation completes:

```bash
# Start the dev server
npm run dev
```

Your dashboard will be available at:
**http://localhost:3000**

---

## ðŸŽ¨ Color Palette (Matches Mobile App!)

Your dashboard uses the exact same colors as your mobile app:

| Color | Hex | Usage |
|-------|-----|-------|
| **Gunmetal** | `#202c39` | Text (light), Background (dark) |
| **Peach** | `#f2d492` | Background (light), Text (dark) |
| **Tangerine** | `#f29559` | Primary buttons, CTAs, accents |
| **Sage** | `#b8b08d` | Muted text, secondary elements |

### Using Colors in Code

```tsx
// Tailwind classes
<div className="bg-peach dark:bg-gunmetal">
  <h1 className="text-gunmetal dark:text-peach">Title</h1>
  <button className="bg-tangerine text-white">Click Me</button>
</div>

// CSS variables
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Primary Color
</div>
```

---

## ðŸ› ï¸ What's Included

### 1. Next.js 14 App Router
- âœ… Modern file-based routing
- âœ… Server components by default
- âœ… Built-in API routes
- âœ… Automatic code splitting

### 2. TypeScript Configuration
- âœ… Strict mode enabled
- âœ… Path aliases (`@/*` = `./src/*`)
- âœ… Type checking ready

### 3. Tailwind CSS + Theme
- âœ… Complete color palette
- âœ… Dark mode support (class-based)
- âœ… Custom utility classes
- âœ… Responsive design ready

### 4. API Integration Setup
- âœ… Axios configured
- âœ… API proxy to `localhost:8000`
- âœ… Environment variables ready
- âœ… Services folder structure

### 5. Lucide React Icons
- âœ… Same icon library as mobile app
- âœ… Consistent iconography
- âœ… Tree-shakeable imports

---

## ðŸ"§ Configuration Files

### `next.config.js`
- API proxy to your backend (`localhost:8000`)
- Image domains configured
- React strict mode enabled

### `tailwind.config.js`
- Complete color palette (gunmetal, peach, tangerine, sage)
- Custom border radius variables
- Dark mode class strategy

### `tsconfig.json`
- Path aliases for clean imports
- Strict type checking
- Next.js plugin enabled

---

## ðŸš€ Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## ðŸ"Œ Next Steps

After installation, you'll be ready to build:

### Phase 1: Authentication (1-2 hours)
1. Login page with form
2. Auth service (using your backend)
3. Protected routes
4. User session management

### Phase 2: Dashboard Layout (2-3 hours)
1. Sidebar navigation
2. Top header with user menu
3. Main content area
4. Responsive design

### Phase 3: Core Pages (8-10 hours)
1. **Dashboard** - Stats, recent jobs, applicants
2. **Jobs** - List, create, edit, delete corporate jobs
3. **Applications** - View and manage applicants
4. **Candidates** - Search and browse candidates
5. **Settings** - Company profile, preferences

### Phase 4: Integration (4-5 hours)
1. Connect to backend APIs
2. Real data display
3. Form submissions
4. Error handling

### Phase 5: Polish (2-3 hours)
1. Loading states
2. Error messages
3. Success feedback
4. Animations

**Total Estimated Time: 17-23 hours**

---

## ðŸ"š Learning Resources

### Next.js 14
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Tailwind CSS
- [Official Docs](https://tailwindcss.com/docs)
- [Utility Classes](https://tailwindcss.com/docs/utility-first)

### Lucide React
- [Icon Library](https://lucide.dev/)
- [React Usage](https://lucide.dev/guide/packages/lucide-react)

---

## âœ… Pre-Installation Checklist

Before running `npm install`, make sure you have:

- âœ… **Node.js** installed (v18 or higher recommended)
  ```bash
  node --version  # Should show v18.x or higher
  ```

- âœ… **npm** or **yarn** installed
  ```bash
  npm --version   # Should show 9.x or higher
  ```

- âœ… **Backend running** on `localhost:8000`
  ```bash
  # In another terminal
  cd C:\Dev\ai-job-matchingV2\backend
  python -m uvicorn app.main:app --reload
  ```

---

## ðŸ› Troubleshooting

### If `npm install` fails:

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Try with legacy peer deps**
   ```bash
   npm install --legacy-peer-deps
   ```

### If dev server won't start:

1. **Check if port 3000 is already in use**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Kill the process if needed
   taskkill /PID <PID> /F
   ```

2. **Try a different port**
   ```bash
   npm run dev -- -p 3001
   ```

---

## ðŸŽ¯ Project Goals

This recruiter dashboard will allow:

### For HR Managers at ZedSafe (and other companies):
- âœ… Post corporate job openings
- âœ… View and manage job listings
- âœ… Review applicant profiles and CVs
- âœ… Accept or reject candidates
- âœ… Track hiring pipeline
- âœ… View analytics and statistics

### Technical Goals:
- âœ… Match mobile app's look and feel
- âœ… Use same icon library (Lucide React)
- âœ… Responsive design (desktop + tablet)
- âœ… Type-safe with TypeScript
- âœ… Fast performance with Next.js
- âœ… Clean, maintainable code

---

## ðŸ"Š Current Status

| Component | Status |
|-----------|--------|
| **Project Structure** | âœ… Complete |
| **Configuration Files** | âœ… Complete |
| **Dependencies Defined** | âœ… Complete |
| **Color Palette** | âœ… Complete |
| **Installation** | â³ Ready to run |
| **Development** | â³ Waiting for you! |

---

## 🎉 You're All Set!

Your recruiter dashboard is ready for installation. Just run:

```bash
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
npm install
npm run dev
```

Then open **http://localhost:3000** and you'll see the welcome page!

---

**Created:** November 14, 2025, 4:00 AM  
**Framework:** Next.js 14.2 + TypeScript + Tailwind CSS  
**Icons:** Lucide React (same as mobile app!)  
**Colors:** Gunmetal, Peach, Tangerine, Sage  
**Status:** âœ… Ready to Install  

Made in Zambia ðŸ‡¿ðŸ‡² with â¤ï¸
