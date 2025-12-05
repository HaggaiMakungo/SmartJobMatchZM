# 🔧 Test User Setup Instructions

## Create Test Recruiter Account

Run this command in your backend directory:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m scripts.create_test_recruiter
```

This will create:
- **Email**: recruiter@zedsafe.com
- **Password**: test123

## Test Login

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev` (in recruiter folder)
3. Go to: http://localhost:3000/login
4. Login with the credentials above

## Fixed Issues

✅ Changed `email` to `username` in login payload (FastAPI OAuth2 requirement)
✅ Updated response handling to use `access_token` instead of `token`
✅ Created script to generate test user with hashed password

The login should now work perfectly! 🎉
