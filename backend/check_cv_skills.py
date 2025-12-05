"""
Check what database-related skills CVs actually have
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.cv import CV
from collections import Counter

def check_cv_skills():
    db = SessionLocal()
    
    try:
        print("🔍 ANALYZING CV SKILLS")
        print("=" * 60)
        
        # Get all CVs
        cvs = db.query(CV).all()
        
        # Collect all skills
        all_skills = []
        for cv in cvs:
            if cv.skills_technical:
                all_skills.extend([s.strip().lower() for s in cv.skills_technical.split(',')])
            if cv.skills_soft:
                all_skills.extend([s.strip().lower() for s in cv.skills_soft.split(',')])
        
        skill_counts = Counter(all_skills)
        
        print("\n📊 TOP 30 MOST COMMON CV SKILLS:")
        for skill, count in skill_counts.most_common(30):
            print(f"   {skill}: {count} CVs")
        
        # Search for database-related skills
        print("\n\n🔍 DATABASE-RELATED SKILLS:")
        db_skills = [s for s in skill_counts if any(term in s for term in ['sql', 'database', 'mysql', 'postgres', 'oracle', 'mongo'])]
        
        if db_skills:
            for skill in db_skills:
                print(f"   {skill}: {skill_counts[skill]} CVs")
        else:
            print("   ❌ No database skills found!")
        
        # Search for programming skills
        print("\n\n💻 PROGRAMMING SKILLS:")
        prog_skills = [s for s in skill_counts if any(term in s for term in ['python', 'java', 'javascript', 'c++', 'php', 'ruby'])]
        
        for skill in sorted(prog_skills, key=lambda x: skill_counts[x], reverse=True)[:10]:
            print(f"   {skill}: {skill_counts[skill]} CVs")
        
        # Check specific skills
        print("\n\n🎯 CHECKING SPECIFIC SKILLS:")
        specific_skills = ['sql server', 'mysql', 'postgresql', 'mongodb', 'oracle', 
                          'python', 'java', 'javascript', 'react', 'aws']
        
        for skill in specific_skills:
            count = skill_counts.get(skill, 0)
            if count > 0:
                print(f"   ✅ {skill}: {count} CVs")
            else:
                print(f"   ❌ {skill}: 0 CVs")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_cv_skills()
