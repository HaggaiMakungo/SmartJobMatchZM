# Jobs Page Layout Updates

## Changes Required:

### 1. Job Selection Row - Make it Split Layout
**Location:** Line ~257 (Job Selection section)

**Change from:**
```tsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Select Job
  </label>
  <select className="w-full px-4 py-3 ...">
    {jobs.map(...)}
  </select>
</div>
```

**Change to:**
```tsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
  <div className="flex items-center justify-between gap-6">
    {/* Left: Job Dropdown (50% width) */}
    <div className="flex-1 max-w-2xl">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Job
      </label>
      <select 
        value={selectedJob?.id || ''}
        onChange={(e) => handleJobChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent outline-none transition"
      >
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title} - {job.location}
          </option>
        ))}
      </select>
    </div>

    {/* Right: Average Match Score */}
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-tangerine/10 flex items-center justify-center">
          <span className="text-2xl">⭐</span>
        </div>
        <div>
          <p className="text-sm text-gray-400">Average Match</p>
          <p className="text-2xl font-bold text-tangerine">{averageMatchScore}%</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. Add Average Match Score Calculation
**Location:** Right after the filtering/sorting logic (around line ~227)

**Add this code:**
```tsx
// Calculate average match score
const averageMatchScore = filteredAndSortedCandidates.length > 0
  ? Math.round(filteredAndSortedCandidates.reduce((sum, c) => sum + c.match_score, 0) / filteredAndSortedCandidates.length)
  : 0;
```

### 3. Remove Collapsible Job Details
**Location:** Line ~280 (Selected Job Details section)

**Change from:**
```tsx
{isJobExpanded && (selectedJob.description || selectedJob.requirements) && (
  <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
    {/* description and requirements */}
  </div>
)}
```

AND remove the expand/collapse button:
```tsx
<button onClick={() => setIsJobExpanded(!isJobExpanded)} ...>
  {isJobExpanded ? <ChevronUp /> : <ChevronDown />}
</button>
```

**Change to:**
```tsx
{/* Always show description and requirements - no collapsible */}
{(selectedJob.description || selectedJob.requirements) && (
  <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
    {selectedJob.description && (
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
      </div>
    )}
    
    {selectedJob.requirements && (
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Requirements</h3>
        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.requirements}</p>
      </div>
    )}
  </div>
)}
```

### 4. Clean up State (Remove isJobExpanded)
**Location:** Line ~42

**Remove:**
```tsx
const [isJobExpanded, setIsJobExpanded] = useState(jobsPage.isJobExpanded);
```

**And remove from cache (line ~90):**
```tsx
// Remove isJobExpanded from setJobsPageCache call
```

---

## Summary of Changes:

1. ✅ **Job Dropdown**: Moved to left side, max-width 2xl (narrower)
2. ✅ **Average Match Score**: Added on right side with icon and large percentage
3. ✅ **Job Details**: Always expanded, no collapse button
4. ✅ **Cleaner Layout**: Side-by-side job selector and stats

---

## Quick Implementation:

Run these steps:
1. Add average match score calculation after filtering logic
2. Update job selection section to split layout
3. Remove collapsible logic from job details section
4. Remove isJobExpanded state and related code
5. Test in browser!
