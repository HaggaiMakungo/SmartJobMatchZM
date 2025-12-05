# 👥 Employer Applicant Management API - Documentation

**Created:** November 14, 2025, 3:00 AM  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

## 📋 Overview

The Applicant Management API enables employers to view, review, accept, and reject job applicants. All endpoints require authentication and verify job ownership before allowing access to applicant information.

---

## 🔐 Authentication

All endpoints require a valid JWT token:

```http
Authorization: Bearer <your_access_token>
```

---

## 📍 Endpoints

### 1. **GET /api/employer/jobs/{job_id}/applicants** - Get Job Applicants

Get all applicants who have applied to a specific job.

**Path Parameters:**
- `job_id` (required): The job ID

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, rejected)
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "job_id": "JOB-P12345678",
  "job_title": "Driver Needed",
  "total_applicants": 5,
  "applicants": [
    {
      "application_id": "app_abc123def456",
      "applied_at": "2024-11-14T10:30:00",
      "status": "pending",
      "match_score": 85,
      "applicant": {
        "id": "1",
        "name": "Brian Mwale",
        "email": "brian.mwale@example.com",
        "phone": "0977 123 456",
        "location": "Lusaka, Lusaka",
        "education": "Bachelor's",
        "experience_years": 5,
        "current_title": "Software Developer",
        "skills": ["Python", "JavaScript", "React"],
        "cv_id": "cv_001",
        "resume_quality_score": 85
      },
      "cover_letter": null
    }
  ],
  "page": 1,
  "page_size": 50,
  "has_more": false
}
```

**Example:**
```bash
# Get all applicants for a job
curl -X GET "http://localhost:8000/api/employer/jobs/JOB-P12345678/applicants" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get pending applicants only
curl -X GET "http://localhost:8000/api/employer/jobs/JOB-P12345678/applicants?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Job not found or you don't have permission

---

### 2. **GET /api/employer/applicants/{application_id}** - Get Applicant Details

Get detailed information about a specific applicant including full CV/profile.

**Path Parameters:**
- `application_id` (required): The application ID (from applicants list)

**Response:**
```json
{
  "application_id": "app_abc123def456",
  "job_id": "JOB-P12345678",
  "job_title": "Driver Needed",
  "applied_at": "2024-11-14T10:30:00",
  "status": "pending",
  "match_score": 85,
  "sub_scores": {
    "education": 0.9,
    "experience": 0.85,
    "skills": 0.8
  },
  "applicant": {
    "id": "1",
    "cv_id": "cv_001",
    "full_name": "Brian Mwale",
    "email": "brian.mwale@example.com",
    "phone": "0977 123 456",
    "location": {
      "city": "Lusaka",
      "province": "Lusaka",
      "full": "Lusaka, Lusaka"
    },
    "education": {
      "level": "Bachelor's",
      "institution": "University of Zambia",
      "graduation_year": 2018,
      "field_of_study": "Computer Science"
    },
    "experience": {
      "current_title": "Software Developer",
      "total_years": 5,
      "work_history": [
        {
          "title": "Senior Developer",
          "company": "TechZambia",
          "duration": "2 years"
        }
      ]
    },
    "skills": {
      "technical": ["Python", "JavaScript", "React", "SQL"],
      "soft": ["Communication", "Teamwork", "Problem Solving"],
      "languages": ["English", "Bemba"]
    },
    "certifications": ["AWS Certified", "PMP"],
    "resume_quality_score": 85,
    "availability": "Immediate",
    "salary_expectation": {
      "min": 15000,
      "max": 25000
    }
  },
  "cover_letter": null
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/employer/applicants/app_abc123def456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Application or applicant CV not found
- `403`: You don't have permission to view this applicant

---

### 3. **POST /api/employer/applicants/{application_id}/accept** - Accept Applicant

Accept an applicant for the job.

**Path Parameters:**
- `application_id` (required): The application ID

**Query Parameters:**
- `notes` (optional): Optional notes about the acceptance

**Response:**
```json
{
  "success": true,
  "message": "Applicant accepted successfully",
  "application_id": "app_abc123def456",
  "status": "accepted",
  "applicant_name": "Brian Mwale",
  "applicant_email": "brian.mwale@example.com",
  "accepted_at": "2024-11-14T11:00:00"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/employer/applicants/app_abc123def456/accept?notes=Great%20candidate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Application not found
- `403`: You don't have permission to accept this applicant

---

### 4. **POST /api/employer/applicants/{application_id}/reject** - Reject Applicant

Reject an applicant's application.

**Path Parameters:**
- `application_id` (required): The application ID

**Query Parameters:**
- `reason` (optional): Optional rejection reason

**Response:**
```json
{
  "success": true,
  "message": "Applicant rejected",
  "application_id": "app_abc123def456",
  "status": "rejected",
  "applicant_name": "Brian Mwale",
  "rejected_at": "2024-11-14T11:00:00"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/employer/applicants/app_abc123def456/reject?reason=Position%20filled" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `404`: Application not found
- `403`: You don't have permission to reject this applicant

---

### 5. **GET /api/employer/applicants/summary** - Get Applicants Summary

Get overview statistics of all applicants across all employer's jobs.

**Response:**
```json
{
  "success": true,
  "total_applicants": 12,
  "pending": 5,
  "accepted": 4,
  "rejected": 3,
  "recent_applications": [
    {
      "application_id": "app_abc123",
      "applicant_name": "Brian Mwale",
      "job_title": "Driver Needed",
      "job_id": "JOB-P12345678",
      "status": "applied",
      "applied_at": "2024-11-14T10:30:00",
      "match_score": 85
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/employer/applicants/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Common Use Cases

### 1. View All Applicants for a Job
```python
import requests

token = "YOUR_JWT_TOKEN"
headers = {"Authorization": f"Bearer {token}"}
job_id = "JOB-P12345678"

# Get applicants
response = requests.get(
    f"http://localhost:8000/api/employer/jobs/{job_id}/applicants",
    headers=headers
)

applicants = response.json()
print(f"Total applicants: {applicants['total_applicants']}")

for applicant in applicants['applicants']:
    print(f"- {applicant['applicant']['name']}")
    print(f"  Match: {applicant['match_score']}%")
    print(f"  Skills: {', '.join(applicant['applicant']['skills'][:3])}")
```

### 2. Review Applicant Details
```python
application_id = "app_abc123def456"

# Get full details
response = requests.get(
    f"http://localhost:8000/api/employer/applicants/{application_id}",
    headers=headers
)

details = response.json()
applicant = details['applicant']

print(f"Name: {applicant['full_name']}")
print(f"Education: {applicant['education']['level']} from {applicant['education']['institution']}")
print(f"Experience: {applicant['experience']['total_years']} years")
print(f"Current Role: {applicant['experience']['current_title']}")
print(f"Skills: {', '.join(applicant['skills']['technical'])}")
print(f"Match Score: {details['match_score']}%")
```

### 3. Accept Top Applicant
```python
# Find best match
response = requests.get(
    f"http://localhost:8000/api/employer/jobs/{job_id}/applicants",
    headers=headers
)

applicants = response.json()['applicants']
best_match = max(applicants, key=lambda x: x['match_score'])

# Accept them
accept_response = requests.post(
    f"http://localhost:8000/api/employer/applicants/{best_match['application_id']}/accept",
    headers=headers,
    params={"notes": "Best match for the position"}
)

print(accept_response.json()['message'])
```

### 4. Batch Review Applications
```python
# Get all pending applications
response = requests.get(
    f"http://localhost:8000/api/employer/jobs/{job_id}/applicants?status=pending",
    headers=headers
)

applicants = response.json()['applicants']

for applicant in applicants:
    match_score = applicant['match_score']
    app_id = applicant['application_id']
    
    if match_score >= 80:
        # Auto-accept high matches
        requests.post(
            f"http://localhost:8000/api/employer/applicants/{app_id}/accept",
            headers=headers
        )
        print(f"✅ Accepted: {applicant['applicant']['name']}")
    elif match_score < 50:
        # Auto-reject low matches
        requests.post(
            f"http://localhost:8000/api/employer/applicants/{app_id}/reject",
            headers=headers,
            params={"reason": "Match score too low"}
        )
        print(f"❌ Rejected: {applicant['applicant']['name']}")
    else:
        # Manual review needed
        print(f"⏸️  Review: {applicant['applicant']['name']}")
```

---

## 🔒 Security & Permissions

### Job Ownership Verification
All endpoints verify that the current user owns the job before allowing access to applicants:
- Only job creators can view applicants
- Accept/reject actions restricted to job owner
- 403 Forbidden returned for unauthorized access

### Data Privacy
- Applicant contact info only visible to job owners
- Full CV details require explicit endpoint access
- Applications tracked with unique IDs

---

## ⚠️ Error Responses

### 403 Forbidden
```json
{
  "detail": "You don't have permission to view this applicant"
}
```
**Cause:** Trying to access applicants for a job you don't own

### 404 Not Found
```json
{
  "detail": "Application not found"
}
```
**Cause:** Invalid application ID or application doesn't exist

### 404 Not Found (Job)
```json
{
  "detail": "Job with ID JOB-P12345678 not found or you don't have permission to view applicants"
}
```
**Cause:** Job doesn't exist or you don't own it

### 404 Not Found (CV)
```json
{
  "detail": "Applicant CV not found"
}
```
**Cause:** Applicant hasn't created a CV yet

---

## 📊 Data Models

### Applicant Summary
```typescript
{
  application_id: string;      // "app_abc123def456"
  applied_at: string;          // ISO 8601 timestamp
  status: string;              // "pending" | "accepted" | "rejected"
  match_score: number;         // 0-100
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    education: string;
    experience_years: number;
    current_title: string;
    skills: string[];
    cv_id: string;
    resume_quality_score: number;
  };
  cover_letter: string | null;
}
```

### Applicant Details
```typescript
{
  application_id: string;
  job_id: string;
  job_title: string;
  applied_at: string;
  status: string;
  match_score: number;
  sub_scores: Record<string, number>;
  applicant: {
    id: string;
    cv_id: string;
    full_name: string;
    email: string;
    phone: string;
    location: {
      city: string;
      province: string;
      full: string;
    };
    education: {
      level: string;
      institution: string;
      graduation_year: number;
      field_of_study: string;
    };
    experience: {
      current_title: string;
      total_years: number;
      work_history: Array<{
        title: string;
        company: string;
        duration: string;
      }>;
    };
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
    };
    certifications: string[];
    resume_quality_score: number;
    availability: string;
    salary_expectation: {
      min: number;
      max: number;
    };
  };
  cover_letter: string | null;
}
```

---

## 🧪 Testing

### Run Test Script
```bash
cd backend
python test_applicant_management.py
```

**Test Coverage:**
1. ✅ Create test job as employer
2. ✅ Apply to job as job seeker
3. ✅ View applicants list
4. ✅ View applicant details
5. ✅ Get applicants summary
6. ✅ Accept applicant
7. ✅ Verify status change
8. ✅ Cleanup test data

---

## 🚀 Next Steps

### Immediate Enhancements
1. **Application Status Model** (1 hour)
   - Create separate table for application statuses
   - Track status history
   - Add interview scheduling status

2. **Notifications** (2 hours)
   - Notify applicants when accepted/rejected
   - Email notifications
   - In-app notifications

3. **Messaging** (3 hours)
   - Direct message applicants
   - Interview scheduling
   - Questions/answers

### Future Features
- Applicant notes/comments
- Interview scheduling
- Application ratings
- Bulk actions (accept/reject multiple)
- Application templates
- Automated responses
- Applicant tracking system (ATS)

---

## 📝 Notes

- **Application Status:** Currently stored in `action` field of `UserJobInteraction`
- **Notes Storage:** Temporarily stored in `sub_scores` JSONB field
- **Match Scores:** Calculated by AI matching algorithm
- **CV Requirement:** Applicants must have CV created to apply

---

## ✅ Integration Checklist

- [x] Applicant listing endpoint
- [x] Applicant details endpoint
- [x] Accept endpoint
- [x] Reject endpoint
- [x] Summary endpoint
- [x] Job ownership verification
- [x] CV data integration
- [x] Test script created
- [x] Documentation complete
- [ ] Frontend integration pending
- [ ] Notification system pending

---

**Created by:** Claude  
**Date:** November 14, 2025, 3:00 AM  
**API Version:** v1  
**Made in Zambia 🇿🇲**
