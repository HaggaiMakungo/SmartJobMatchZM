"""
Diagnose skill matching issues
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.corporate_job import CorporateJob
from app.models.cv import CV
from app.services.skill_normalizer import SkillNormalizer

def diagnose_skills():
    db = SessionLocal()
    normalizer = SkillNormalizer()
    
    try:
        # Get the Photographer job
        job = db.query(CorporateJob).filter(CorporateJob.job_id == "JOB000070").first()
        
        print("🔍 SKILL MATCHING DIAGNOSTIC")
        print("=" * 60)
        
        # Show job skills
        print("\n📋 JOB SKILLS:")
        print(f"   Raw required_skills: {job.required_skills}")
        print(f"   Raw preferred_skills: {job.preferred_skills}")
        
        # Normalize job skills
        job_skills = []
        if job.required_skills:
            job_skills.extend([s.strip() for s in job.required_skills.split(',')])
        if job.preferred_skills:
            job_skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        
        print(f"\n   Before normalization: {job_skills}")
        
        if job_skills:
            normalized = normalizer.normalize_skill_list(job_skills)
            job_skills_normalized = normalized['normalized']
            print(f"   After normalization: {job_skills_normalized}")
        
        # Sample some CVs
        print("\n\n📄 CV SAMPLES (first 10 with skills):")
        print("=" * 60)
        
        cvs_with_skills = db.query(CV).filter(
            (CV.skills_technical.isnot(None)) | (CV.skills_soft.isnot(None))
        ).limit(10).all()
        
        for i, cv in enumerate(cvs_with_skills, 1):
            print(f"\n{i}. {cv.full_name}")
            print(f"   Technical: {cv.skills_technical}")
            print(f"   Soft: {cv.skills_soft}")
            
            # Normalize CV skills
            cv_skills = []
            if cv.skills_technical:
                cv_skills.extend([s.strip() for s in cv.skills_technical.split(',')])
            if cv.skills_soft:
                cv_skills.extend([s.strip() for s in cv.skills_soft.split(',')])
            
            if cv_skills:
                normalized = normalizer.normalize_skill_list(cv_skills)
                cv_skills_normalized = normalized['normalized']
                print(f"   Normalized: {cv_skills_normalized[:5]}...")
                
                # Check for matches
                job_set = set(s.lower() for s in job_skills_normalized)
                cv_set = set(s.lower() for s in cv_skills_normalized)
                matches = list(job_set.intersection(cv_set))
                
                if matches:
                    print(f"   ✅ MATCHES: {matches}")
                else:
                    print(f"   ❌ No matches")
        
        # Check total CVs with skills
        print("\n\n📊 DATABASE STATISTICS:")
        print("=" * 60)
        
        total_cvs = db.query(CV).count()
        cvs_with_tech = db.query(CV).filter(CV.skills_technical.isnot(None)).count()
        cvs_with_soft = db.query(CV).filter(CV.skills_soft.isnot(None)).count()
        cvs_with_any = db.query(CV).filter(
            (CV.skills_technical.isnot(None)) | (CV.skills_soft.isnot(None))
        ).count()
        
        print(f"   Total CVs: {total_cvs}")
        print(f"   CVs with technical skills: {cvs_with_tech} ({cvs_with_tech/total_cvs*100:.1f}%)")
        print(f"   CVs with soft skills: {cvs_with_soft} ({cvs_with_soft/total_cvs*100:.1f}%)")
        print(f"   CVs with any skills: {cvs_with_any} ({cvs_with_any/total_cvs*100:.1f}%)")
        print(f"   CVs with NO skills: {total_cvs - cvs_with_any} ({(total_cvs-cvs_with_any)/total_cvs*100:.1f}%)")
        
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_skills()
