"""
Database Seeding Script
Loads generated CSV data and JSON intelligence into PostgreSQL
"""

import pandas as pd
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models import (
    CV, CorporateJob, SmallJob, SkillTaxonomy,
    SkillCooccurrence, IndustryTransition
)

print("=" * 80)
print("DATABASE SEEDING SCRIPT")
print("=" * 80)

# File paths
DATASETS_DIR = "datasets"
CVS_CSV = f"{DATASETS_DIR}/CVs.csv"
CORP_JOBS_CSV = f"{DATASETS_DIR}/Corp_jobs.csv"
SMALL_JOBS_CSV = f"{DATASETS_DIR}/Small_jobs.csv"
SKILLS_JSON = f"{DATASETS_DIR}/skills_taxonomy.json"
COOCCURRENCE_JSON = f"{DATASETS_DIR}/skill_co_occurrence.json"
TRANSITIONS_JSON = f"{DATASETS_DIR}/industry_transitions.json"


def load_csv_with_encoding(filepath, encodings=['utf-8', 'latin-1', 'windows-1252', 'cp1252']):
    """Try loading CSV with different encodings"""
    for encoding in encodings:
        try:
            return pd.read_csv(filepath, encoding=encoding)
        except UnicodeDecodeError:
            continue
        except Exception as e:
            raise e
    raise Exception(f"Could not decode file with any of these encodings: {encodings}")


def create_tables():
    """Create all database tables"""
    print("\n[1/7] Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        sys.exit(1)


def parse_json_safe(value):
    """Safely parse JSON, handling malformed data"""
    if pd.isna(value) or value == '' or value == '[]' or value == '{}':
        return None
    try:
        if isinstance(value, str):
            return json.loads(value)
        return value
    except (json.JSONDecodeError, ValueError):
        # If JSON parsing fails, return None
        return None

def seed_cvs(session):
    """Load CV data"""
    print("\n[2/7] Seeding CVs...")
    try:
        # Read CSV with proper dtype for problematic columns
        df = load_csv_with_encoding(CVS_CSV)
        
        # Convert all columns to strings first to avoid type issues
        df = df.astype(str)
        
        records_added = 0
        errors = 0
        for idx, row in df.iterrows():
            try:
                # Handle numeric conversions safely
                def safe_float(val, default=None):
                    try:
                        if val == 'nan' or val == 'None' or val == '':
                            return default
                        return float(val)
                    except (ValueError, TypeError):
                        return default
                
                def safe_int(val, default=None):
                    try:
                        if val == 'nan' or val == 'None' or val == '':
                            return default
                        return int(float(val))
                    except (ValueError, TypeError):
                        return default
                
                cv = CV(
                    cv_id=str(row['cv_id']),
                    full_name=row['full_name'],
                    phone=row.get('phone') if row.get('phone') != 'nan' else None,
                    email=row['email'],
                    gender=row.get('gender') if row.get('gender') != 'nan' else None,
                    date_of_birth=pd.to_datetime(row['date_of_birth'], dayfirst=True, errors='coerce') if row.get('date_of_birth') != 'nan' else None,
                    nationality=row.get('nationality') if row.get('nationality') != 'nan' else None,
                    city=row.get('city') if row.get('city') != 'nan' else None,
                    province=row.get('province') if row.get('province') != 'nan' else None,
                    education_level=row.get('education_level') if row.get('education_level') != 'nan' else None,
                    institution=row.get('institution') if row.get('institution') != 'nan' else None,
                    graduation_year=safe_int(row.get('graduation_year')),
                    major=row.get('major') if row.get('major') != 'nan' else None,
                    certifications=row.get('certifications') if row.get('certifications') != 'nan' else None,
                    languages=row.get('languages') if row.get('languages') != 'nan' else None,
                    language_proficiency=row.get('language_proficiency') if row.get('language_proficiency') != 'nan' else None,
                    total_years_experience=safe_float(row.get('total_years_experience'), 0),
                    current_job_title=row.get('current_job_title') if row.get('current_job_title') != 'nan' else None,
                    employment_status=row.get('employment_status') if row.get('employment_status') != 'nan' else None,
                    preferred_job_type=row.get('preferred_job_type') if row.get('preferred_job_type') != 'nan' else None,
                    preferred_location=row.get('preferred_location') if row.get('preferred_location') != 'nan' else None,
                    salary_expectation_min=safe_float(row.get('salary_expectation_min')),
                    salary_expectation_max=safe_float(row.get('salary_expectation_max')),
                    availability=row.get('availability') if row.get('availability') != 'nan' else None,
                    skills_technical=row.get('skills_technical') if row.get('skills_technical') != 'nan' else None,
                    skills_soft=row.get('skills_soft') if row.get('skills_soft') != 'nan' else None,
                    work_experience_json=parse_json_safe(row.get('work_experience_json')),
                    projects_json=parse_json_safe(row.get('projects_json')),
                    references_json=parse_json_safe(row.get('references_json')),
                    resume_quality_score=safe_float(row.get('resume_quality_score'))
                )
                session.add(cv)
                records_added += 1
                
                if records_added % 500 == 0:
                    session.commit()
                    print(f"  Committed {records_added} CVs...")
            except Exception as e:
                errors += 1
                if errors <= 5:  # Only show first 5 errors
                    print(f"  Warning: Skipping CV at row {idx}: {str(e)[:100]}")
                continue
        
        session.commit()
        print(f"✓ Seeded {records_added} CVs (skipped {errors} with errors)")
        
        if records_added == 0:
            print("  ⚠ WARNING: No CVs were seeded! Check the CSV file format.")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding CVs: {e}")
        raise


def seed_corporate_jobs(session):
    """Load corporate job data"""
    print("\n[3/7] Seeding Corporate Jobs...")
    try:
        df = load_csv_with_encoding(CORP_JOBS_CSV)
        
        records_added = 0
        for _, row in df.iterrows():
            job = CorporateJob(
                job_id=str(row['job_id']),
                title=row['title'],
                company=row['company'],
                category=row['category'],
                collar_type=row['collar_type'],
                description=row.get('description'),
                key_responsibilities=row.get('key_responsibilities'),
                required_skills=row.get('required_skills'),
                preferred_skills=row.get('preferred_skills'),
                required_experience_years=float(row['required_experience_years']) if pd.notna(row.get('required_experience_years')) else 0,
                required_education=row.get('required_education'),
                preferred_certifications=row.get('preferred_certifications'),
                location_city=row.get('location_city'),
                location_province=row.get('location_province'),
                salary_min_zmw=float(row['salary_min_zmw']) if pd.notna(row.get('salary_min_zmw')) else None,
                salary_max_zmw=float(row['salary_max_zmw']) if pd.notna(row.get('salary_max_zmw')) else None,
                employment_type=row.get('employment_type'),
                work_schedule=row.get('work_schedule'),
                language_requirements=row.get('language_requirements'),
                application_deadline=pd.to_datetime(row['application_deadline'], dayfirst=True, errors='coerce') if pd.notna(row.get('application_deadline')) else None,
                posted_date=pd.to_datetime(row['posted_date'], dayfirst=True, errors='coerce') if pd.notna(row.get('posted_date')) else None,
                benefits=row.get('benefits'),
                growth_opportunities=row.get('growth_opportunities'),
                company_size=row.get('company_size'),
                industry_sector=row.get('industry_sector')
            )
            session.add(job)
            records_added += 1
        
        session.commit()
        print(f"✓ Seeded {records_added} Corporate Jobs")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding Corporate Jobs: {e}")
        raise


def seed_small_jobs(session):
    """Load small job data"""
    print("\n[4/7] Seeding Small Jobs...")
    try:
        df = load_csv_with_encoding(SMALL_JOBS_CSV)
        
        records_added = 0
        for _, row in df.iterrows():
            job = SmallJob(
                id=str(row['id']),
                title=row['title'],
                category=row['category'],
                description=row.get('description'),
                province=row.get('province'),
                location=row.get('location'),
                budget=float(row['budget']) if pd.notna(row.get('budget')) else None,
                payment_type=row.get('paymentType'),
                duration=row.get('duration'),
                posted_by=row.get('postedBy'),
                date_posted=pd.to_datetime(row['datePosted'], dayfirst=True, errors='coerce') if pd.notna(row.get('datePosted')) else None,
                status=row.get('status')
            )
            session.add(job)
            records_added += 1
        
        session.commit()
        print(f"✓ Seeded {records_added} Small Jobs")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding Small Jobs: {e}")
        raise


def seed_skills_taxonomy(session):
    """Load skills taxonomy"""
    print("\n[5/7] Seeding Skills Taxonomy...")
    try:
        with open(SKILLS_JSON, 'r') as f:
            skills_data = json.load(f)
        
        records_added = 0
        for skill_data in skills_data:
            skill = SkillTaxonomy(
                skill_name=skill_data['skill'],
                normalized_name=skill_data['skill'].lower().strip(),
                frequency=skill_data['frequency'],
                percentage=skill_data['percentage']
            )
            session.add(skill)
            records_added += 1
        
        session.commit()
        print(f"✓ Seeded {records_added} skills")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding Skills Taxonomy: {e}")
        raise


def seed_skill_cooccurrence(session):
    """Load skill co-occurrence data"""
    print("\n[6/7] Seeding Skill Co-occurrence...")
    try:
        with open(COOCCURRENCE_JSON, 'r') as f:
            cooccurrence_data = json.load(f)
        
        records_added = 0
        for pair in cooccurrence_data:
            cooccur = SkillCooccurrence(
                skill_a=pair['skill_a'],
                skill_b=pair['skill_b'],
                co_occurrences=pair['co_occurrences'],
                jaccard_similarity=pair['jaccard_similarity']
            )
            session.add(cooccur)
            records_added += 1
        
        session.commit()
        print(f"✓ Seeded {records_added} skill pairs")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding Skill Co-occurrence: {e}")
        raise


def seed_industry_transitions(session):
    """Load industry transition data"""
    print("\n[7/7] Seeding Industry Transitions...")
    try:
        with open(TRANSITIONS_JSON, 'r') as f:
            transitions_data = json.load(f)
        
        records_added = 0
        for trans in transitions_data:
            transition = IndustryTransition(
                from_industry=trans['from_industry'],
                to_industry=trans['to_industry'],
                transitions=trans['transitions'],
                probability=trans['probability']
            )
            session.add(transition)
            records_added += 1
        
        session.commit()
        print(f"✓ Seeded {records_added} industry transitions")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding Industry Transitions: {e}")
        raise


def main():
    """Main seeding workflow"""
    print("\nStarting database seeding process...")
    print(f"Database URL: {engine.url}")
    
    # Create tables
    create_tables()
    
    # Create session
    session = SessionLocal()
    
    try:
        # Seed all data
        seed_cvs(session)
        seed_corporate_jobs(session)
        seed_small_jobs(session)
        seed_skills_taxonomy(session)
        seed_skill_cooccurrence(session)
        seed_industry_transitions(session)
        
        print("\n" + "=" * 80)
        print("✓ DATABASE SEEDING COMPLETE")
        print("=" * 80)
        print("\nDatabase is now ready for matching system development!")
        
    except Exception as e:
        print(f"\n✗ Seeding failed: {e}")
        session.rollback()
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    main()
