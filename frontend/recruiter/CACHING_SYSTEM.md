# 📦 Page State Caching System

## Overview

CAMSS 2.0 now includes a **persistent state caching system** that remembers your exact position on each page. When you navigate away and return, everything picks up exactly where you left off.

## ✨ What Gets Cached?

### **Jobs Page** (`/dashboard/jobs`)
- ✅ Selected job
- ✅ Match score filter (slider position)
- ✅ Sort preference (match score / experience / location)
- ✅ Filter panel visibility (show/hide)
- ✅ Current pagination page
- ✅ Job details expansion state
- ✅ Selected candidates for bulk actions

### **Candidates Page** (`/dashboard/candidates`)
- ✅ Search query
- ✅ Filter panel visibility
- ✅ Favorites filter toggle
- ✅ All filter values (stage, location, min/max score)
- ✅ Selected candidates for bulk actions

### **Dashboard** (Coming soon)
- ✅ Last viewed page
- ✅ Dashboard preferences

## 🎯 How It Works

The caching system uses **Zustand** with **persist middleware** to automatically save state to `localStorage`:

```typescript
// State is automatically persisted to localStorage
const { jobsPage, setJobsPageCache } = usePageCacheStore();

// Initialize component state from cache
const [selectedJob, setSelectedJob] = useState<Job | null>(null);
const [minMatchScore, setMinMatchScore] = useState(jobsPage.minMatchScore);

// Automatically cache changes
useEffect(() => {
  setJobsPageCache({
    selectedJobId: selectedJob?.id || null,
    minMatchScore,
    // ... other state
  });
}, [selectedJob, minMatchScore]);
```

## 💾 Storage Details

- **Storage Key**: `camss-page-cache`
- **Storage Type**: Browser `localStorage`
- **Cache Duration**: Persistent (survives browser restarts)
- **Cache Validation**: 5-minute TTL for data freshness checks (configurable)

## 🔄 Cache Behavior

### **Automatic Caching**
- Every state change is automatically saved
- No manual "save" button needed
- Works seamlessly in the background

### **Cache Restoration**
- On page load, cached state is automatically restored
- If job/candidate no longer exists, falls back to first available
- Handles edge cases gracefully (empty lists, deleted items)

### **Cache Invalidation**
- Manual: User can clear cache via settings (coming soon)
- Automatic: Cache validates timestamp on load
- Logout: Cache persists between sessions (by design)

## 🛠️ API Reference

### **usePageCacheStore()**

```typescript
interface PageCacheStore {
  // Jobs Page
  jobsPage: JobsPageCache;
  setJobsPageCache: (cache: Partial<JobsPageCache>) => void;
  resetJobsPageCache: () => void;
  
  // Candidates Page  
  candidatesPage: CandidatesPageCache;
  setCandidatesPageCache: (cache: Partial<CandidatesPageCache>) => void;
  resetCandidatesPageCache: () => void;
  
  // Global
  clearAllCache: () => void;
  isCacheValid: (timestamp: number, maxAge?: number) => boolean;
}
```

### **JobsPageCache Type**

```typescript
interface JobsPageCache {
  selectedJobId: string | null;
  minMatchScore: number;
  sortBy: 'match_score' | 'experience' | 'location';
  showFilters: boolean;
  currentPage: number;
  isJobExpanded: boolean;
  selectedCandidateIds: string[];
  lastFetched: number; // timestamp
}
```

### **CandidatesPageCache Type**

```typescript
interface CandidatesPageCache {
  searchQuery: string;
  showFilters: boolean;
  showFavorites: boolean;
  filters: {
    stage: string;
    location: string;
    minScore: number;
    maxScore: number;
  };
  selectedCandidateIds: string[];
  lastFetched: number; // timestamp
}
```

## 📝 Usage Examples

### **Example 1: Reading Cached State**

```typescript
import { usePageCacheStore } from '@/store/page-cache.store';

function MyComponent() {
  const { jobsPage } = usePageCacheStore();
  
  // Initialize from cache
  const [minScore, setMinScore] = useState(jobsPage.minMatchScore);
  
  console.log('Restored min score:', minScore); // e.g., 75
}
```

### **Example 2: Updating Cache**

```typescript
import { usePageCacheStore } from '@/store/page-cache.store';

function MyComponent() {
  const { setJobsPageCache } = usePageCacheStore();
  
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    
    // Cache will be automatically updated via useEffect
    // OR manually update:
    setJobsPageCache({ selectedJobId: job.id });
  };
}
```

### **Example 3: Clearing Cache**

```typescript
import { usePageCacheStore } from '@/store/page-cache.store';

function SettingsPage() {
  const { clearAllCache } = usePageCacheStore();
  
  return (
    <button onClick={clearAllCache}>
      Clear All Cached Data
    </button>
  );
}
```

### **Example 4: Checking Cache Validity**

```typescript
import { usePageCacheStore } from '@/store/page-cache.store';

function MyComponent() {
  const { jobsPage, isCacheValid } = usePageCacheStore();
  
  // Check if cache is less than 5 minutes old
  const isValid = isCacheValid(jobsPage.lastFetched);
  
  if (!isValid) {
    // Re-fetch data if cache is stale
    fetchFreshData();
  }
}
```

## 🎨 User Experience Benefits

1. **Seamless Navigation**: Switch between pages without losing your place
2. **Persistent Filters**: Filter settings survive page navigation
3. **Bulk Selection Memory**: Selected items persist when returning to page
4. **Search Persistence**: Search queries remembered across sessions
5. **Pagination Memory**: Return to the exact page you were viewing

## 🔒 Privacy & Security

- **Local Only**: All cache data stays in browser localStorage
- **User-Specific**: Each browser has its own cache
- **No Sensitive Data**: Passwords and tokens use separate, secure storage
- **Clear on Demand**: Users can clear cache anytime (coming soon)

## 🚀 Performance

- **Instant Load**: No loading spinners for cached state
- **Minimal Storage**: ~5-10KB per user
- **No Network Calls**: State restoration is instant
- **Efficient Updates**: Only changed fields are updated

## 📊 Future Enhancements

- [ ] Cache expiration UI (show cache age)
- [ ] Manual cache refresh button
- [ ] Settings page for cache management
- [ ] Export/import cache for backup
- [ ] Multi-device sync (requires backend)

## 🐛 Troubleshooting

### **Cache Not Working?**
1. Check browser localStorage is enabled
2. Verify no browser extensions are blocking storage
3. Check console for errors

### **Stale Data?**
The cache stores UI state, not API data. Fresh data is always fetched from the backend.

### **Clear Cache**
```javascript
// In browser console:
localStorage.removeItem('camss-page-cache');
```

## 🧪 Testing

```typescript
// Test cache persistence
it('should restore job selection from cache', () => {
  const { result } = renderHook(() => usePageCacheStore());
  
  act(() => {
    result.current.setJobsPageCache({ selectedJobId: 'JOB123' });
  });
  
  expect(result.current.jobsPage.selectedJobId).toBe('JOB123');
});
```

---

## 📚 Related Files

- **Store**: `src/store/page-cache.store.ts`
- **Jobs Page**: `src/pages/JobsPage.tsx`
- **Candidates Page**: `src/pages/CandidatesPage.tsx`
- **Types**: `src/types/index.ts`

---

**Built with ❤️ for CAMSS 2.0**  
*Making recruiting smoother, one cached state at a time!*
