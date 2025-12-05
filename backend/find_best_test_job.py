"""
Find a better job for testing - one that matches the CV database
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.corporate_job import CorporateJob
from collections import Counter

def find_best_job():
    db = SessionLocal()
    
    try:
        # Get all jobs
        jobs = db.query(CorporateJob).all()
        
        print("🔍 FINDING BEST TEST JOB")
        print("=" * 60)
        
        # Count skill frequency in jobs
        skill_counts = Counter()
        
        for job in jobs:
            skills = []
            if job.required_skills:
                skills.extend([s.strip().lower() for s in job.required_skills.split(',')])
            if job.preferred_skills:
                skills.extend([s.strip().lower() for s in job.preferred_skills.split(',')])
            
            for skill in skills:
                skill_counts[skill] += 1
        
        print("\n📊 TOP 20 MOST COMMON JOB SKILLS:")
        for skill, count in skill_counts.most_common(20):
            print(f"   {skill}: {count} jobs")
        
        # Find jobs with common skills
        print("\n\n🎯 RECOMMENDED TEST JOBS:")
        print("=" * 60)
        
        common_skills = ['communication', 'leadership', 'management', 'problem', 'teamwork', 
                        'python', 'java', 'sql', 'data', 'analysis']
        
        matches = []
        for job in jobs:
            skills = []
            if job.required_skills:
                skills.extend([s.strip().lower() for s in job.required_skills.split(',')])
            if job.preferred_skills:
                skills.extend([s.strip().lower() for s in job.preferred_skills.split(',')])
            
            # Count how many common skills this job has
            common_count = sum(1 for skill in skills if any(common in skill for common in common_skills))
            
            if common_count >= 2:
                matches.append((job, common_count, skills))
        
        # Sort by common skills
        matches.sort(key=lambda x: x[1], reverse=True)
        
        # Show top 10
        for i, (job, common_count, skills) in enumerate(matches[:10], 1):
            print(f"\n{i}. {job.title} ({job.company})")
            print(f"   Job ID: {job.job_id}")
            print(f"   Common skills: {common_count}")
            print(f"   Skills: {', '.join(skills[:5])}...")
        
        # Recommend the best one
        if matches:
            best_job = matches[0][0]
            print(f"\n\n✅ RECOMMENDED JOB FOR TESTING:")
            print(f"   Job ID: {best_job.job_id}")
            print(f"   Title: {best_job.title}")
            print(f"   Company: {best_job.company}")
            print(f"   Required: {best_job.required_skills}")
            print(f"   Preferred: {best_job.preferred_skills}")
            
            return best_job.job_id
        
    finally:
        db.close()

if __name__ == "__main__":
    find_best_job()
