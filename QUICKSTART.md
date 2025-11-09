# 🚀 Quick Start Guide

Get SmartJobMatchZM up and running in 15 minutes!

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Python 3.11+** installed ([Download](https://www.python.org/downloads/))
- [ ] **Node.js 18+** and npm installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL 14+** installed and running ([Download](https://www.postgresql.org/download/))
- [ ] **Git** installed ([Download](https://git-scm.com/downloads))
- [ ] A code editor (VS Code recommended)

---

## 🎯 30-Second Overview

```
SmartJobMatchZM/
├── backend/     → FastAPI + PostgreSQL + ML
├── frontend/    → React + Tailwind CSS
└── datasets/    → Job data
```

---

## ⚡ Quick Setup (Development)

### 1️⃣ Clone and Navigate

```bash
git clone https://github.com/YOUR_USERNAME/SmartJobMatchZM.git
cd SmartJobMatchZM
```

### 2️⃣ Set Up Database

```bash
# Start PostgreSQL (Windows)
# Make sure PostgreSQL service is running

# Create database
psql -U postgres
CREATE DATABASE job_match_db;
\q
```

### 3️⃣ Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env    # Windows
# cp .env.example .env      # Linux/Mac

# Edit .env with your database credentials
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/job_match_db

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

✅ Backend running at: **http://localhost:8000**

### 4️⃣ Frontend Setup (3 minutes)

Open a **new terminal**:

```bash
cd frontend/jobmatch

# Install dependencies
npm install

# Create .env file
copy .env.example .env.local  # Windows
# cp .env.example .env.local    # Linux/Mac

# Edit .env.local
# VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 🧪 Verify Installation

### Test Backend
```bash
# Visit in browser or use curl:
curl http://localhost:8000/api/health

# Should return:
{"status": "healthy", "version": "2.0.0"}
```

### Test Frontend
Open browser: http://localhost:5173
You should see the SmartJobMatchZM homepage!

---

## 📚 API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🗂️ Load Sample Data

```bash
cd backend

# Load corporate jobs
python scripts/load_corporate_jobs.py

# Load personal jobs
python scripts/load_personal_jobs.py

# Create test user (Brian Mwale)
python scripts/create_test_user.py
```

---

## 🎨 VS Code Setup (Recommended)

Install these extensions:
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -c "\l"
```

### Port Already in Use
```bash
# Backend (8000)
netstat -ano | findstr :8000
# Kill the process using the PID shown

# Frontend (5173)
netstat -ano | findstr :5173
```

### Module Not Found
```bash
# Backend
pip install -r requirements.txt --force-reinstall

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### Python Virtual Environment Issues
```bash
# Delete and recreate
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🎯 Next Steps

Now that you're set up:

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Read the Documentation**: Check out [ROADMAP.md](ROADMAP.md)
3. **Run Tests**: `pytest` in backend, `npm test` in frontend
4. **Start Coding**: Follow [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📁 Project Structure

```
SmartJobMatchZM/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── api/                 # API routes
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── ml/                  # Matching engine
│   ├── tests/
│   ├── alembic/                 # Database migrations
│   └── requirements.txt
│
├── frontend/
│   ├── jobmatch/               # Job seeker app
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── recruiter/              # Employer app
│
└── datasets/
    ├── Corp_jobs.csv
    └── Personal_jobs.csv
```

---

## 🔑 Environment Variables Reference

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_match_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=SmartJobMatchZM
```

---

## 🚦 Development Workflow

```bash
# Daily workflow
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# Make changes...

git add .
git commit -m "feat: your feature description"
git push -u origin feature/your-feature

# Create PR on GitHub
```

---

## 📞 Need Help?

- **Documentation**: Check [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/SmartJobMatchZM/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/SmartJobMatchZM/discussions)

---

## ✅ Setup Complete!

You're all set! Time to build something amazing for the Zambian job market! 🇿🇲

**Happy Coding!** 🎉
