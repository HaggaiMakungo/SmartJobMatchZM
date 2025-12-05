"""
Seed Brian Mwale's CV
Run this to add a complete CV for the test candidate user
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.cv import CV
from datetime import date
import json

def seed_brian_cv():
    """Create a comprehensive CV for Brian Mwale"""
    
    db = next(get_db())
    
    try:
        # Find Brian's user account
        brian = db.query(User).filter(User.email == "brian.mwale@example.com").first()
        
        if not brian:
            print("❌ Error: Brian Mwale user not found!")
            print("   Please run seed_test_users.py first")
            return False
        
        # Check if CV already exists
        existing_cv = db.query(CV).filter(CV.email == "brian.mwale@example.com").first()
        
        if existing_cv:
            print(f"⚠️  CV already exists with ID: {existing_cv.cv_id}")
            response = input("   Do you want to update it? (y/n): ")
            if response.lower() != 'y':
                print("   Skipping CV creation")
                return False
            
            # Update existing CV
            cv = existing_cv
            print(f"   Updating CV {cv.cv_id}...")
        else:
            # Create new CV
            cv = CV(cv_id=f"CV{brian.id:06d}")
            print(f"   Creating new CV {cv.cv_id}...")
        
        # Basic Information
        cv.full_name = "Brian Mwale"
        cv.email = "brian.mwale@example.com"
        cv.phone = "+260 977 123 456"
        cv.gender = "Male"
        cv.date_of_birth = date(1996, 3, 15)
        cv.nationality = "Zambian"
        cv.city = "Lusaka"
        cv.province = "Lusaka"
        
        # Education
        cv.education_level = "Bachelor's Degree"
        cv.institution = "University of Zambia (UNZA)"
        cv.graduation_year = 2019
        cv.major = "Computer Science and Information Technology"
        cv.certifications = "AWS Certified Developer Associate, Google Project Management Certificate"
        
        # Languages
        cv.languages = "English, Bemba, Nyanja"
        cv.language_proficiency = "English (Fluent), Bemba (Native), Nyanja (Conversational)"
        
        # Experience
        cv.total_years_experience = 4.5
        cv.current_job_title = "Software Developer"
        cv.employment_status = "Employed"
        
        # Job Preferences
        cv.preferred_job_type = "Full-time"
        cv.preferred_location = "Lusaka, Zambia"
        cv.salary_expectation_min = 8000.0
        cv.salary_expectation_max = 15000.0
        cv.availability = "2 weeks notice"
        
        # Skills
        cv.skills_technical = "Python, JavaScript, TypeScript, React, React Native, FastAPI, Django, PostgreSQL, MongoDB, Git, Docker, AWS, REST APIs, GraphQL, Node.js, Express, HTML, CSS, Tailwind CSS, Redux, SQLAlchemy, Pytest"
        
        cv.skills_soft = "Problem Solving, Communication, Teamwork, Leadership, Time Management, Adaptability, Critical Thinking, Project Management, Agile/Scrum, Client Relations, Mentoring"
        
        # Work Experience (JSON)
        cv.work_experience_json = [
            {
                "title": "Software Developer",
                "company": "Digital Innovations Ltd",
                "location": "Lusaka, Zambia",
                "duration": "January 2021 - Present",
                "description": "Full-stack development using Python, React, and PostgreSQL. Built RESTful APIs, designed database schemas, and developed responsive web applications. Led a team of 3 junior developers.",
                "responsibilities": [
                    "Developed and maintained 5+ web applications serving 10,000+ users",
                    "Designed and implemented RESTful APIs using FastAPI",
                    "Collaborated with UX designers to create user-friendly interfaces",
                    "Mentored junior developers and conducted code reviews",
                    "Implemented CI/CD pipelines using GitHub Actions"
                ],
                "technologies": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "title": "Junior Software Developer",
                "company": "TechZM Solutions",
                "location": "Lusaka, Zambia",
                "duration": "June 2019 - December 2020",
                "description": "Developed web applications using Django and React. Worked on e-commerce platforms and business management systems.",
                "responsibilities": [
                    "Built responsive user interfaces using React",
                    "Developed backend APIs using Django REST Framework",
                    "Wrote unit tests achieving 80% code coverage",
                    "Participated in agile sprint planning and retrospectives",
                    "Debugged and resolved production issues"
                ],
                "technologies": ["Python", "Django", "React", "MySQL", "Git"]
            },
            {
                "title": "Software Development Intern",
                "company": "Zamtel Corporation",
                "location": "Lusaka, Zambia",
                "duration": "January 2019 - May 2019",
                "description": "Internship focused on learning enterprise software development practices and contributing to internal tools.",
                "responsibilities": [
                    "Developed internal dashboard for customer service team",
                    "Assisted in database optimization projects",
                    "Wrote technical documentation",
                    "Participated in team meetings and brainstorming sessions"
                ],
                "technologies": ["JavaScript", "Node.js", "MongoDB", "Bootstrap"]
            }
        ]
        
        # Projects (JSON)
        cv.projects_json = [
            {
                "name": "SmartJobMatchZM",
                "description": "AI-powered job matching platform connecting job seekers with opportunities in Zambia",
                "role": "Lead Developer",
                "technologies": ["FastAPI", "React Native", "PostgreSQL", "AI/ML"],
                "url": "https://github.com/brianmwale/smartjobmatchzm",
                "highlights": [
                    "Implemented CAMSS 2.0 matching algorithm",
                    "Built RESTful API with 30+ endpoints",
                    "Developed mobile app using React Native and Expo",
                    "Integrated JWT authentication and role-based access control"
                ]
            },
            {
                "name": "E-Commerce Platform",
                "description": "Full-featured online shopping platform for local businesses",
                "role": "Full-Stack Developer",
                "technologies": ["Django", "React", "Stripe", "AWS"],
                "highlights": [
                    "Payment integration with Stripe and Mobile Money",
                    "Real-time inventory management system",
                    "Responsive design for mobile and desktop",
                    "Achieved 99.9% uptime in production"
                ]
            },
            {
                "name": "Attendance Management System",
                "description": "QR code-based attendance system for educational institutions",
                "role": "Backend Developer",
                "technologies": ["FastAPI", "PostgreSQL", "QR Codes"],
                "highlights": [
                    "Processed 5,000+ daily check-ins",
                    "Automated report generation",
                    "Admin dashboard for real-time monitoring"
                ]
            }
        ]
        
        # References (JSON)
        cv.references_json = [
            {
                "name": "Dr. Joseph Chanda",
                "position": "Senior Lecturer, Computer Science",
                "organization": "University of Zambia",
                "email": "j.chanda@unza.zm",
                "phone": "+260 966 111 222",
                "relationship": "Academic Supervisor"
            },
            {
                "name": "Sarah Banda",
                "position": "Technical Lead",
                "organization": "Digital Innovations Ltd",
                "email": "s.banda@digitalinnovations.co.zm",
                "phone": "+260 977 333 444",
                "relationship": "Current Manager"
            },
            {
                "name": "Michael Tembo",
                "position": "CTO",
                "organization": "TechZM Solutions",
                "email": "m.tembo@techzm.co.zm",
                "phone": "+260 955 555 666",
                "relationship": "Former Manager"
            }
        ]
        
        # Resume Quality Score (calculated based on completeness)
        cv.resume_quality_score = 95.0  # Excellent profile
        
        # Save to database
        if not existing_cv:
            db.add(cv)
        
        db.commit()
        
        print("\n✅ Success! Brian Mwale's CV has been created/updated")
        print(f"\n📋 CV Details:")
        print(f"   CV ID: {cv.cv_id}")
        print(f"   Name: {cv.full_name}")
        print(f"   Email: {cv.email}")
        print(f"   Location: {cv.city}, {cv.province}")
        print(f"   Education: {cv.education_level} in {cv.major}")
        print(f"   Experience: {cv.total_years_experience} years")
        print(f"   Current Role: {cv.current_job_title}")
        print(f"   Quality Score: {cv.resume_quality_score}%")
        print(f"\n🎯 Skills:")
        print(f"   Technical: {cv.skills_technical[:100]}...")
        print(f"   Soft: {cv.skills_soft[:100]}...")
        print(f"\n💼 Work Experience: {len(cv.work_experience_json)} positions")
        print(f"🚀 Projects: {len(cv.projects_json)} projects")
        print(f"👥 References: {len(cv.references_json)} references")
        
        print("\n✨ Brian can now:")
        print("   ✅ See AI-matched jobs")
        print("   ✅ Get personalized job recommendations")
        print("   ✅ Apply to jobs with his profile")
        print("   ✅ Be matched by employers")
        
        print("\n🎉 Ready to test! Login as brian.mwale@example.com")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        return False
    
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  SEEDING BRIAN MWALE'S CV")
    print("=" * 60)
    print()
    
    success = seed_brian_cv()
    
    if success:
        print("\n" + "=" * 60)
        print("  SEED COMPLETE - RESTART YOUR BACKEND")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Restart your backend server")
        print("2. Login to the app as brian.mwale@example.com")
        print("3. You should now see AI-matched jobs! 🎉")
    else:
        print("\n" + "=" * 60)
        print("  SEED FAILED - CHECK ERRORS ABOVE")
        print("=" * 60)
