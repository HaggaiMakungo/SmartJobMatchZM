# Datasets Directory

This directory contains job datasets used for development and testing.

## Files

### Corporate Jobs
- **Corp_jobs.csv**: 25 corporate sector jobs in Zambia
  - Formal sector positions
  - Includes: titles, descriptions, requirements, locations, salaries
  - Used for testing white/grey collar matching

### Personal Jobs
- **Personal_jobs.csv**: Gig and personal job opportunities
  - Informal sector positions
  - Blue/pink/green collar jobs
  - Used for testing gig economy matching

## Data Structure

### Corporate Jobs Schema
```
- job_id
- title
- company
- description
- requirements
- location
- salary_range
- collar_type
- category
- posted_date
```

### Personal Jobs Schema
```
- job_id
- title
- poster
- description
- skills_required
- location
- pay_rate
- collar_type
- category
- posted_date
```

## Usage

These datasets are:
1. **Loaded into PostgreSQL** during initial setup
2. **Used for matching algorithm testing**
3. **Referenced in unit tests**
4. **Not tracked in Git** (see .gitignore if files are large)

## Adding New Data

To add more jobs:
1. Follow the same CSV structure
2. Ensure all required fields are present
3. Validate data format before importing
4. Run data validation script (coming soon)

## Data Privacy

- No real personal data in these files
- Test/sample data only
- Real production data stored in database only

## Test Users

Test user profile for matching:
- **Name**: Brian Mwale
- **Category**: Marketing
- **Experience**: 6+ years
- **Skills**: Marketing, Digital Marketing, Social Media
- **Location**: Lusaka
- **Expected Matches**: Marketing Manager, Digital Marketing roles

## Notes

- Datasets are in CSV format for easy editing
- Use UTF-8 encoding
- Keep backups before making changes
- Validate data before database import
