# Quick Reference - JobMatch Fixes

## Files Modified (3 files)

```
app/(tabs)/index.tsx          - Home screen adjustments
app/(tabs)/jobs.tsx           - Pagination + Match Me Now button  
app/job-details.tsx           - Save job functionality
```

---

## Feature Matrix

| Feature | Status | File | Lines |
|---------|--------|------|-------|
| Pagination (5/page) | ✅ | jobs.tsx | ~60 |
| Category matching | ✅ | jobs.tsx | Dynamic |
| Build Profile action | ✅ | index.tsx | ~10 |
| Find Matches cleanup | ✅ | index.tsx | ~5 |
| Top Matches heading | ✅ | index.tsx | ~2 |
| Jobs Available count | ✅ | index.tsx | ~10 |
| Match Me Now button | ✅ | jobs.tsx | ~3 |
| Save Job toggle | ✅ | job-details.tsx | ~40 |

---

## State Management

### Pagination State
```typescript
// Location: app/(tabs)/jobs.tsx
const [currentPage, setCurrentPage] = useState(1);
const jobsPerPage = 5;

// Computed values
const totalPages = Math.ceil(allJobs.length / jobsPerPage);
const currentJobs = allJobs.slice(startIndex, endIndex);
```

### Save Job State
```typescript
// Location: app/job-details.tsx
const [isSaved, setIsSaved] = useState(false);
const { data: savedJobs } = useSavedJobs();
const saveJobMutation = useSaveJob();
const unsaveJobMutation = useUnsaveJob();
```

### Home Screen Stats
```typescript
// Location: app/(tabs)/index.tsx
const matchedCategories = matchData?.matches
  ?.map(m => m.job.category)
  .filter((v, i, a) => a.indexOf(v) === i) || [];
  
const stats = {
  jobsAvailable: matchedCategories.length > 0 
    ? (matchData?.total_jobs_scored || 0) : 0,
  savedJobs: savedJobsData?.length || 0,
  topMatches: matchData?.matches?.length || 0,
};
```

---

## API Endpoints

### Jobs Service
```
GET  /api/jobs/categories          - Get dynamic categories
GET  /api/jobs/corporate           - Get corporate jobs
GET  /api/jobs/personal            - Get personal jobs
GET  /api/jobs/all                 - Get all jobs
```

### Candidate Service
```
GET    /api/candidate/saved-jobs           - List saved jobs
POST   /api/candidate/saved-jobs/{id}      - Save a job
DELETE /api/candidate/saved-jobs/{id}      - Unsave a job
```

### Matching Service
```
GET  /api/match/ai/jobs            - Get AI matched jobs
GET  /api/match/ai/job/{id}        - Get match score for job
```

---

## React Query Keys

```typescript
['saved-jobs']              - User's saved jobs list
['allJobs', category]       - Jobs filtered by category
['topMatches']              - Top 5 AI matches
['jobCategories']           - Available categories
['candidate-profile']       - User profile data
```

---

## Event Handlers

### Pagination
```typescript
// Next page
onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}

// Previous page  
onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}

// Category change (resets to page 1)
React.useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory]);
```

### Save Job
```typescript
const handleSave = async () => {
  if (!jobId) return;
  try {
    if (isSaved) {
      await unsaveJobMutation.mutateAsync(parseInt(jobId));
      setIsSaved(false);
    } else {
      await saveJobMutation.mutateAsync(parseInt(jobId));
      setIsSaved(true);
    }
  } catch (error) {
    console.error('Failed to save/unsave job:', error);
  }
};
```

---

## UI Components

### Pagination Controls
```tsx
<View style={{ marginTop: 24, gap: 16 }}>
  <Text>Page {currentPage} of {totalPages}</Text>
  
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <TouchableOpacity disabled={currentPage === 1}>
      <Text>← Previous</Text>
    </TouchableOpacity>
    
    <TouchableOpacity disabled={currentPage === totalPages}>
      <Text>Next →</Text>
    </TouchableOpacity>
  </View>
</View>
```

### Save Button
```tsx
<TouchableOpacity onPress={handleSave}>
  <Heart
    size={22}
    color={isSaved ? '#EF4444' : colors.text}
    fill={isSaved ? '#EF4444' : 'none'}
  />
</TouchableOpacity>
```

### Match Me Now Button
```tsx
<TouchableOpacity 
  onPress={() => router.push('/job-matches')}
  style={{ backgroundColor: colors.accent }}
>
  <Sparkles size={20} color="white" />
  <Text>Match Me Now</Text>
</TouchableOpacity>
```

---

## Color Palette

```typescript
Primary (Gunmetal): #202c39
Secondary: #283845
Sage: #b8b08d
Peach Yellow: #f2d492
Atomic Tangerine (Accent): #f29559

Success (Saved): #EF4444 (Red)
Excellent Match: #10B981 (Green)
Good Match: #F59E0B (Amber)
Fair Match: #6B7280 (Gray)
```

---

## Debug Commands

### Check State
```javascript
// In React Native debugger
console.log('Current page:', currentPage);
console.log('Saved jobs:', savedJobs);
console.log('Matched categories:', matchedCategories);
```

### Check API
```bash
# Get categories
curl http://localhost:8000/api/jobs/categories

# Get saved jobs (with auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/candidate/saved-jobs

# Save a job
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/candidate/saved-jobs/1
```

### React Query DevTools
```typescript
// View cache
queryClient.getQueryData(['saved-jobs'])
queryClient.getQueryData(['allJobs', 'Technology'])

// Invalidate cache
queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
```

---

## Common Patterns

### Loading States
```typescript
{isLoading ? (
  <ActivityIndicator size="large" color={colors.accent} />
) : data ? (
  // Render data
) : (
  // Empty state
)}
```

### Empty States
```typescript
<View style={{ paddingVertical: 40, alignItems: 'center' }}>
  <Text style={{ fontSize: 48 }}>📭</Text>
  <Text>No jobs found</Text>
  <Text>Try adjusting your filters</Text>
</View>
```

### Error Handling
```typescript
try {
  await mutation.mutateAsync(data);
} catch (error) {
  console.error('Operation failed:', error);
  // Show toast or alert
}
```

---

## Performance Tips

1. **Use pagination** - Don't render all items at once
2. **Memoize computed values** - Use `useMemo` for expensive calculations  
3. **Debounce search** - Wait 300ms before API call
4. **Cache aggressively** - Set `staleTime: 5 * 60 * 1000` (5 minutes)
5. **Optimistic updates** - Update UI before API response

---

## Testing Commands

```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd frontend/jobmatch
npx expo start

# Clear cache
npx expo start -c

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b fix/pagination-and-save

# Commit changes
git add app/(tabs)/index.tsx app/(tabs)/jobs.tsx app/job-details.tsx
git commit -m "Fix: Implement pagination and save job functionality"

# Push changes
git push origin fix/pagination-and-save

# Create PR
# Title: "Fix pagination, categories, and save job functionality"
# Reference: Issues #1-5
```

---

## Documentation Links

- Full Implementation: `docs/FIXES_IMPLEMENTATION_SUMMARY.md`
- Testing Guide: `docs/TESTING_GUIDE.md`
- API Reference: Backend `/docs` endpoint
- React Query Docs: https://tanstack.com/query/latest

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
