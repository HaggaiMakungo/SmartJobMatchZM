# SmartJobMatchZM

An AI-powered job matching platform for the Zambian labor market, connecting job seekers with opportunities through intelligent matching algorithms and semantic analysis.

## Overview

SmartJobMatchZM is a comprehensive job matching system that uses machine learning, natural language processing, and contextual factors specific to Zambia's labor market to connect candidates with suitable job opportunities. The system features separate interfaces for recruiters and job seekers, with a mobile application for on-the-go access.

## Key Features

### For Job Seekers
- **Intelligent Job Matching**: AI-powered recommendations based on skills, experience, and qualifications
- **Semantic Search**: Natural language understanding of job requirements and candidate profiles
- **Mobile Application**: React Native app for iOS and Android
- **Profile Management**: Comprehensive CV builder and profile editor
- **Application Tracking**: Monitor application status and history
- **Saved Jobs**: Bookmark interesting opportunities

### For Recruiters
- **Candidate Matching**: Advanced filtering and ranking of candidates
- **Dashboard Analytics**: Real-time insights into recruitment metrics
- **Hybrid Scoring**: Combines keyword matching (BM25) with semantic similarity (SBERT)
- **Bulk Operations**: Efficient management of multiple job postings
- **Applicant Tracking**: Streamlined candidate pipeline management

### Technical Highlights
- **CAMSS Algorithm**: Context-Aware Multi-factor Scoring System optimized for Zambia
- **ML-Powered Ranking**: LightGBM model trained on 7,500+ job interactions
- **Semantic Matching**: sentence-transformers (all-MiniLM-L6-v2) for understanding job/CV similarity
- **Hybrid Search**: BM25 keyword matching + SBERT semantic search for optimal results
- **Real-time Recommendations**: Fast matching with cached embeddings

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 14+
- **ML/AI**: 
  - sentence-transformers (SBERT)
  - LightGBM
  - scikit-learn
  - rank-bm25
- **Authentication**: JWT tokens with Argon2 password hashing
- **ORM**: SQLAlchemy 2.0+
- **Migration**: Alembic

### Frontend (Recruiter Dashboard)
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Build Tool**: Vite

### Mobile App (Job Seekers)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context
- **HTTP Client**: Axios

## Project Structure

```
ai-job-matchingV2/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   └── v1/          # API version 1
│   │   ├── core/            # Configuration and security
│   │   ├── db/              # Database session management
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── alembic/             # Database migrations
│   ├── ml/                  # ML model training scripts
│   ├── models/              # Trained ML models
│   ├── datasets/            # Sample datasets
│   ├── tests/               # Unit and integration tests
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
├── frontend/
│   ├── recruiter/           # Recruiter dashboard (React)
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Page components
│   │   │   ├── lib/         # Utilities
│   │   │   └── App.tsx      # Main app component
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── jobmatch/            # Mobile app (React Native)
│       ├── app/             # App screens (Expo Router)
│       ├── components/      # Reusable components
│       ├── contexts/        # React contexts
│       ├── services/        # API services
│       ├── app.json         # Expo configuration
│       └── package.json
│
├── docs/                    # Documentation
├── LICENSE                  # MIT License
└── README.md               # This file
```

## Installation

### Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/HaggaiMakungo/SmartJobMatchZM.git
cd ai-job-matchingV2/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Create PostgreSQL database:
```bash
createdb job_match_db
```

6. Run database migrations:
```bash
alembic upgrade head
```

7. (Optional) Import sample data:
```bash
python import_cvs.py
```

8. Start the server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend (Recruiter Dashboard) Setup

1. Navigate to frontend directory:
```bash
cd frontend/recruiter
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Dashboard will be available at `http://localhost:5173`

### Mobile App Setup

1. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

2. Navigate to mobile app directory:
```bash
cd frontend/jobmatch
```

3. Install dependencies:
```bash
npm install
```

4. Update API base URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api';
```

5. Start Expo development server:
```bash
npx expo start
```

6. Scan QR code with Expo Go app (iOS/Android)

## Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_match_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ML Settings
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_THRESHOLD=0.3

# CAMSS Weights
WEIGHT_QUALIFICATION=0.25
WEIGHT_EXPERIENCE=0.25
WEIGHT_SKILLS=0.30
WEIGHT_LOCATION=0.20
```

### Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `cvs` - Candidate profiles and resumes
- `corporate_jobs` - Full-time job postings
- `small_jobs` - Gig/task-based opportunities
- `user_job_interactions` - Application and save history
- `embedding_cache` - Pre-computed text embeddings

## API Documentation

### Authentication
```
POST /api/auth/login        # User login
POST /api/auth/register     # User registration
```

### Jobs
```
GET  /api/jobs/all                    # List all jobs
GET  /api/jobs/corporate              # List corporate jobs
GET  /api/jobs/corporate/{job_id}     # Get specific job
POST /api/jobs/corporate/create       # Create job posting
```

### Matching
```
GET  /api/ml/match/candidate/{cv_id}/hybrid     # Get hybrid-scored matches
GET  /api/match/ai/jobs                         # Get AI recommendations
```

### Candidate
```
GET  /api/candidate/profile/me        # Get user profile
GET  /api/candidate/applications      # Get user applications
GET  /api/candidate/saved-jobs        # Get saved jobs
POST /api/candidate/saved-jobs/{job_id}  # Save a job
```

Full API documentation available at `/docs` when backend is running.

## Machine Learning

### Matching Algorithm

The system uses a hybrid approach combining multiple techniques:

1. **BM25 (Best Matching 25)**: Keyword-based matching algorithm
   - Weight: 30%
   - Handles exact skill matches and keyword overlap

2. **SBERT (Sentence-BERT)**: Semantic similarity using transformers
   - Weight: 70%
   - Model: `all-MiniLM-L6-v2`
   - Understands context and meaning

3. **CAMSS Scoring**: Context-aware factors specific to Zambia
   - Location proximity
   - Salary alignment
   - Experience requirements
   - Industry-specific boosts (mining, government, etc.)

4. **ML Ranking Model**: LightGBM trained on historical interactions
   - 40 engineered features
   - 7,500+ training samples
   - Predicts application probability

### Model Training

To retrain the ML model:

```bash
cd backend/ml

# 1. Feature engineering
python feature_engineering.py

# 2. Train model
python train_ranking_model.py

# 3. Evaluate performance
python model_evaluation.py
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend/recruiter
npm test
```

## Deployment

### Production Checklist

1. Set strong `SECRET_KEY` in `.env`
2. Set `DATABASE_URL` to production database
3. Configure CORS for production domains
4. Set up SSL/TLS certificates
5. Use production-grade WSGI server (e.g., Gunicorn)
6. Set up database backups
7. Configure logging and monitoring
8. Review and secure all API endpoints

### Docker Deployment (Optional)

```bash
# Build and run with docker-compose
docker-compose up -d
```

## Performance

- Average API response time: <200ms
- Semantic matching: ~0.5s for 2,500 jobs
- Hybrid scoring: ~1s for full candidate-job matrix
- Database queries: Indexed for optimal performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- All tests pass
- New features include tests
- Documentation is updated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- SBERT models by UKP Lab, TU Darmstadt
- BM25 algorithm by Robertson & Zaragoza
- Material-UI team for excellent React components
- FastAPI team for the amazing Python framework

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: [makungohaggai@gmail.com]

## Roadmap

- [ ] Multi-language support (Bemba, Nyanja)
- [ ] Video interview scheduling
- [ ] Skills assessment integration
- [ ] Employer verification system
- [ ] Payment integration for premium features
- [ ] Advanced analytics dashboard
- [ ] Chatbot for candidate support

## Security

If you discover a security vulnerability, please email [makungohaggai@gmail.com] instead of using the issue tracker.

---

Built with care for the Zambian job market.
