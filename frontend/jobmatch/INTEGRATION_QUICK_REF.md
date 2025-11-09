# 🚀 Backend Integration - Quick Reference

## 📞 API Base URL
\`\`\`typescript
// src/services/api.ts
const API_BASE_URL = 'http://YOUR_IP:8000/api';
\`\`\`

---

## 🔐 Authentication

\`\`\`typescript
import { authService } from '@/services/auth.service';

// Login
await authService.login({ email, password });

// Register Job Seeker
await authService.register({ full_name, email, password, phone });

// Register Personal Employer
await authService.registerPersonalEmployer({ full_name, email, password, phone });

// Get Current User
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
\`\`\`

---

## 💼 Jobs (Job Seeker)

\`\`\`typescript
import { jobsService } from '@/services/jobs.service';
import { useJobs, useAIMatchedJobs } from '@/hooks/useJobs';

// Get all jobs
const jobs = await jobsService.getJobs();

// Filter by category
const jobs = await jobsService.getJobs({ category: 'Technology' });

// Get AI matches (CAMSS) ⭐
const matches = await jobsService.getAIMatchedJobs(10);

// With React Query hook
const { data, isLoading } = useAIMatchedJobs(10);
\`\`\`

---

## 🏢 Employer Operations

\`\`\`typescript
import { employerService } from '@/services/employer.service';
import { useEmployerDashboard } from '@/hooks/useEmployer';

// Get dashboard stats
const stats = await employerService.getDashboard();
// Returns: { total_jobs, active_jobs, total_applications, etc. }

// Create profile
await employerService.createProfile({
  company_name: 'Mark Ziligone',
  location: 'Lusaka',
  phone: '+260 977 555 444',
});

// With React Query
const { data: stats } = useEmployerDashboard();
\`\`\`

---

## 📝 Job Management (Employer)

\`\`\`typescript
import { jobsService } from '@/services/jobs.service';
import { useCreateJob, useMyJobs } from '@/hooks/useJobs';

// Create job
await jobsService.createJob({
  title: 'Driver Needed',
  description: '...',
  category: 'Transportation',
  location: 'Lusaka',
});

// Get my jobs
const myJobs = await jobsService.getMyJobs({ active_only: true });

// Update job
await jobsService.updateJob(jobId, { title: 'New Title' });

// Delete job
await jobsService.deleteJob(jobId);

// With React Query mutation
const createJob = useCreateJob();
await createJob.mutateAsync(jobData);
\`\`\`

---

## 👤 Candidate Operations

\`\`\`typescript
import { candidateService } from '@/services/candidate.service';
import { useApplyToJob, useSavedJobs } from '@/hooks/useCandidate';

// Apply to job
await candidateService.applyToJob(jobId, 'Cover letter...');

// Save job
await candidateService.saveJob(jobId);

// Get applications
const apps = await candidateService.getMyApplications();

// Get saved jobs
const saved = await candidateService.getSavedJobs();

// With React Query
const applyMutation = useApplyToJob();
await applyMutation.mutateAsync({ jobId, coverLetter });
\`\`\`

---

## 📊 React Query Patterns

### Basic Query
\`\`\`typescript
import { useJobs } from '@/hooks/useJobs';

const MyComponent = () => {
  const { data, isLoading, error } = useJobs();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <JobsList jobs={data} />;
};
\`\`\`

### Mutation with Success Handler
\`\`\`typescript
import { useCreateJob } from '@/hooks/useJobs';

const PostJobScreen = () => {
  const createJob = useCreateJob();
  
  const handleSubmit = async (jobData) => {
    try {
      await createJob.mutateAsync(jobData);
      Alert.alert('Success', 'Job posted!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to post job');
    }
  };
  
  return <JobForm onSubmit={handleSubmit} />;
};
\`\`\`

### Refetch on Focus
\`\`\`typescript
import { useFocusEffect } from '@react-navigation/native';

const MyScreen = () => {
  const { data, refetch } = useMyJobs();
  
  useFocusEffect(
    useCallback(() => {
      refetch(); // Refetch when screen comes into focus
    }, [refetch])
  );
};
\`\`\`

---

## 🔧 Error Handling

\`\`\`typescript
// Service method with try-catch
const fetchJobs = async () => {
  try {
    const jobs = await jobsService.getJobs();
    setJobs(jobs);
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      router.replace('/login');
    } else if (error.response?.status === 404) {
      Alert.alert('Not Found', 'Jobs not found');
    } else {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  }
};

// React Query automatic error handling
const { data, error } = useJobs();

if (error) {
  console.error('Error:', error.response?.data?.detail);
}
\`\`\`

---

## 🎯 Common Patterns

### Check if User is Logged In
\`\`\`typescript
import { authService } from '@/services/auth.service';

const isLoggedIn = await authService.isAuthenticated();
if (!isLoggedIn) {
  router.replace('/login');
}
\`\`\`

### Get Stored User Data (Quick)
\`\`\`typescript
const user = await authService.getStoredUser();
console.log(user.role); // 'candidate' | 'employer_personal' | etc.
\`\`\`

### Conditional Rendering by Role
\`\`\`typescript
const { user } = useAuthStore();

return (
  <>
    {user.role === 'candidate' && <JobSeekerHome />}
    {user.role === 'employer_personal' && <EmployerHome />}
  </>
);
\`\`\`

---

## 📱 File Uploads

\`\`\`typescript
import * as DocumentPicker from 'expo-document-picker';
import { employerService } from '@/services/employer.service';

// Pick and upload file
const pickAndUpload = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'image/*',
  });
  
  if (result.type === 'success') {
    await employerService.uploadDocument('nrc_photo', {
      uri: result.uri,
      name: result.name,
      type: result.mimeType,
    });
  }
};
\`\`\`

---

## 🐛 Debugging

### Enable API Logging
API calls are automatically logged. Check Metro bundler console for:
- 🔵 Request logs
- ✅ Success responses
- ❌ Error details

### Network Diagnostic
\`\`\`bash
# Test backend connection
curl http://YOUR_IP:8000/health

# Should return: {"status":"ok"}
\`\`\`

### Check Auth Token
\`\`\`typescript
import * as SecureStore from 'expo-secure-store';

const token = await SecureStore.getItemAsync('auth_token');
console.log('Token:', token);
\`\`\`

---

## ⚡ Performance Tips

1. **Use React Query hooks** - Automatic caching and refetching
2. **Enable staleTime** for static data
\`\`\`typescript
useQuery({
  queryKey: ['jobs'],
  queryFn: () => jobsService.getJobs(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
\`\`\`
3. **Prefetch data** before navigation
\`\`\`typescript
const queryClient = useQueryClient();
await queryClient.prefetchQuery({
  queryKey: ['job', jobId],
  queryFn: () => jobsService.getJob(jobId),
});
\`\`\`

---

## 🎨 UI Patterns

### Loading State
\`\`\`typescript
{isLoading ? (
  <View style={{ flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator size="large" color={colors.accent} />
  </View>
) : (
  <DataView data={data} />
)}
\`\`\`

### Empty State
\`\`\`typescript
{data?.length === 0 && (
  <View style={{ padding: 40, alignItems: 'center' }}>
    <Text style={{ color: colors.textMuted }}>No jobs found</Text>
  </View>
)}
\`\`\`

### Error State
\`\`\`typescript
{error && (
  <View style={{ padding: 20 }}>
    <Text style={{ color: colors.error }}>
      Failed to load data. Please try again.
    </Text>
    <Button onPress={() => refetch()}>Retry</Button>
  </View>
)}
\`\`\`

---

## 📞 Quick Contacts

| Issue | Check |
|-------|-------|
| **Can't connect** | Backend running? Same Wi-Fi? Correct IP? |
| **401 Unauthorized** | Token expired? Re-login needed |
| **404 Not Found** | Endpoint correct? User exists? |
| **500 Server Error** | Check backend logs |
| **Network Error** | Firewall blocking? CORS issue? |

---

**💡 Pro Tip:** Keep `BACKEND_INTEGRATION_COMPLETE.md` open for detailed documentation!

**Last Updated:** November 8, 2025
