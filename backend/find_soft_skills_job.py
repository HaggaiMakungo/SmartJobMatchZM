"""
Find a job that matches the actual CV skill distribution (soft skills)
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.corporate_job import CorporateJob

def find_soft_skills_job():
    db = SessionLocal()
    
    try:
        # Get all jobs
        jobs = db.query(CorporateJob).all()
        
        print("🔍 FINDING JOB WITH SOFT SKILLS")
        print("=" * 60)
        
        # Skills that are common in CVs
        common_cv_skills = ['communication', 'customer service', 'leadership', 
                           'teamwork', 'problem-solving', 'sales']
        
        matches = []
        for job in jobs:
            skills = []
            if job.required_skills:
                skills.extend([s.strip().lower() for s in job.required_skills.split(',')])
            if job.preferred_skills:
                skills.extend([s.strip().lower() for s in job.preferred_skills.split(',')])
            
            # Count soft skills
            soft_count = sum(1 for skill in skills if any(common in skill for common in common_cv_skills))
            
            if soft_count >= 3:
                matches.append((job, soft_count, skills))
        
        # Sort by soft skills count
        matches.sort(key=lambda x: x[1], reverse=True)
        
        print("\n🎯 TOP 10 JOBS WITH SOFT SKILLS:")
        for i, (job, count, skills) in enumerate(matches[:10], 1):
            print(f"\n{i}. {job.title} ({job.company})")
            print(f"   Job ID: {job.job_id}")
            print(f"   Soft skills: {count}")
            print(f"   Skills: {', '.join(skills[:5])}...")
        
        if matches:
            best = matches[0][0]
            print(f"\n\n✅ RECOMMENDED:")
            print(f"   Job ID: {best.job_id}")
            print(f"   Title: {best.title}")
            print(f"   Company: {best.company}")
            print(f"   Required: {best.required_skills}")
            return best.job_id
        
    finally:
        db.close()

if __name__ == "__main__":
    find_soft_skills_job()
