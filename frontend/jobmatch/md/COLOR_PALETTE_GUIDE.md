# 🎨 JobMatch Color Palette Guide

## Overview
This document describes the new color palette for the JobMatch mobile app, designed to create a professional, warm, and trustworthy user experience.

---

## Color Philosophy

The palette combines **deep, professional blues** with **warm, inviting earth tones** to create a balance between:
- **Trust & Stability** (Gunmetal blues)
- **Warmth & Approachability** (Sage, Peach, Tangerine)
- **Energy & Action** (Atomic Tangerine)

---

## Color Palette

### 1. Primary - Gunmetal
**Hex:** `#202c39`  
**Usage:** Main brand color, headers, primary backgrounds  
**Personality:** Professional, stable, trustworthy

```javascript
primary: {
  DEFAULT: '#202c39',  // Main use
  100: '#06090b',      // Darkest - text on light backgrounds
  200: '#0c1116',      
  300: '#131a21',      
  400: '#19222c',      
  500: '#202c39',      // Default
  600: '#3e556e',      // Lighter variants
  700: '#5c7fa4',      
  800: '#93aac2',      // Very light - hover states
  900: '#c9d4e1',      // Lightest - backgrounds
}
```

**Use Cases:**
- App headers and navigation bars
- Primary text on light backgrounds
- Footer backgrounds
- Dark mode base color

---

### 2. Secondary - Gunmetal (Lighter Variant)
**Hex:** `#283845`  
**Usage:** Secondary elements, complementary to primary  
**Personality:** Professional, cohesive, harmonious

```javascript
secondary: {
  DEFAULT: '#283845',
  100: '#080b0e',
  200: '#10161b',
  300: '#172129',
  400: '#1f2c36',
  500: '#283845',      // Default
  600: '#456077',
  700: '#6589a7',
  800: '#99b1c4',
  900: '#ccd8e2',
}
```

**Use Cases:**
- Secondary buttons
- Sidebar backgrounds
- Gradient partner with primary
- Alternative section backgrounds

---

### 3. Sage (Accent Color)
**Hex:** `#b8b08d`  
**Usage:** Borders, subtle accents, informational elements  
**Personality:** Natural, calm, sophisticated

```javascript
sage: {
  DEFAULT: '#b8b08d',
  100: '#282519',      // Darkest
  200: '#504b32',      
  300: '#78704b',      
  400: '#9f9566',      // Input placeholders
  500: '#b8b08d',      // Default - borders
  600: '#c6c0a5',      
  700: '#d5d0bb',      
  800: '#e3e0d2',      
  900: '#f1efe8',      // Lightest - subtle backgrounds
}
```

**Use Cases:**
- Input borders (normal state)
- Secondary text
- Subtle backgrounds
- Dividers and separators
- Outline buttons
- Helper text

---

### 4. Peach Yellow (Highlight Color)
**Hex:** `#f2d492`  
**Usage:** Highlights, success states, warmth  
**Personality:** Warm, inviting, positive

```javascript
peach: {
  DEFAULT: '#f2d492',
  100: '#453208',      // Darkest
  200: '#8b6410',      
  300: '#d09618',      
  400: '#eab84c',      
  500: '#f2d492',      // Default - highlights
  600: '#f5dca7',      
  700: '#f7e5bd',      
  800: '#faeed3',      
  900: '#fcf6e9',      // Lightest - subtle highlights
}
```

**Use Cases:**
- Success messages
- Positive feedback
- Icons on dark backgrounds
- Accent text
- Badge backgrounds
- Warm glows and highlights

---

### 5. Atomic Tangerine (Action Color)
**Hex:** `#f29559`  
**Usage:** Call-to-action buttons, important actions  
**Personality:** Energetic, actionable, exciting

```javascript
tangerine: {
  DEFAULT: '#f29559',
  100: '#3d1c05',      // Darkest
  200: '#7b370a',      
  300: '#b8530f',      
  400: '#ed701d',      
  500: '#f29559',      // Default - primary CTAs
  600: '#f4ab7b',      // Hover state
  700: '#f7c09c',      
  800: '#fad5bd',      
  900: '#fceade',      // Lightest
}
```

**Use Cases:**
- Primary CTA buttons (Apply Now, Submit, etc.)
- Important notifications
- Active states
- Error/warning messages
- Progress indicators
- Action icons

---

## Usage Guidelines

### Color Hierarchy
1. **Primary (Gunmetal)** - Main brand presence (backgrounds, headers)
2. **Tangerine** - Call-to-action elements (buttons, links)
3. **Peach** - Highlights and positive feedback
4. **Sage** - Supporting elements (borders, secondary text)
5. **Secondary (Gunmetal)** - Complementary backgrounds

### Accessibility
- **Text on Primary/Secondary:** Use Peach (500+) or white for contrast
- **Text on Sage:** Use Primary (100-300) for readability
- **Text on Peach/Tangerine:** Use white or Primary-100 for contrast
- **Minimum contrast ratio:** 4.5:1 for normal text, 3:1 for large text

### Gradient Combinations
```javascript
// Dark professional gradient
['#202c39', '#283845']  // primary to secondary

// Warm welcome gradient
['#283845', '#456077']  // secondary to secondary-600

// Energetic gradient
['#f29559', '#f2d492']  // tangerine to peach
```

---

## Component Color Mapping

### Buttons
```typescript
variant: 'primary'    → bg-primary, text-peach-500
variant: 'secondary'  → bg-secondary, text-peach-600
variant: 'tangerine'  → bg-tangerine-500, text-white (CTAs)
variant: 'outline'    → border-sage-500, text-sage-500
variant: 'ghost'      → transparent, text-sage-600
```

### Inputs
```typescript
border: border-sage-400 (normal)
border: border-peach-500 (focus)
border: border-tangerine-400 (error)
text: text-primary
placeholder: #9f9566 (sage-400)
```

### Cards
```typescript
variant: 'default'  → bg-white, border-sage-200
variant: 'outlined' → transparent, border-sage-300
variant: 'elevated' → bg-white, shadow-lg, border-sage-100
```

---

## Color Psychology in JobMatch Context

### Why This Palette Works for Job Matching:

1. **Gunmetal (Primary/Secondary)** 
   - Conveys professionalism and corporate trust
   - Non-aggressive, suitable for job seekers and recruiters
   - Creates a serious, focused atmosphere

2. **Sage**
   - Represents growth and new opportunities
   - Calming effect reduces job search anxiety
   - Natural, organic feel for "natural fit" matching

3. **Peach Yellow**
   - Optimism about finding the right job
   - Warmth and encouragement
   - Highlights positive outcomes

4. **Atomic Tangerine**
   - Energy to take action (apply for jobs)
   - Excitement about career opportunities
   - Urgency without being alarming

---

## Design Tokens (CSS/Tailwind)

```css
/* Primary Colors */
--color-primary: #202c39;
--color-secondary: #283845;

/* Accent Colors */
--color-sage: #b8b08d;
--color-peach: #f2d492;
--color-tangerine: #f29559;

/* Semantic Colors */
--color-success: #b8b08d;    /* sage */
--color-warning: #f2d492;    /* peach */
--color-error: #f29559;      /* tangerine */
--color-info: #6589a7;       /* secondary-700 */
```

---

## Quick Reference

| Color | Hex | RGB | Use For |
|-------|-----|-----|---------|
| Primary | #202c39 | rgb(32,44,57) | Headers, main backgrounds |
| Secondary | #283845 | rgb(40,56,69) | Complementary backgrounds |
| Sage | #b8b08d | rgb(184,176,141) | Borders, secondary text |
| Peach | #f2d492 | rgb(242,212,146) | Highlights, success |
| Tangerine | #f29559 | rgb(242,149,89) | CTAs, actions |

---

## Examples

### Login Screen
- Background: Gradient (primary → secondary)
- Input borders: sage-400
- Input focus: peach-500
- Login button: tangerine-500
- Link text: peach-600

### Job Card
- Background: white
- Border: sage-200
- Company name: primary-500
- Job title: primary-700
- Salary highlight: peach-500
- Apply button: tangerine-500

### Profile Screen
- Header: primary
- Section dividers: sage-300
- Success badges: sage-600
- Edit buttons: outline (sage-500)
- Save button: tangerine-500

---

**Last Updated:** November 7, 2025  
**Version:** 1.0  
**Designer:** AI Job Matching Team
