# 🚀 Page Caching - Quick Reference

## Setup (5 minutes)

### 1. Install Dependencies
```bash
# Already installed ✅
npm install zustand
```

### 2. Import Store
```typescript
import { usePageCacheStore } from '@/store/page-cache.store';
```

### 3. Use in Component
```typescript
function MyPage() {
  const { jobsPage, setJobsPageCache } = usePageCacheStore();
  
  // Initialize from cache
  const [minScore, setMinScore] = useState(jobsPage.minMatchScore);
  
  // Auto-cache changes
  useEffect(() => {
    setJobsPageCache({ minMatchScore: minScore });
  }, [minScore]);
}
```

---

## API Quick Reference

### Read Cache
```typescript
const { jobsPage, candidatesPage, dashboard } = usePageCacheStore();
```

### Update Cache (Partial)
```typescript
const { setJobsPageCache } = usePageCacheStore();
setJobsPageCache({ minMatchScore: 80 });
```

### Reset Page Cache
```typescript
const { resetJobsPageCache } = usePageCacheStore();
resetJobsPageCache(); // Back to defaults
```

### Clear All Cache
```typescript
const { clearAllCache } = usePageCacheStore();
clearAllCache(); // Nuclear option
```

### Check Cache Validity
```typescript
const { isCacheValid, jobsPage } = usePageCacheStore();
if (isCacheValid(jobsPage.lastFetched)) {
  // Cache is fresh
}
```

---

## Common Patterns

### Pattern 1: Initialize from Cache
```typescript
const { jobsPage } = usePageCacheStore();
const [state, setState] = useState(jobsPage.someValue);
```

### Pattern 2: Auto-Save Changes
```typescript
const { setJobsPageCache } = usePageCacheStore();

useEffect(() => {
  setJobsPageCache({ 
    someValue: state,
    anotherValue: otherState 
  });
}, [state, otherState]);
```

### Pattern 3: Restore Complex State
```typescript
const { jobsPage } = usePageCacheStore();
const [selected, setSelected] = useState<Set<string>>(
  new Set(jobsPage.selectedCandidateIds)
);

useEffect(() => {
  setJobsPageCache({
    selectedCandidateIds: Array.from(selected)
  });
}, [selected]);
```

---

## Cache Structure

```typescript
// Jobs Page Cache
{
  selectedJobId: string | null,
  minMatchScore: number,
  sortBy: 'match_score' | 'experience' | 'location',
  showFilters: boolean,
  currentPage: number,
  isJobExpanded: boolean,
  selectedCandidateIds: string[],
  lastFetched: number
}

// Candidates Page Cache
{
  searchQuery: string,
  showFilters: boolean,
  showFavorites: boolean,
  filters: {
    stage: string,
    location: string,
    minScore: number,
    maxScore: number
  },
  selectedCandidateIds: string[],
  lastFetched: number
}
```

---

## Best Practices

### ✅ DO
- Initialize state from cache on mount
- Use useEffect to auto-cache changes
- Handle missing cache values gracefully
- Convert Sets to Arrays before caching
- Update cache incrementally (partial updates)

### ❌ DON'T
- Cache API data (only UI state)
- Cache sensitive information (passwords, tokens)
- Cache large objects (>100KB)
- Update cache on every render
- Forget to convert Arrays back to Sets

---

## Examples

### Example: Cache Filter State
```typescript
function JobsPage() {
  const { jobsPage, setJobsPageCache } = usePageCacheStore();
  const [minScore, setMinScore] = useState(jobsPage.minMatchScore);
  
  useEffect(() => {
    setJobsPageCache({ minMatchScore: minScore });
  }, [minScore]);
  
  return (
    <input 
      type="range" 
      value={minScore}
      onChange={(e) => setMinScore(Number(e.target.value))}
    />
  );
}
```

### Example: Cache Selections
```typescript
function CandidatesPage() {
  const { candidatesPage, setCandidatesPageCache } = usePageCacheStore();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(candidatesPage.selectedCandidateIds)
  );
  
  useEffect(() => {
    setCandidatesPageCache({
      selectedCandidateIds: Array.from(selected)
    });
  }, [selected]);
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };
}
```

### Example: Conditional Cache Restoration
```typescript
function JobsPage() {
  const { jobsPage } = usePageCacheStore();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  useEffect(() => {
    fetchJobs().then(jobList => {
      setJobs(jobList);
      
      // Try to restore cached job
      if (jobsPage.selectedJobId) {
        const cached = jobList.find(j => j.id === jobsPage.selectedJobId);
        setSelectedJob(cached || jobList[0]); // Fallback to first
      } else {
        setSelectedJob(jobList[0]);
      }
    });
  }, []);
}
```

---

## Debugging

### View Cache in Console
```javascript
JSON.parse(localStorage.getItem('camss-page-cache'))
```

### Clear Cache
```javascript
localStorage.removeItem('camss-page-cache')
```

### Monitor Cache Changes
```typescript
const store = usePageCacheStore();
console.log('Current cache:', store.jobsPage);
```

---

## Testing

### Test Cache Persistence
```typescript
it('should persist job selection', () => {
  const { result } = renderHook(() => usePageCacheStore());
  
  act(() => {
    result.current.setJobsPageCache({ selectedJobId: 'JOB123' });
  });
  
  expect(result.current.jobsPage.selectedJobId).toBe('JOB123');
});
```

### Test Cache Reset
```typescript
it('should reset to defaults', () => {
  const { result } = renderHook(() => usePageCacheStore());
  
  act(() => {
    result.current.setJobsPageCache({ minMatchScore: 80 });
    result.current.resetJobsPageCache();
  });
  
  expect(result.current.jobsPage.minMatchScore).toBe(0);
});
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Cache not persisting | Check localStorage is enabled |
| Stale cache data | Cache only stores UI state, not API data |
| Large cache size | Remove unnecessary fields from cache |
| Cache not clearing | Call `clearAllCache()` or remove from localStorage |
| Cache breaking app | Reset to defaults and rebuild incrementally |

---

## Performance Tips

1. **Debounce rapid changes** to avoid too many cache updates
2. **Use partial updates** to only update changed fields
3. **Keep cache small** - only essential UI state
4. **Validate on restore** - handle missing/invalid cached data
5. **Don't cache everything** - only user-facing state

---

## Migration Guide

### Adding Cache to New Page

1. **Add cache interface** to `page-cache.store.ts`
2. **Add state** to store
3. **Add setters** for the state
4. **Initialize** component state from cache
5. **Auto-save** via useEffect

```typescript
// 1. Add interface
interface NewPageCache {
  someValue: string;
  lastFetched: number;
}

// 2. Add to store
newPage: NewPageCache;

// 3. Add setter
setNewPageCache: (cache: Partial<NewPageCache>) => void;

// 4-5. Use in component (see examples above)
```

---

## File Locations

```
frontend/recruiter/
├── src/
│   ├── store/
│   │   └── page-cache.store.ts    ← Store definition
│   └── pages/
│       ├── JobsPage.tsx            ← Uses cache
│       └── CandidatesPage.tsx      ← Uses cache
├── CACHING_SYSTEM.md               ← Full documentation
├── CACHING_IMPLEMENTATION.md       ← Implementation summary
├── CACHING_DEMO.md                 ← User guide
└── CACHING_QUICKREF.md             ← This file
```

---

## One-Liner Cheatsheet

```typescript
// Read cache
const { jobsPage } = usePageCacheStore();

// Write cache
setJobsPageCache({ key: value });

// Clear cache
clearAllCache();

// Initialize from cache
const [state, setState] = useState(cache.value);

// Auto-save to cache
useEffect(() => { setCache({ state }); }, [state]);
```

---

**Need help?** Check `CACHING_SYSTEM.md` for full documentation.

**Version:** 1.0.0  
**Last Updated:** December 21, 2024
