# Database Setup Guide

## Prerequisites

1. **PostgreSQL 15+** installed and running
2. **Python environment** activated
3. **Required packages** installed from requirements.txt

## Quick Setup

### 1. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE job_match_db;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE job_match_db TO postgres;

# Exit
\q
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/job_match_db
```

### 3. Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 4. Seed Database

```bash
# Load all data from CSV/JSON files
python seed_database.py
```

## Manual Setup (Alternative)

If you prefer manual control:

### Step 1: Create Tables

```python
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)
```

### Step 2: Load Data

```bash
python seed_database.py
```

## Verify Database

### Check Tables

```bash
psql -U postgres -d job_match_db
```

```sql
-- List all tables
\dt

-- Check record counts
SELECT 'cvs' as table_name, COUNT(*) FROM cvs
UNION ALL
SELECT 'corporate_jobs', COUNT(*) FROM corporate_jobs
UNION ALL
SELECT 'small_jobs', COUNT(*) FROM small_jobs
UNION ALL
SELECT 'skills_taxonomy', COUNT(*) FROM skills_taxonomy
UNION ALL
SELECT 'skill_cooccurrence', COUNT(*) FROM skill_cooccurrence
UNION ALL
SELECT 'industry_transitions', COUNT(*) FROM industry_transitions;

-- Sample queries
SELECT * FROM cvs LIMIT 5;
SELECT * FROM corporate_jobs WHERE collar_type = 'white' LIMIT 5;
SELECT * FROM skills_taxonomy ORDER BY frequency DESC LIMIT 10;
```

## Database Schema

### Core Tables

1. **cvs** - Candidate profiles (2,500 records)
2. **corporate_jobs** - Traditional employment (500 records)
3. **small_jobs** - Gig economy tasks (400 records)

### Intelligence Tables

4. **skills_taxonomy** - Normalized skills (500 top skills)
5. **skill_cooccurrence** - Skill relationships (100 pairs)
6. **industry_transitions** - Career path data (50 transitions)

### Telemetry Tables (Empty until matching starts)

7. **user_job_interactions** - Match event logs
8. **match_feedback** - User feedback on matches

## Troubleshooting

### Connection Issues

```python
# Test database connection
from app.db.session import engine

try:
    connection = engine.connect()
    print("✓ Database connection successful")
    connection.close()
except Exception as e:
    print(f"✗ Connection failed: {e}")
```

### Reset Database

```bash
# Drop and recreate (WARNING: Deletes all data)
psql -U postgres -c "DROP DATABASE IF EXISTS job_match_db;"
psql -U postgres -c "CREATE DATABASE job_match_db;"

# Re-run migrations and seeding
alembic upgrade head
python seed_database.py
```

### Alembic Issues

```bash
# Reset Alembic
rm -rf alembic/versions/*
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

## Next Steps

After database is set up:

1. ✅ Database seeded and verified
2. ⏭️ Build matching algorithms (`app/services/matching/`)
3. ⏭️ Create API endpoints (`app/api/endpoints/`)
4. ⏭️ Start logging interactions

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
