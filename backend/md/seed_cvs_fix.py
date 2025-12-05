"""
Fixed seed_cvs function with duplicate handling
Replace the seed_cvs function in seed_database.py with this version
"""

def seed_cvs(session):
    """Load CV data with duplicate email handling"""
    print("\n[2/7] Seeding CVs...")
    try:
        df = load_csv_with_encoding(CVS_CSV)
        
        records_added = 0
        records_skipped = 0
        
        for idx, row in df.iterrows():
            try:
                cv = CV(
                    cv_id=str(row['cv_id']),
                    full_name=row['full_name'],
                    phone=row.get('phone'),
                    email=row['email'],
                    gender=row.get('gender'),
                    date_of_birth=safe_parse_date(row.get('date_of_birth')),
                    nationality=row.get('nationality'),
                    city=row.get('city'),
                    province=row.get('province'),
                    education_level=row.get('education_level'),
                    institution=row.get('institution'),
                    graduation_year=int(row['graduation_year']) if pd.notna(row.get('graduation_year')) else None,
                    major=row.get('major'),
                    certifications=row.get('certifications'),
                    languages=row.get('languages'),
                    language_proficiency=row.get('language_proficiency'),
                    total_years_experience=float(row['total_years_experience']) if pd.notna(row.get('total_years_experience')) else 0,
                    current_job_title=row.get('current_job_title'),
                    employment_status=row.get('employment_status'),
                    preferred_job_type=row.get('preferred_job_type'),
                    preferred_location=row.get('preferred_location'),
                    salary_expectation_min=float(row['salary_expectation_min']) if pd.notna(row.get('salary_expectation_min')) else None,
                    salary_expectation_max=float(row['salary_expectation_max']) if pd.notna(row.get('salary_expectation_max')) else None,
                    availability=row.get('availability'),
                    skills_technical=row.get('skills_technical'),
                    skills_soft=row.get('skills_soft'),
                    work_experience_json=json.loads(row['work_experience_json']) if pd.notna(row.get('work_experience_json')) and row['work_experience_json'] != '[]' else None,
                    projects_json=json.loads(row['projects_json']) if pd.notna(row.get('projects_json')) and row['projects_json'] != '[]' else None,
                    references_json=json.loads(row['references_json']) if pd.notna(row.get('references_json')) and row['references_json'] != '[]' else None,
                    resume_quality_score=float(row['resume_quality_score']) if pd.notna(row.get('resume_quality_score')) else None
                )
                session.add(cv)
                records_added += 1
                
                # Commit every 100 records (smaller batches for better duplicate handling)
                if records_added % 100 == 0:
                    try:
                        session.commit()
                        print(f"  Committed {records_added} CVs...")
                    except Exception as commit_error:
                        session.rollback()
                        if 'duplicate key' in str(commit_error).lower() or 'unique constraint' in str(commit_error).lower():
                            records_skipped += 1
                        else:
                            raise
                            
            except Exception as row_error:
                # Skip individual problematic records (duplicates)
                if 'duplicate key' in str(row_error).lower() or 'unique constraint' in str(row_error).lower():
                    records_skipped += 1
                    session.rollback()
                    continue
                else:
                    print(f"  Error at row {idx} ({row.get('email', 'unknown')}): {row_error}")
                    session.rollback()
                    continue  # Skip this record and continue
        
        # Final commit for any remaining records
        try:
            session.commit()
        except Exception as e:
            session.rollback()
            if 'duplicate key' not in str(e).lower():
                print(f"  Warning: Final commit issue: {e}")
        
        if records_skipped > 0:
            print(f"✓ Seeded {records_added} CVs ({records_skipped} duplicates skipped)")
        else:
            print(f"✓ Seeded {records_added} CVs")
            
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding CVs: {e}")
        raise
