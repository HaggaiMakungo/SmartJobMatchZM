# 🏢 Employer Job Management API - Complete Documentation

**Created:** November 14, 2025, 2:30 AM  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

## 📋 Overview

The Employer Job Management API provides complete CRUD operations for employers to manage their personal job postings (small jobs/gigs). All endpoints require authentication and automatically associate jobs with the logged-in employer.

---

## 🔐 Authentication

All employer endpoints require a valid JWT token:

```http
Authorization: Bearer <your_access_token>
```

**Get Token:**
```bash
POST /api/auth/login
{
  "email": "mark.ziligone@example.com",
  "password": "Mark123"
}
```

---

## 📍 Endpoints

### 1. **GET /api/employer/jobs** - Get All Employer Jobs

Get all jobs posted by the current employer with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by job status (Open, In Progress, Completed, Cancelled, Draft)
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "total": 5,
  "active_count": 2,
  "draft_count": 1,
  "completed_count": 1,
  "jobs": [
    {
      "id": "JOB-P12345678",
      "title": "Driver Needed",
      "category": "Driver",
      "description": "Looking for reliable driver for school runs",
      "province": "Lusaka",
      "location": "Kabulonga",
      "budget": 2500.0,
      "payment_type": "Fixed",
      "duration": "Ongoing",
      "posted_by": "1",
      "date_posted": "2024-11-14",
      "status": "Open"
    }
  ],
  "page": 1,
  "page_size": 50,
  "has_more": false
}
```

**Example:**
```bash
# Get all jobs
curl -X GET "http://localhost:8000/api/employer/jobs" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only open jobs
curl -X GET "http://localhost:8000/api/employer/jobs?status=Open" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Paginated results
curl -X GET "http://localhost:8000/api/employer/jobs?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. **GET /api/employer/jobs/{job_id}** - Get Specific Job

Get details of a specific job owned by the employer.

**Path Parameters:**
- `job_id`: The job ID (e.g., "JOB-P12345678")

**Response:**
```json
{
  "id": "JOB-P12345678",
  "title": "Driver Needed",
  "category": "Driver",
  "description": "Looking for reliable driver for school runs",
  "province": "Lusaka",
  "location": "Kabulonga",
  "budget": 2500.0,
  "payment_type": "Fixed",
  "duration": "Ongoing",
  "posted_by": "1",
  "date_posted": "2024-11-14",
  "status": "Open"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/employer/jobs/JOB-P12345678" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Job not found or you don't have permission

---

### 3. **POST /api/employer/jobs** - Create New Job

Create a new job posting. The job is automatically associated with the current employer.

**Request Body:**
```json
{
  "title": "Wedding Caterer Needed",
  "category": "Catering",
  "description": "Need experienced caterer for 150-person wedding on December 20th",
  "province": "Lusaka",
  "location": "Woodlands",
  "budget": 5000.0,
  "payment_type": "Fixed",
  "duration": "One-time",
  "status": "Open",
  "posted_by": "1"  // This will be overridden by the authenticated user
}
```

**Field Descriptions:**
- `title` (required): Job title (3-200 chars)
- `category` (required): Job category (Driver, Housekeeper, Chef, etc.)
- `description` (required): Detailed description (min 20 chars)
- `province` (required): Province (Lusaka, Copperbelt, etc.)
- `location` (required): Specific location/area
- `budget` (required): Payment amount in ZMW (>= 0)
- `payment_type` (required): "Fixed", "Hourly", "Daily", or "Milestone"
- `duration` (optional): Expected duration
- `status` (optional): "Open", "In Progress", "Completed", "Cancelled", "Draft" (default: "Open")
- `posted_by` (optional): Will be set to current user automatically

**Response:** (201 Created)
```json
{
  "id": "JOB-P87654321",
  "title": "Wedding Caterer Needed",
  "category": "Catering",
  "description": "Need experienced caterer for 150-person wedding...",
  "province": "Lusaka",
  "location": "Woodlands",
  "budget": 5000.0,
  "payment_type": "Fixed",
  "duration": "One-time",
  "posted_by": "1",
  "date_posted": "2024-11-14",
  "status": "Open"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/employer/jobs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wedding Caterer Needed",
    "category": "Catering",
    "description": "Need experienced caterer for 150-person wedding",
    "province": "Lusaka",
    "location": "Woodlands",
    "budget": 5000.0,
    "payment_type": "Fixed",
    "duration": "One-time",
    "status": "Open"
  }'
```

---

### 4. **PUT /api/employer/jobs/{job_id}** - Update Job

Update an existing job. Only fields provided will be updated.

**Path Parameters:**
- `job_id`: The job ID to update

**Request Body:** (all fields optional)
```json
{
  "title": "URGENT: Wedding Caterer Needed",
  "budget": 6000.0,
  "description": "Updated description with more details..."
}
```

**Response:**
```json
{
  "id": "JOB-P87654321",
  "title": "URGENT: Wedding Caterer Needed",
  "category": "Catering",
  "description": "Updated description with more details...",
  "province": "Lusaka",
  "location": "Woodlands",
  "budget": 6000.0,
  "payment_type": "Fixed",
  "duration": "One-time",
  "posted_by": "1",
  "date_posted": "2024-11-14",
  "status": "Open"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/employer/jobs/JOB-P87654321" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "URGENT: Wedding Caterer Needed",
    "budget": 6000.0
  }'
```

**Error Responses:**
- `404`: Job not found or you don't have permission

---

### 5. **DELETE /api/employer/jobs/{job_id}** - Delete Job

Delete a job posting. Only the job owner can delete.

**Path Parameters:**
- `job_id`: The job ID to delete

**Response:** (204 No Content)
No response body.

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/employer/jobs/JOB-P87654321" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Job not found or you don't have permission

---

### 6. **PATCH /api/employer/jobs/{job_id}/status** - Update Job Status

Update only the status of a job (lighter operation than full update).

**Path Parameters:**
- `job_id`: The job ID

**Query Parameters:**
- `status` (required): New status - "Open", "In Progress", "Completed", "Cancelled", or "Draft"

**Response:**
```json
{
  "success": true,
  "message": "Job status updated to In Progress",
  "job": {
    "id": "JOB-P87654321",
    "title": "Wedding Caterer Needed",
    "status": "In Progress",
    ...
  }
}
```

**Example:**
```bash
# Mark job as in progress
curl -X PATCH "http://localhost:8000/api/employer/jobs/JOB-P87654321/status?status=In%20Progress" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark job as completed
curl -X PATCH "http://localhost:8000/api/employer/jobs/JOB-P87654321/status?status=Completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. **GET /api/employer/stats** - Get Employer Statistics

Get overview statistics for the employer's jobs and activity.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_jobs": 5,
    "active_jobs": 2,
    "in_progress_jobs": 1,
    "completed_jobs": 1,
    "draft_jobs": 1,
    "total_applications": 0,
    "unread_messages": 0
  },
  "recent_jobs": [
    {
      "id": "JOB-P12345678",
      "title": "Driver Needed",
      "status": "Open",
      "date_posted": "2024-11-14"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/employer/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. **GET /api/employer/categories** - Get Categories

Get list of job categories used by the employer and all available categories.

**Response:**
```json
{
  "success": true,
  "employer_categories": [
    "Catering",
    "Driver",
    "Housekeeper"
  ],
  "all_categories": [
    "Accountant",
    "Caregiver",
    "Catering",
    "Driver",
    "Gardener",
    "Housekeeper",
    "Plumber",
    "Tutor"
  ],
  "total": 8
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/employer/categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Common Use Cases

### 1. Create and Publish a Job
```python
import requests

# Login
login_res = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "mark.ziligone@example.com",
    "password": "Mark123"
})
token = login_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create job
job_data = {
    "title": "Driver for School Runs",
    "category": "Driver",
    "description": "Need reliable driver for morning and afternoon school runs",
    "province": "Lusaka",
    "location": "Kabulonga",
    "budget": 2500.0,
    "payment_type": "Fixed",
    "duration": "Ongoing",
    "status": "Open"
}

response = requests.post("http://localhost:8000/api/employer/jobs", 
                        headers=headers, json=job_data)
job = response.json()
print(f"Job created: {job['id']}")
```

### 2. Update Job Budget
```python
job_id = "JOB-P12345678"
update_data = {"budget": 3000.0}

response = requests.put(f"http://localhost:8000/api/employer/jobs/{job_id}",
                       headers=headers, json=update_data)
updated_job = response.json()
print(f"Budget updated to: K{updated_job['budget']}")
```

### 3. Mark Job as Completed
```python
job_id = "JOB-P12345678"

response = requests.patch(
    f"http://localhost:8000/api/employer/jobs/{job_id}/status?status=Completed",
    headers=headers
)
result = response.json()
print(result["message"])
```

### 4. Get Dashboard Stats
```python
response = requests.get("http://localhost:8000/api/employer/stats", headers=headers)
stats = response.json()

print(f"Active Jobs: {stats['stats']['active_jobs']}")
print(f"Total Jobs: {stats['stats']['total_jobs']}")
print(f"Completed: {stats['stats']['completed_jobs']}")
```

---

## 🔒 Security & Permissions

### Authentication Required
All endpoints require a valid JWT token in the Authorization header.

### Owner Verification
- Users can only view/edit/delete jobs they created
- `posted_by` field is automatically set to the authenticated user
- Attempting to access another user's job returns 404

### Input Validation
- All fields are validated by Pydantic schemas
- Budget must be >= 0
- Status must be valid enum value
- Title length: 3-200 characters
- Description minimum: 20 characters

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```
**Fix:** Include valid Authorization header

### 403 Forbidden
```json
{
  "detail": "You don't have permission to update this job"
}
```
**Fix:** You're trying to access a job you don't own

### 404 Not Found
```json
{
  "detail": "Job with ID JOB-P12345678 not found or you don't have permission to access it"
}
```
**Fix:** Check job ID and ownership

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 3 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```
**Fix:** Check input validation requirements

---

## 🧪 Testing

### Test Script
Run the comprehensive test script:

```bash
cd backend
python test_employer_endpoints.py
```

This will:
1. ✅ Login as employer
2. ✅ Get stats
3. ✅ Create test job
4. ✅ Retrieve all jobs
5. ✅ Get specific job
6. ✅ Update job
7. ✅ Update status
8. ✅ Filter by status
9. ✅ Delete job
10. ✅ Verify deletion

### Manual Testing with cURL

```bash
# Set token variable
TOKEN="your_jwt_token_here"

# Get all jobs
curl -X GET "http://localhost:8000/api/employer/jobs" \
  -H "Authorization: Bearer $TOKEN"

# Create job
curl -X POST "http://localhost:8000/api/employer/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","category":"Driver","description":"Test description for driver position","province":"Lusaka","location":"CBD","budget":2000,"payment_type":"Fixed","duration":"1 week","status":"Open"}'

# Get stats
curl -X GET "http://localhost:8000/api/employer/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database Schema

### SmallJob Table
```sql
CREATE TABLE small_jobs (
    id VARCHAR PRIMARY KEY,           -- "JOB-P12345678"
    title VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    description TEXT,
    province VARCHAR,
    location VARCHAR,
    budget FLOAT,
    payment_type VARCHAR,             -- Fixed, Hourly, Daily
    duration VARCHAR,
    posted_by VARCHAR,                -- User ID (as string)
    date_posted DATE,
    status VARCHAR                    -- Open, In Progress, Completed, etc.
);
```

**Indexes:**
- Primary key on `id`
- Index on `posted_by` (for employer queries)
- Index on `status` (for filtering)
- Index on `category` (for filtering)
- Index on `date_posted` (for sorting)

---

## 🚀 Next Steps

### Immediate Enhancements
1. **Applications Management** (2-3 hours)
   - View applicants for each job
   - Accept/reject applications
   - Contact applicants

2. **Notifications** (2 hours)
   - New application alerts
   - Job expiring warnings
   - Status change notifications

3. **Messaging** (3 hours)
   - Chat with applicants
   - Real-time messaging
   - Message notifications

### Future Features
- Job templates for common positions
- Bulk job operations
- Job performance analytics
- Applicant scoring/ranking
- Payment integration
- Contract management

---

## 📝 Notes

- **Job IDs**: Auto-generated with format "JOB-P{UUID8}"
- **Date Format**: ISO 8601 (YYYY-MM-DD)
- **Currency**: All amounts in Zambian Kwacha (ZMW)
- **Pagination**: Default 50 items, max 100 per page
- **Sorting**: Jobs sorted by date_posted (newest first)

---

## ✅ Integration Checklist

- [x] Employer endpoints created
- [x] Authentication implemented
- [x] Owner verification working
- [x] CRUD operations complete
- [x] Status management added
- [x] Stats endpoint functional
- [x] Error handling robust
- [x] Test script created
- [x] Documentation complete
- [ ] Frontend integration pending

---

**Created by:** Claude  
**Date:** November 14, 2025, 2:30 AM  
**API Version:** v1  
**Made in Zambia 🇿🇲**
