"""
Background script to pre-compute job-candidate matches
Run this periodically (daily/hourly) to refresh match cache
"""
import sys
import time
import json
from pathlib import Path
from datetime import datetime

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from app.services.enhanced_matching_service import EnhancedMatchingService
from app.models.job_candidate_match import JobCandidateMatch

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def create_match_table():
    """Create the job_candidate_matches table if it doesn't exist"""
    print("\n📋 Creating job_candidate_matches table...")
    
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS job_candidate_matches (
                job_id VARCHAR NOT NULL,
                cv_id VARCHAR NOT NULL,
                match_score FLOAT NOT NULL,
                skill_score FLOAT,
                experience_score FLOAT,
                location_score FLOAT,
                education_score FLOAT,
                matched_skills TEXT,
                missing_skills TEXT,
                match_explanation TEXT,
                computed_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (job_id, cv_id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_job_score ON job_candidate_matches(job_id, match_score);
            CREATE INDEX IF NOT EXISTS idx_cv_score ON job_candidate_matches(cv_id, match_score);
            CREATE INDEX IF NOT EXISTS idx_computed_at ON job_candidate_matches(computed_at);
        """))
    
    print("✅ Table created successfully!")


def compute_all_matches(batch_size: int = 100, min_score: float = 0.0):
    """
    Compute matches for all jobs and candidates
    
    Args:
        batch_size: Number of CVs to process per batch
        min_score: Only store matches above this threshold (0.0 = store all)
    """
    db = SessionLocal()
    
    try:
        # Initialize matching service (loads semantic model)
        print("\n🤖 Initializing semantic matching service...")
        start = time.time()
        matching_service = EnhancedMatchingService(db)
        print(f"✅ Service initialized in {time.time() - start:.1f}s")
        
        # Get all jobs
        print("\n📊 Fetching jobs...")
        jobs = db.execute(text("""
            SELECT job_id, job_title, company
            FROM corporate_jobs
            ORDER BY job_id
        """)).fetchall()
        
        print(f"✅ Found {len(jobs)} jobs to process")
        
        # Get all CVs
        print("\n📊 Fetching CVs...")
        cvs = db.execute(text("""
            SELECT cv_id, full_name
            FROM cvs
            ORDER BY cv_id
        """)).fetchall()
        
        print(f"✅ Found {len(cvs)} CVs to process")
        
        # Calculate total matches to compute
        total_matches = len(jobs) * len(cvs)
        print(f"\n🎯 Total matches to compute: {total_matches:,}")
        print(f"⏱️  Estimated time: {total_matches * 0.05 / 60:.1f} minutes")
        
        # Process each job
        total_stored = 0
        start_time = time.time()
        
        for job_idx, job in enumerate(jobs, 1):
            job_id = job[0]
            job_title = job[1]
            company = job[2]
            
            print(f"\n{'='*80}")
            print(f"🎯 Job {job_idx}/{len(jobs)}: {job_title} at {company}")
            print(f"{'='*80}")
            
            # Match this job against all candidates
            job_start = time.time()
            matches = matching_service.match_job(job_id)
            
            # Store matches in database
            stored_count = 0
            batch_values = []
            
            for match in matches:
                if match['final_score'] >= min_score:
                    batch_values.append({
                        'job_id': job_id,
                        'cv_id': match['cv_id'],
                        'match_score': match['final_score'],
                        'skill_score': match['scores']['skills'],
                        'experience_score': match['scores']['experience'],
                        'location_score': match['scores']['location'],
                        'education_score': match['scores']['education'],
                        'matched_skills': json.dumps(match.get('matched_skills', [])),
                        'missing_skills': json.dumps(match.get('missing_skills', [])),
                        'match_explanation': match.get('explanation', '')
                    })
                    stored_count += 1
            
            # Batch insert
            if batch_values:
                db.execute(text("""
                    INSERT INTO job_candidate_matches 
                    (job_id, cv_id, match_score, skill_score, experience_score, 
                     location_score, education_score, matched_skills, missing_skills, 
                     match_explanation, computed_at, updated_at)
                    VALUES 
                    (:job_id, :cv_id, :match_score, :skill_score, :experience_score,
                     :location_score, :education_score, :matched_skills, :missing_skills,
                     :match_explanation, NOW(), NOW())
                    ON CONFLICT (job_id, cv_id) 
                    DO UPDATE SET
                        match_score = EXCLUDED.match_score,
                        skill_score = EXCLUDED.skill_score,
                        experience_score = EXCLUDED.experience_score,
                        location_score = EXCLUDED.location_score,
                        education_score = EXCLUDED.education_score,
                        matched_skills = EXCLUDED.matched_skills,
                        missing_skills = EXCLUDED.missing_skills,
                        match_explanation = EXCLUDED.match_explanation,
                        updated_at = NOW()
                """), batch_values)
                db.commit()
            
            total_stored += stored_count
            job_time = time.time() - job_start
            elapsed = time.time() - start_time
            
            # Progress report
            print(f"   ✅ Stored {stored_count} matches (≥{min_score*100:.0f}%) in {job_time:.1f}s")
            print(f"   📊 Total stored: {total_stored:,} matches")
            print(f"   ⏱️  Elapsed: {elapsed/60:.1f} min")
            
            # Estimate remaining time
            jobs_remaining = len(jobs) - job_idx
            avg_time_per_job = elapsed / job_idx
            est_remaining = jobs_remaining * avg_time_per_job
            print(f"   🕐 Estimated remaining: {est_remaining/60:.1f} min")
        
        # Final summary
        total_time = time.time() - start_time
        print(f"\n{'='*80}")
        print(f"🎉 COMPUTATION COMPLETE!")
        print(f"{'='*80}")
        print(f"   ✅ Total matches stored: {total_stored:,}")
        print(f"   ⏱️  Total time: {total_time/60:.1f} minutes")
        print(f"   ⚡ Average: {total_time/len(jobs):.1f}s per job")
        print(f"   📊 Database size: ~{total_stored * 0.5 / 1024:.1f} MB")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def get_cache_stats():
    """Get statistics about the match cache"""
    db = SessionLocal()
    
    try:
        # Total matches
        total = db.execute(text("""
            SELECT COUNT(*) FROM job_candidate_matches
        """)).scalar()
        
        # Matches by score range
        score_ranges = db.execute(text("""
            SELECT 
                CASE 
                    WHEN match_score >= 0.7 THEN 'Excellent (70%+)'
                    WHEN match_score >= 0.5 THEN 'Good (50-69%)'
                    WHEN match_score >= 0.3 THEN 'Fair (30-49%)'
                    ELSE 'Low (<30%)'
                END as range,
                COUNT(*) as count
            FROM job_candidate_matches
            GROUP BY range
            ORDER BY MIN(match_score) DESC
        """)).fetchall()
        
        # Oldest match
        oldest = db.execute(text("""
            SELECT MIN(computed_at) FROM job_candidate_matches
        """)).scalar()
        
        # Newest match
        newest = db.execute(text("""
            SELECT MAX(computed_at) FROM job_candidate_matches
        """)).scalar()
        
        print(f"\n{'='*80}")
        print(f"📊 MATCH CACHE STATISTICS")
        print(f"{'='*80}")
        print(f"   Total matches: {total:,}")
        print(f"\n   Distribution by score:")
        for range_name, count in score_ranges:
            print(f"      {range_name}: {count:,} ({count/total*100:.1f}%)")
        print(f"\n   Cache age:")
        print(f"      Oldest: {oldest}")
        print(f"      Newest: {newest}")
        
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Pre-compute job-candidate matches")
    parser.add_argument('--create-table', action='store_true', help='Create the matches table')
    parser.add_argument('--compute', action='store_true', help='Compute all matches')
    parser.add_argument('--stats', action='store_true', help='Show cache statistics')
    parser.add_argument('--min-score', type=float, default=0.0, 
                       help='Minimum match score to store (0.0-1.0)')
    
    args = parser.parse_args()
    
    if args.create_table:
        create_match_table()
    
    if args.compute:
        print("\n🚀 Starting match pre-computation...")
        print(f"   Min score threshold: {args.min_score*100:.0f}%")
        compute_all_matches(min_score=args.min_score)
    
    if args.stats:
        get_cache_stats()
    
    if not any([args.create_table, args.compute, args.stats]):
        parser.print_help()
