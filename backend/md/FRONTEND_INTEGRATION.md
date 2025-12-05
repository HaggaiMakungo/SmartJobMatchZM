# 🔌 Frontend-Backend Integration Guide

## 🎯 Quick Start

### Step 1: Start Backend
```bash
cd C:\Dev\ai-job-matchingV2\backend
setup_for_frontend.bat
```

This will:
1. Create demo users (Mark & Brian)
2. Start backend server on http://localhost:8000
3. Display API documentation at http://localhost:8000/docs

### Step 2: Test API
```bash
# In another terminal
python test_match_api.py
```

---

## 👤 Demo User Credentials

### Mark Ziligone (Recruiter)
- **Email:** `mark.ziligone@smartjobmatch.zm`
- **Password:** `Demo2024!`
- **Role:** Recruiter (can post jobs, view candidates)

### Brian Mwale (Job Seeker)
- **Email:** `brian.mwale@email.com`
- **Password:** `Demo2024!`
- **Role:** Job Seeker (can search jobs, get matches)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### 1. Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=mark.ziligone@smartjobmatch.zm
password=Demo2024!

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "mark.ziligone@smartjobmatch.zm",
    "full_name": "Mark Ziligone"
  }
}
```

### 2. Get Job Matches

#### Corporate Jobs
```http
POST /api/match
Content-Type: application/json

{
  "cv_id": "1",
  "job_type": "corporate",
  "limit": 20,
  "min_score": 0.3
}

Response:
{
  "cv_id": "1",
  "cv_name": "Mary Phiri",
  "job_type": "corporate",
  "matches": [
    {
      "job_id": "JOB000001",
      "title": "Software Developer",
      "company": "Liquid Telecom Zambia",
      "category": "Technology",
      "location": "Lusaka, Lusaka Province",
      "salary_range": "ZMW 15,000 - 25,000",
      "final_score": 0.85,
      "component_scores": {
        "qualification": 0.90,
        "experience": 0.85,
        "skills": 0.92,
        "location": 1.0,
        "category": 0.80,
        "personalization": 0.65
      },
      "explanation": "✓ Education matches • ✓ 8 years experience • ✓ Strong skills match"
    }
  ],
  "total": 15,
  "execution_time_ms": 156.23
}
```

#### Small Jobs/Gigs
```http
POST /api/match
Content-Type: application/json

{
  "cv_id": "10",
  "job_type": "small",
  "limit": 10,
  "min_score": 0.2
}
```

### 3. Test Endpoint
```http
GET /api/match/test

Response:
{
  "status": "success",
  "message": "Matching service is working",
  "test_cv": "Mary Phiri",
  "test_matches": 1
}
```

---

## 🎨 Frontend Integration Code

### React/Next.js Example

#### 1. API Client Setup
```typescript
// lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  
  return response.json();
}

export async function getMatches(
  cvId: string,
  jobType: 'corporate' | 'small',
  limit: number = 20,
  minScore: number = 0.3
) {
  const response = await fetch(`${API_BASE_URL}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cv_id: cvId,
      job_type: jobType,
      limit,
      min_score: minScore,
    }),
  });
  
  return response.json();
}
```

#### 2. Login Component
```typescript
// components/LoginForm.tsx
import { useState } from 'react';
import { login } from '@/lib/api';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### 3. Matches Component
```typescript
// components/JobMatches.tsx
import { useState, useEffect } from 'react';
import { getMatches } from '@/lib/api';

export function JobMatches({ cvId }: { cvId: string }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await getMatches(cvId, 'corporate');
        setMatches(data.matches);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, [cvId]);
  
  if (loading) return <div>Loading matches...</div>;
  
  return (
    <div>
      <h2>Top Job Matches</h2>
      {matches.map((match) => (
        <div key={match.job_id} className="job-card">
          <h3>{match.title}</h3>
          <p>{match.company}</p>
          <p>{match.location}</p>
          <div className="score">
            Match: {(match.final_score * 100).toFixed(0)}%
          </div>
          <p>{match.explanation}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 CORS Configuration

The backend is already configured to allow requests from:
- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)

If your frontend runs on a different port, add it to `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:YOUR_PORT
```

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
setup_for_frontend.bat
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=mark.ziligone@smartjobmatch.zm&password=Demo2024!"
```

### 3. Test Matching
```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": "1",
    "job_type": "corporate",
    "limit": 5
  }'
```

### 4. View API Docs
Open browser: `http://localhost:8000/docs`

---

## 📊 Available Data

### CVs in Database
- **Total:** 2,500 CVs
- **IDs:** 1 to 2500
- **Example CV IDs for testing:**
  - `1` - Mary Phiri (Software Engineer, Tech)
  - `2` - John Mulenga (Engineering)
  - `10` - Catherine Zimba (Marketing)

### Jobs in Database
- **Corporate Jobs:** 500
- **Small Jobs/Gigs:** 400
- **Categories:** Technology, Healthcare, Education, Construction, etc.

---

## 🚀 Next Steps

1. **Start Backend:** Run `setup_for_frontend.bat`
2. **Test API:** Run `python test_match_api.py`
3. **Connect Frontend:** Update your frontend API base URL
4. **Test Login:** Use Mark or Brian's credentials
5. **Test Matching:** Call `/api/match` endpoint

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify PostgreSQL is running
- Check `.env` file has correct database credentials

### CORS errors
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart backend after changes

### No matches returned
- Check CV ID exists (1-2500)
- Lower `min_score` threshold
- Verify database has jobs

### Login fails
- Run `create_demo_users.py` to create users
- Check password is exactly `Demo2024!`
- Verify `users` table exists

---

## 📞 Support

If you encounter issues:
1. Check backend logs in terminal
2. Visit http://localhost:8000/docs for API documentation
3. Test endpoints with Swagger UI
4. Check `test_match_api.py` for working examples

---

**Last Updated:** November 12, 2025  
**Backend Version:** v1.0.0  
**API Version:** v1
