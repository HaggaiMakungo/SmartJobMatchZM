# 🎨 JobMatch Color Cheat Sheet

Quick reference for developers - copy & paste these color classes in your components!

---

## 🎯 Most Common Use Cases

### Backgrounds
```tsx
// Dark backgrounds (headers, footers, full screens)
className="bg-primary"           // #202c39 - Main dark
className="bg-secondary"         // #283845 - Lighter variant

// Light backgrounds (cards, sections)
className="bg-white"             // White
className="bg-sage-900"          // #f1efe8 - Subtle cream
className="bg-peach-900"         // #fcf6e9 - Warm subtle
```

### Text Colors
```tsx
// Primary text
className="text-primary"         // #202c39 - Main text on light
className="text-primary-500"     // Same as above

// Secondary/subtle text
className="text-sage-600"        // #c6c0a5 - Muted text
className="text-sage-400"        // #9f9566 - Very muted (placeholders)

// Accent text
className="text-peach-500"       // #f2d492 - Warm highlights
className="text-tangerine-500"   // #f29559 - Attention text
```

### Borders
```tsx
// Normal borders
className="border-sage-400"      // #9f9566 - Default input borders
className="border-sage-200"      // #e3e0d2 - Card borders

// Focus/Active borders
className="border-peach-500"     // #f2d492 - Input focus

// Error borders
className="border-tangerine-400" // #ed701d - Errors/warnings
```

### Buttons (Quick Copy)
```tsx
// Primary CTA (Apply, Submit, Login)
<Button variant="tangerine">Apply Now</Button>
// Result: Orange bg, white text

// Secondary action
<Button variant="primary">Learn More</Button>
// Result: Dark gunmetal bg, peach text

// Tertiary action
<Button variant="outline">Save for Later</Button>
// Result: Transparent bg, sage border & text
```

---

## 🚀 Component Patterns

### Login/Auth Screen
```tsx
// Background gradient
<LinearGradient colors={["#202c39", "#283845"]}>
  
  // Title
  <Text className="text-peach-500 text-3xl font-bold">
  
  // Input
  <Input 
    className="border-sage-400 focus:border-peach-500"
    placeholderTextColor="#9f9566"
  />
  
  // Primary button
  <Button variant="tangerine">Login</Button>
  
  // Link
  <Text className="text-sage-600">Forgot password?</Text>
</LinearGradient>
```

### Job Card
```tsx
<Card variant="default"> {/* white bg, sage-200 border */}
  {/* Company name */}
  <Text className="text-primary-500 font-bold text-lg">
    TechCorp Zambia
  </Text>
  
  {/* Job title */}
  <Text className="text-primary-700 text-xl">
    Software Engineer
  </Text>
  
  {/* Salary highlight */}
  <Text className="text-peach-500 font-semibold">
    ZMW 15,000 - 20,000
  </Text>
  
  {/* Description */}
  <Text className="text-sage-600">
    Join our growing team...
  </Text>
  
  {/* Tags */}
  <View className="bg-sage-900 px-3 py-1 rounded-full">
    <Text className="text-primary text-xs">Remote</Text>
  </View>
  
  {/* Apply button */}
  <Button variant="tangerine">Apply Now</Button>
</Card>
```

### Profile Screen
```tsx
// Header
<View className="bg-primary p-6">
  <Text className="text-peach-500 text-2xl">My Profile</Text>
</View>

// Section divider
<View className="border-b border-sage-300 my-4" />

// Success badge
<View className="bg-sage-600 px-4 py-2 rounded-lg">
  <Text className="text-white">Profile Complete</Text>
</View>

// Edit button
<Button variant="outline">Edit Profile</Button>

// Save button
<Button variant="tangerine">Save Changes</Button>
```

### Success Message
```tsx
<View className="bg-peach-900 border-2 border-peach-500 rounded-lg p-4">
  <Text className="text-primary font-semibold">
    ✓ Application submitted successfully!
  </Text>
  <Text className="text-sage-600 text-sm">
    You'll hear back within 3-5 business days
  </Text>
</View>
```

### Error Message
```tsx
<View className="bg-tangerine-900 border-2 border-tangerine-500 rounded-lg p-4">
  <Text className="text-primary font-semibold">
    ⚠ Error submitting application
  </Text>
  <Text className="text-sage-600 text-sm">
    Please check your internet connection
  </Text>
</View>
```

---

## 🎨 Gradient Combinations

```tsx
// Professional dark gradient (Welcome, Headers)
colors={["#202c39", "#283845"]}  // primary → secondary

// Warm accent gradient (Cards, Highlights)
colors={["#f2d492", "#f5dca7"]}  // peach-500 → peach-600

// Energetic gradient (CTAs, Featured items)
colors={["#f29559", "#f2d492"]}  // tangerine → peach

// Subtle light gradient (Backgrounds)
colors={["#f1efe8", "#ffffff"]}  // sage-900 → white
```

---

## 💡 Pro Tips

### DO ✅
```tsx
// Use tangerine for primary CTAs
<Button variant="tangerine">Apply Now</Button>

// Use sage for borders and secondary text
<View className="border border-sage-400">

// Use peach for success states
<Text className="text-peach-500">✓ Success!</Text>

// Use primary gradients for backgrounds
colors={["#202c39", "#283845"]}
```

### DON'T ❌
```tsx
// Don't use tangerine for backgrounds (too bright)
className="bg-tangerine-500" // ❌

// Don't use primary for error states
className="text-primary" // ❌ Use tangerine-500 instead

// Don't mix too many bright colors
<View className="bg-peach-500"> // ❌ Too bright for large areas
  <Text className="text-tangerine-500">
</View>
```

---

## 🔍 When to Use Each Color

| Color | When to Use | Examples |
|-------|-------------|----------|
| **Primary** (#202c39) | Headers, main backgrounds, primary text | App bar, footer, body text |
| **Secondary** (#283845) | Complementary backgrounds, gradients | Sidebar, section backgrounds |
| **Sage** (#b8b08d) | Borders, secondary text, subtle accents | Input borders, helper text, dividers |
| **Peach** (#f2d492) | Success, highlights, positive feedback | Success messages, badges, icons |
| **Tangerine** (#f29559) | CTAs, actions, errors, urgency | Apply button, submit, error states |

---

## 📱 Screen-Specific Patterns

### Welcome/Onboarding
- **Background:** primary → secondary gradient
- **Logo/Title:** peach-500
- **Subtitle:** sage-600
- **Primary CTA:** tangerine-500
- **Secondary CTA:** sage outline

### Job Listing
- **Card background:** white
- **Card border:** sage-200
- **Job title:** primary-500
- **Company:** primary-700
- **Salary:** peach-500
- **Tags:** sage-900 bg
- **Apply button:** tangerine-500

### Application Form
- **Background:** sage-900 (subtle)
- **Input borders:** sage-400 (normal), peach-500 (focus)
- **Labels:** primary-500
- **Submit button:** tangerine-500
- **Cancel button:** sage outline

---

## 🎯 Copy-Paste Snippets

### Input with Label
```tsx
<View>
  <Text className="text-primary-500 font-medium mb-2">Email</Text>
  <TextInput 
    className="border-2 border-sage-400 rounded-lg px-4 py-3"
    placeholderTextColor="#9f9566"
    placeholder="Enter your email"
  />
</View>
```

### Button Group
```tsx
<View className="flex-row gap-3">
  <Button variant="tangerine" className="flex-1">Confirm</Button>
  <Button variant="outline" className="flex-1">Cancel</Button>
</View>
```

### Status Badge
```tsx
{/* Success */}
<View className="bg-sage-600 px-3 py-1 rounded-full">
  <Text className="text-white text-xs">Active</Text>
</View>

{/* Warning */}
<View className="bg-peach-500 px-3 py-1 rounded-full">
  <Text className="text-primary text-xs">Pending</Text>
</View>

{/* Error */}
<View className="bg-tangerine-500 px-3 py-1 rounded-full">
  <Text className="text-white text-xs">Rejected</Text>
</View>
```

---

**Pro Tip:** Keep this file open while coding for quick color reference! 🚀

**Last Updated:** November 7, 2025
