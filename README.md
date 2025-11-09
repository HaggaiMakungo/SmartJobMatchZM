# SmartJobMatchZM 🇿🇲

> AI-Powered Job Matching Platform for Zambia

SmartJobMatchZM is an intelligent job matching system that connects Zambian job seekers with both corporate opportunities and gig/personal jobs using advanced AI and machine learning algorithms.

## 🌟 Features

- **AI-Powered Matching**: Hybrid matching algorithm combining keyword search, semantic similarity, and category relevance
- **Collar-Aware Intelligence**: Specialized matching for different job types (white, blue, pink, grey, green collar)
- **Dual Job Market**: Supports both corporate formal sector jobs and personal/gig economy opportunities
- **Comprehensive Profiling**: Detailed CV management including education, skills, and experience tracking
- **Real-time Scoring**: CAMSS formula (Category, Ability, Match, Skills, Suitability) for precise job-candidate alignment

## 🏗️ Project Structure

```
SmartJobMatchZM/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Configuration, security
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── ml/          # ML/AI matching engine
│   ├── tests/           # Test suite
│   └── requirements.txt
│
├── frontend/            # React frontends
│   ├── jobmatch/       # Job seeker interface
│   └── recruiter/      # Recruiter/employer interface
│
└── datasets/           # Job data
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend/jobmatch
npm install
npm run dev
```

## 🧠 Matching Algorithm

Our hybrid matching system uses:

1. **Category Relevance**: Prevents cross-domain false positives
2. **Skills Matching**: 
   - Keyword exact matching
   - Semantic similarity (sentence-transformers)
   - Category-aware scoring
3. **CAMSS Scoring**: Weighted formula considering:
   - Qualifications (education level)
   - Experience (years)
   - Skills match
   - Location proximity

## 📊 Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Authentication**: JWT tokens
- **ML/AI**: sentence-transformers, scikit-learn
- **Validation**: Pydantic

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Build Tool**: Vite

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

```
POST   /api/auth/login              - User authentication
GET    /api/match/jobs              - Get AI-matched jobs
GET    /api/match/job/{job_id}      - Get match score for specific job
GET    /api/jobs/all                - List all jobs
POST   /api/cv/create               - Create/update CV
GET    /api/cv/me                   - Get current user's CV
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend/jobmatch
npm test
```

## 🗃️ Database Schema

Key entities:
- **Users**: Authentication and profile data
- **CVs**: Resume information
- **Education**: Degrees and certifications
- **Skills**: User skills and proficiency
- **JobExperience**: Work history
- **CorporateJobs**: Formal sector positions
- **PersonalJobs**: Gig and personal opportunities

## 🌍 Zambian Context

This platform is specifically designed for the Zambian job market:
- Multi-collar job classification
- Local geography considerations (Lusaka, Copperbelt, etc.)
- Support for both formal and informal economy
- Kwacha-based salary ranges

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Built with ❤️ for the Zambian job market
- Powered by open-source ML models
- Community-driven development

## 📧 Contact

- Website: [coming soon]
- Email: [your-email]
- Twitter: [@SmartJobMatchZM]

---

**Status**: 🚧 In Active Development

**Version**: 2.0.0 (Complete Rebuild)
