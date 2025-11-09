# 🎯 Next Steps - Implementing Backend Integration

## 🚀 Step-by-Step Implementation Guide

Now that all the services are ready, here's how to integrate them into your existing screens:

---

## 1️⃣ Update Job Seeker Home Screen

**File:** `app/(tabs)/index.tsx`

### Replace Mock Data with Real API

```typescript
import { useAIMatchedJobs } from '@/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';

export default function JobSeekerHomeScreen() {
  const { user } = useAuthStore();
  const { data: matchesData, isLoading, error } = useAIMatchedJobs(5);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f29559" />
        <Text style={{ marginTop: 16, color: '#b8b08d' }}>
          Finding your perfect matches...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16 }}>
          Failed to load matches
        </Text>
        <Button onPress={() => refetch()}>Try Again</Button>
      </View>
    );
  }

  const topMatches = matchesData?.matches || [];

  return (
    <ScrollView>
      {/* Welcome Section */}
      <Text>Welcome back, {user?.full_name}!</Text>
      
      {/* Top Matches Section */}
      <Text>Your Top Matches</Text>
      {topMatches.map((match) => (
        <JobMatchCard
          key={match.job.id}
          job={match.job}
          matchScore={match.match_score}
          explanation={match.explanation}
          collarType={match.collar_type}
        />
      ))}
    </ScrollView>
  );
}
```

---

## 2️⃣ Update Jobs Screen

**File:** `app/(tabs)/jobs.tsx`

### Add Real Job Filtering

```typescript
import { useJobs } from '@/hooks/useJobs';
import { useState } from 'react';

export default function JobsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const { data: jobs, isLoading } = useJobs({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    limit: 50,
  });

  const categories = [
    { id: 'All', name: 'All', icon: Briefcase },
    { id: 'Technology', name: 'Technology', icon: Cpu },
    { id: 'Healthcare', name: 'Healthcare', icon: Heart },
    // ... other categories
  ];

  return (
    <View>
      {/* Category Filters */}
      <ScrollView horizontal>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={{
              backgroundColor: selectedCategory === cat.id 
                ? colors.actionBox 
                : colors.card
            }}
          >
            <Text>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => <JobCard job={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}
```

---

## 3️⃣ Update Job Details Screen

**File:** `app/job-details.tsx`

### Add Apply Functionality

```typescript
import { useJobWithMatch } from '@/hooks/useJobs';
import { useApplyToJob, useIsJobSaved, useSaveJob, useUnsaveJob } from '@/hooks/useCandidate';
import { useLocalSearchParams } from 'expo-router';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id);

  const { data: job, isLoading } = useJobWithMatch(jobId);
  const { data: isSaved } = useIsJobSaved(jobId);
  
  const applyMutation = useApplyToJob();
  const saveMutation = useSaveJob();
  const unsaveMutation = useUnsaveJob();

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({
        jobId,
        coverLetter: 'I am very interested in this position...',
      });
      Alert.alert('Success', 'Application submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveMutation.mutateAsync(jobId);
      } else {
        await saveMutation.mutateAsync(jobId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save job');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ScrollView>
      {/* Header with Save Button */}
      <TouchableOpacity onPress={handleToggleSave}>
        <Heart
          size={24}
          color={isSaved ? '#EF4444' : colors.textMuted}
          fill={isSaved ? '#EF4444' : 'none'}
        />
      </TouchableOpacity>

      {/* Match Score */}
      {job?.match_score && (
        <View>
          <Text>{Math.round(job.match_score)}% Match</Text>
          <Text>{job.match_explanation}</Text>
        </View>
      )}

      {/* Job Details */}
      <Text>{job?.title}</Text>
      <Text>{job?.company}</Text>
      <Text>{job?.description}</Text>

      {/* Apply Button */}
      <Button
        onPress={handleApply}
        disabled={applyMutation.isPending}
      >
        {applyMutation.isPending ? 'Submitting...' : 'Apply Now'}
      </Button>
    </ScrollView>
  );
}
```

---

## 4️⃣ Update Personal Employer Home

**File:** `app/(employer)/index.tsx`

### Add Real Dashboard Data

```typescript
import { useEmployerDashboard } from '@/hooks/useEmployer';
import { useMyJobs } from '@/hooks/useJobs';

export default function EmployerHomeScreen() {
  const { data: dashboard, isLoading: dashboardLoading } = useEmployerDashboard();
  const { data: recentJobs, isLoading: jobsLoading } = useMyJobs({ limit: 3 });

  if (dashboardLoading || jobsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView>
      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          icon="📝"
          value={dashboard?.active_jobs || 0}
          label="Active Jobs"
        />
        <StatCard
          icon="👥"
          value={dashboard?.total_applications || 0}
          label="Applicants"
        />
        <StatCard
          icon="👁️"
          value={dashboard?.total_views || 0}
          label="Views"
        />
      </View>

      {/* Recent Jobs */}
      <Text>Your Jobs</Text>
      {recentJobs?.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onPress={() => router.push(`/employer/job/${job.id}`)}
        />
      ))}
    </ScrollView>
  );
}
```

---

## 5️⃣ Update Employer Jobs Screen

**File:** `app/(employer)/jobs.tsx`

### Add Real Job Management

```typescript
import { useMyJobs, useDeleteJob } from '@/hooks/useJobs';

export default function EmployerJobsScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  
  const { data: jobs, isLoading } = useMyJobs({
    active_only: filter === 'active',
    limit: 100,
  });
  
  const deleteJob = useDeleteJob();

  const handleDelete = async (jobId: number) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJob.mutateAsync(jobId);
              Alert.alert('Success', 'Job deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const filteredJobs = jobs?.filter((job) => {
    if (filter === 'active') return job.is_active;
    if (filter === 'closed') return !job.is_active;
    return true;
  });

  return (
    <View>
      {/* Filter Buttons */}
      <FilterButtons selected={filter} onChange={setFilter} />

      {/* Jobs List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onEdit={() => router.push(`/employer/edit-job/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}
```

---

## 6️⃣ Update Post Job Form

**File:** `app/(employer)/post-job.tsx`

### Connect to Backend

```typescript
import { useCreateJob } from '@/hooks/useJobs';
import { useForm } from 'react-hook-form';

export default function PostJobScreen() {
  const createJob = useCreateJob();
  const { control, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createJob.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        job_type: data.job_type,
        salary_min: parseFloat(data.salary_min),
        salary_max: parseFloat(data.salary_max),
        salary_currency: 'ZMW',
        requirements: data.requirements,
        is_active: true,
      });
      
      Alert.alert('Success', 'Job posted successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to post job');
    }
  };

  return (
    <ScrollView>
      <Form control={control} onSubmit={handleSubmit(onSubmit)}>
        <Input name="title" label="Job Title" />
        <Input name="description" label="Description" multiline />
        <Select name="category" label="Category" options={categories} />
        {/* ... other fields */}
        
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={createJob.isPending}
        >
          {createJob.isPending ? 'Posting...' : 'Post Job'}
        </Button>
      </Form>
    </ScrollView>
  );
}
```

---

## 7️⃣ Update Alerts Screen

**File:** `app/(tabs)/alerts.tsx` (Job Seeker)

### Show Real Applications

```typescript
import { useMyApplications } from '@/hooks/useCandidate';

export default function AlertsScreen() {
  const { data: applications, isLoading } = useMyApplications();

  const notifications = applications?.map((app) => ({
    id: app.id,
    type: 'application',
    title: `Application ${app.status}`,
    message: `Your application to ${app.job?.title} at ${app.job?.company}`,
    time: formatRelativeTime(new Date(app.applied_at)),
    status: app.status,
  })) || [];

  return (
    <ScrollView>
      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState message="No notifications yet" />
      ) : (
        notifications.map((notif) => (
          <NotificationCard key={notif.id} notification={notif} />
        ))
      )}
    </ScrollView>
  );
}
```

---

## 🔧 Common Utilities

### Create Loading Component

**File:** `src/components/ui/LoadingSpinner.tsx`

```typescript
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ marginTop: 16, color: colors.textMuted }}>
        {message}
      </Text>
    </View>
  );
};
```

### Create Error Component

**File:** `src/components/ui/ErrorState.tsx`

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <AlertCircle size={48} color="#EF4444" />
      <Text style={{ marginTop: 16, color: '#EF4444', textAlign: 'center' }}>
        {message || 'Something went wrong'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: 16,
            backgroundColor: '#f29559',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

---

## ⚡ Testing Checklist

### Job Seeker Flow
- [ ] Login as Brian Mwale
- [ ] See real AI-matched jobs on home
- [ ] Browse jobs by category
- [ ] View job details with match score
- [ ] Apply to a job
- [ ] Save a job
- [ ] View applications in Alerts
- [ ] Check saved jobs

### Personal Employer Flow
- [ ] Login as Mark Ziligone
- [ ] See dashboard with real stats
- [ ] View list of posted jobs
- [ ] Post a new job
- [ ] Edit a job
- [ ] Delete a job
- [ ] View candidate matches

---

## 🐛 Common Issues & Fixes

### Issue: "Network Request Failed"
**Fix:** Check if backend is running and IP is correct

### Issue: "401 Unauthorized"
**Fix:** Token expired, logout and login again

### Issue: Data not refreshing
**Fix:** Use `refetch()` or pull-to-refresh

```typescript
const { data, refetch } = useJobs();

<ScrollView
  refreshControl={
    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
  }
>
```

---

## 📝 Summary

✅ 7 screens updated with real API calls  
✅ Loading and error states added  
✅ Apply, save, create job functionality  
✅ Dashboard with real statistics  
✅ Complete job management for employers  

Your app is now fully integrated with the backend! 🎉

---

**Next:** Test thoroughly and fix any issues that come up!
