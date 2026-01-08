# 📊 Analytics Page - Visual Guide

## 🖼️ Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ANALYTICS                                  [7d ▼] [🔄] [📥 Export] │
│ Insights into your hiring performance                               │
├─────────────────────────────────────────────────────────────────────┤
│ [Overview] [Jobs] [Candidates]                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 💼       │  │ 👥       │  │ 🎯       │  │ 🏆       │          │
│  │ Active   │  │ Total    │  │ Avg Match│  │ Conv.    │          │
│  │ Jobs     │  │ Candid.  │  │ Score    │  │ Rate     │          │
│  │          │  │          │  │          │  │          │          │
│  │   12     │  │   125    │  │   85%    │  │  12.8%   │          │
│  │  ↑ 8%    │  │  ↑ 15%   │  │  ↑ 3%    │  │  ↓ 2%    │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ Hiring Funnel        │  │ Jobs by Category     │               │
│  ├──────────────────────┤  ├──────────────────────┤               │
│  │ Saved       [████]100│  │ Engineering [████] 45│               │
│  │ Invited     [███] 75 │  │ Sales       [███] 38 │               │
│  │ Screening   [██]  60 │  │ Marketing   [██]  30 │               │
│  │ Interview   [█]   40 │  │ HR          [█]   18 │               │
│  │ Offer       [█]   25 │  │ IT          [█]   12 │               │
│  │ Hired       []    15 │  │ Finance     []     8 │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────────────────────────────────┐             │
│  │ Recent Jobs                                       │             │
│  ├──────────────────────────────────────────────────┤             │
│  │ Logistics Coordinator    📍 Lusaka  🕐 2d ago  🟢 │             │
│  │ Warehouse Manager        📍 Ndola   🕐 5d ago  🟢 │             │
│  │ Delivery Driver          📍 Kitwe   🕐 1w ago  🟢 │             │
│  └──────────────────────────────────────────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Tab Views

### **📊 Overview Tab**

Shows high-level metrics and overall performance.

**Components:**
```
1. Key Metrics Row (4 cards)
   ├─ Active Jobs (blue icon)
   ├─ Total Candidates (green icon)
   ├─ Avg Match Score (purple icon)
   └─ Conversion Rate (tangerine icon)

2. Charts Row (2 charts side-by-side)
   ├─ Hiring Funnel (left)
   └─ Jobs by Category (right)

3. Recent Jobs List (full width)
   └─ Shows last 5-10 jobs with status
```

---

### **💼 Jobs Tab**

Focuses on job-specific metrics.

**Components:**
```
1. Status Cards Row (3 cards)
   ├─ Published (green border)
   ├─ Draft (yellow border)
   └─ Closed (red border)

2. Charts Row (2 charts side-by-side)
   ├─ Jobs by Category (left)
   └─ Jobs by Location (right)
```

---

### **👥 Candidates Tab**

Shows candidate pipeline analytics.

**Components:**
```
1. Stage Cards Row (up to 7 cards)
   ├─ Saved (gray)
   ├─ Invited (blue)
   ├─ Screening (purple)
   ├─ Interview (yellow)
   ├─ Offer (green)
   ├─ Hired (emerald)
   └─ Rejected (red)

2. Charts Row (2 charts side-by-side)
   ├─ Pipeline Overview (left)
   └─ Candidates by Location (right)
```

---

## 🎯 Metric Card Design

```
┌──────────────────────┐
│ 💼  Active Jobs     │  ← Label with icon
│                      │
│ 12          ↑ 8%    │  ← Value & Trend
└──────────────────────┘
   │          │    │
   Icon    Value  Trend
```

**Colors by Type:**
- 💼 Jobs: Blue background
- 👥 Candidates: Green background
- 🎯 Match Score: Purple background
- 🏆 Conversion: Tangerine background

---

## 📊 Chart Types

### **1. Horizontal Bar Chart**

Used for: Categories, Locations, Funnel stages

```
Engineering  ████████████████ 45
Sales        ████████████ 38
Marketing    ████████ 30
HR           ████ 18
```

**Features:**
- Animated on load
- Shows count at end
- Max bar = 100% width
- Color-coded by type

---

### **2. Funnel Chart**

Used for: Hiring pipeline stages

```
Saved (100)    ████████████████████
Invited (75)   ████████████████
Screening (60) █████████████
Interview (40) █████████
Offer (25)     █████
Hired (15)     ███
```

**Features:**
- Width decreases by stage
- Shows conversion at each step
- Tangerine color
- Animated bars

---

## 🎛️ Controls Breakdown

### **Date Range Dropdown**

```
┌──────────────┐
│ Last 30 days ▼│
├──────────────┤
│ Last 7 days  │
│ Last 30 days │  ← Selected
│ Last 90 days │
│ All time     │
└──────────────┘
```

**Behavior:**
- Changes data timeframe
- Triggers automatic refresh
- Shows in all tabs

---

### **Refresh Button**

```
┌───┐
│ 🔄 │  ← Normal state
└───┘

┌───┐
│ ⟳ │  ← Loading (spinning)
└───┘
```

**Behavior:**
- Refetches all data
- Shows spinner while loading
- Disabled during refresh

---

### **Export Button**

```
┌─────────────┐
│ 📥 Export   │
└─────────────┘
```

**Behavior:**
- Exports current view to CSV
- Includes filtered data
- Downloads automatically

---

## 🎨 Color System

### **Status Colors:**
```
🟢 Green   - Published, Hired, Success
🟡 Yellow  - Draft, Interview, Warning
🔴 Red     - Closed, Rejected, Alert
🔵 Blue    - Invited, Information
🟣 Purple  - Screening, Processing
🟠 Orange  - Primary actions (Tangerine)
⚪ Gray    - Saved, Neutral
```

### **Chart Colors:**
```
Tangerine (#F2994A) - Primary charts
Blue (#3B82F6)      - Job metrics
Green (#10B981)     - Success/Growth
Purple (#8B5CF6)    - Processing
Yellow (#F59E0B)    - Warnings
Red (#EF4444)       - Errors/Rejected
```

---

## 📱 Responsive Behavior

### **Desktop (1920px+)**
```
┌─────────────────────────────────────┐
│ [Card] [Card] [Card] [Card]        │  4 columns
│ [Chart──────] [Chart──────]        │  2 columns
└─────────────────────────────────────┘
```

### **Laptop (1280px+)**
```
┌───────────────────────────┐
│ [Card] [Card]            │  2 columns
│ [Card] [Card]            │
│ [Chart──────]            │  1 column
│ [Chart──────]            │
└───────────────────────────┘
```

### **Tablet (768px+)**
```
┌─────────────┐
│ [Card]      │  1 column
│ [Card]      │
│ [Card]      │
│ [Card]      │
│ [Chart]     │
│ [Chart]     │
└─────────────┘
```

---

## ⚡ Interactive States

### **Hover Effects**

**Metric Cards:**
```
Normal:  border-gray-700
Hover:   border-tangerine + scale(1.02)
```

**Tab Buttons:**
```
Inactive: text-gray-400 border-transparent
Active:   text-tangerine border-tangerine
Hover:    text-white
```

### **Loading States**

**Full Page:**
```
┌─────────────────┐
│                 │
│      ⟳         │
│ Loading        │
│ analytics...   │
│                 │
└─────────────────┘
```

**Partial (Refresh):**
```
Data stays visible
Overlay with spinner
"Refreshing..." text
```

---

## 🎯 Empty States

### **No Jobs Posted**
```
┌──────────────────────┐
│      📋              │
│  No jobs posted yet  │
│                      │
│  [Post a Job]        │
└──────────────────────┘
```

### **No Candidates Saved**
```
┌──────────────────────┐
│      👥              │
│ No candidates saved  │
│                      │
│  [Browse Jobs]       │
└──────────────────────┘
```

---

## 📊 Chart Animations

### **Bar Growth**
```
Frame 1: [        ]  0%
Frame 2: [█       ] 20%
Frame 3: [███     ] 40%
Frame 4: [█████   ] 60%
Frame 5: [███████ ] 80%
Frame 6: [████████] 100%
```

**Duration:** 0.3s ease-out

---

## 🎨 Typography

### **Headers:**
```
Page Title:    text-3xl font-bold text-white
Section Title: text-lg font-semibold text-white
Card Label:    text-sm text-gray-400
Card Value:    text-3xl font-bold text-white
```

### **Body Text:**
```
Description: text-gray-400
Numbers:     text-white font-medium
Trends:      text-green-400 / text-red-400
```

---

## 🔍 Data Tooltips (Future)

On hover over charts:
```
┌──────────────────┐
│ Engineering      │
│ 45 jobs (28%)    │
│ +5 this month    │
└──────────────────┘
```

---

## 🎯 Success Indicators

### **What Good Analytics Look Like:**

```
Active Jobs:      12+    (hiring actively)
Candidates:       50+    (strong pipeline)
Avg Match:        80%+   (quality matches)
Conversion:       10-15% (healthy rate)
```

### **What Needs Attention:**

```
Active Jobs:      <5     (not enough opportunities)
Candidates:       <20    (weak pipeline)
Avg Match:        <60%   (poor matches)
Conversion:       <5%    (losing candidates)
```

---

## 📈 Trend Indicators

```
↑ Green  - Positive trend (good)
↓ Red    - Negative trend (needs attention)
→ Gray   - No change (stable)
```

**Calculation:**
```
Trend % = ((Current - Previous) / Previous) × 100
```

---

## 🎉 Key Takeaways

### **What Makes It Great:**
- ✅ Clean, professional design
- ✅ Multiple view options (tabs)
- ✅ Interactive charts
- ✅ Real-time updates
- ✅ Export functionality
- ✅ Trend tracking

### **Perfect For:**
- 📊 Stakeholder presentations
- 📈 Performance tracking
- 🎯 Identifying bottlenecks
- 💼 Hiring optimization
- 📝 Final year project demo

---

**Your Analytics page is PRODUCTION READY!** 🚀📊

Test it now: `http://localhost:3000/dashboard/analytics`
