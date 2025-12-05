"""
Seed test applications to the database
Creates sample applications from CVs to jobs
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine
from app.models.application import Application, ApplicationStatus, Base
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from sqlalchemy import text
import random
from datetime import datetime, timedelta


def seed_applications():
    """Seed test applications"""
    db = SessionLocal()
    
    try:
        # Create applications table if it doesn't exist
        print("Creating applications table...")
        Base.metadata.create_all(bind=engine, tables=[Application.__table__])
        print("✅ Applications table created")
        
        # Get some CVs
        cvs = db.query(CV).limit(20).all()
        if not cvs:
            print("❌ No CVs found in database")
            return
        
        print(f"✅ Found {len(cvs)} CVs")
        
        # Get some jobs
        jobs = db.query(CorporateJob).limit(10).all()
        if not jobs:
            print("❌ No jobs found in database")
            return
        
        print(f"✅ Found {len(jobs)} jobs")
        
        # Clear existing applications
        print("Clearing existing applications...")
        db.query(Application).delete()
        db.commit()
        
        # Create applications
        applications_created = 0
        statuses = [
            ApplicationStatus.NEW,
            ApplicationStatus.SCREENING,
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.OFFER,
            ApplicationStatus.HIRED,
            ApplicationStatus.REJECTED
        ]
        
        for cv in cvs:
            # Each CV applies to 2-4 random jobs
            num_applications = random.randint(2, 4)
            selected_jobs = random.sample(jobs, min(num_applications, len(jobs)))
            
            for job in selected_jobs:
                # Random status with weighted distribution (more new applications)
                status_weights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.1]
                status = random.choices(statuses, weights=status_weights)[0]
                
                # Random match score
                match_score = round(random.uniform(60, 95), 1)
                
                # Random applied date (last 30 days)
                days_ago = random.randint(1, 30)
                applied_at = datetime.utcnow() - timedelta(days=days_ago)
                
                # Create application
                application = Application(
                    cv_id=cv.cv_id,
                    job_id=job.job_id,
                    job_type='corporate',
                    status=status,
                    match_score=match_score,
                    cover_letter=f"I am very interested in the {job.title} position at {job.company}. I believe my skills and experience make me a great fit for this role.",
                    notes=None if status == ApplicationStatus.NEW else f"Reviewed by recruiter on {datetime.utcnow().strftime('%Y-%m-%d')}",
                    applied_at=applied_at,
                    updated_at=applied_at,
                    rating=random.randint(3, 5) if status in [ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER, ApplicationStatus.HIRED] else None
                )
                
                db.add(application)
                applications_created += 1
        
        db.commit()
        print(f"✅ Created {applications_created} applications")
        
        # Show stats
        print("\n📊 Application Statistics:")
        for status in statuses:
            count = db.query(Application).filter(Application.status == status).count()
            print(f"  {status.value.upper()}: {count}")
        
        print(f"\n✅ Total applications: {db.query(Application).count()}")
        print("✅ Applications seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding applications: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_applications()
