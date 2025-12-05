"""
Synthetic Interaction Generator
Simulates realistic user behavior to generate training data for ML models

This creates:
1. user_job_interactions (views, applies, rejections)
2. match_feedback (helpful/not helpful ratings)
3. Match outcome patterns

Strategy:
- Uses deterministic rules to simulate rational job seeker behavior
- Adds noise/randomness to simulate human unpredictability
- Creates diverse user personas (rational, picky, desperate)
"""

import pandas as pd
import numpy as np
import json
import psycopg2
from datetime import datetime, timedelta
import random
import uuid

# ============================================================================
# CONFIGURATION
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',
    'user': 'postgres',
    'password': 'your_password'  # UPDATE THIS!
}

# Simulation parameters
NUM_USERS_TO_SIMULATE = 500  # Simulate 500 users
INTERACTIONS_PER_USER_MIN = 5
INTERACTIONS_PER_USER_MAX = 20

# User personas (behavioral archetypes)
USER_PERSONAS = {
    'rational': {
        'weight': 0.70,  # 70% of users
        'apply_threshold': 0.65,  # Apply if match score > 0.65
        'save_threshold': 0.55,   # Save if score > 0.55
        'rejection_threshold': 0.40,  # Reject if < 0.40
        'feedback_rate': 0.30,    # Leave feedback 30% of time
        'salary_sensitivity': 0.7  # How much salary matters
    },
    'picky': {
        'weight': 0.20,
        'apply_threshold': 0.80,  # Very selective
        'save_threshold': 0.70,
        'rejection_threshold': 0.60,
        'feedback_rate': 0.50,    # More likely to give feedback
        'salary_sensitivity': 0.9  # Salary very important
    },
    'desperate': {
        'weight': 0.10,
        'apply_threshold': 0.40,  # Apply to almost anything
        'save_threshold': 0.35,
        'rejection_threshold': 0.20,
        'feedback_rate': 0.15,    # Less likely to give feedback
        'salary_sensitivity': 0.3  # Less concerned about salary
    }
}

print("=" * 80)
print("SYNTHETIC INTERACTION GENERATOR")
print("=" * 80)

# ============================================================================
# LOAD DATA
# ============================================================================
print("\n[1/5] Loading CV and job data...")

try:
    cvs = pd.read_csv('../datasets/CVs.csv')
    corp_jobs = pd.read_csv('../datasets/Corp_jobs.csv')
    small_jobs = pd.read_csv('../datasets/Small_jobs.csv')
    
    print(f"  ✓ Loaded {len(cvs):,} CVs")
    print(f"  ✓ Loaded {len(corp_jobs):,} corp jobs")
    print(f"  ✓ Loaded {len(small_jobs):,} small jobs")
    
    # Add job_type column
    corp_jobs['job_type'] = 'corp_job'
    small_jobs['job_type'] = 'small_job'
    
    # Combine jobs
    all_jobs = pd.concat([
        corp_jobs[['job_id', 'title', 'category', 'required_skills', 'location_city', 
                   'salary_min_zmw', 'salary_max_zmw', 'required_experience_years', 'job_type']],
        small_jobs[['id', 'title', 'category', 'location', 'budget', 'job_type']].rename(
            columns={'id': 'job_id', 'location': 'location_city', 'budget': 'salary_min_zmw'}
        )
    ], ignore_index=True)
    
    print(f"  ✓ Combined: {len(all_jobs):,} total jobs")
    
except Exception as e:
    print(f"  ✗ Error loading data: {e}")
    exit(1)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_base_match_score(cv, job):
    """
    Calculate deterministic match score (simplified CAMSS)
    This simulates what the matching algorithm would return
    """
    score = 0.0
    
    # 1. Skills match (40%)
    if pd.notna(cv.get('skills_technical')) and pd.notna(job.get('required_skills')):
        cv_skills = set(str(cv['skills_technical']).lower().split(','))
        job_skills = set(str(job['required_skills']).lower().split(','))
        
        skill_overlap = len(cv_skills & job_skills)
        skill_score = skill_overlap / max(len(job_skills), 1)
        score += 0.40 * skill_score
    else:
        score += 0.40 * 0.3  # Low default if skills missing
    
    # 2. Location match (25%)
    if pd.notna(cv.get('city')) and pd.notna(job.get('location_city')):
        if str(cv['city']).lower() == str(job['location_city']).lower():
            score += 0.25 * 1.0
        elif str(cv.get('province', '')).lower() == str(job.get('location_province', '')).lower():
            score += 0.25 * 0.6
        else:
            score += 0.25 * 0.3
    else:
        score += 0.25 * 0.5
    
    # 3. Experience match (20%)
    if pd.notna(cv.get('total_years_experience')) and pd.notna(job.get('required_experience_years')):
        cv_exp = float(cv['total_years_experience'])
        req_exp = float(job['required_experience_years'])
        
        if cv_exp >= req_exp:
            score += 0.20 * 1.0
        elif cv_exp >= req_exp * 0.75:
            score += 0.20 * 0.7
        else:
            score += 0.20 * 0.4
    else:
        score += 0.20 * 0.5
    
    # 4. Category match (15%)
    if pd.notna(cv.get('current_job_title')) and pd.notna(job.get('category')):
        # Simple keyword match
        cv_title = str(cv['current_job_title']).lower()
        job_cat = str(job['category']).lower()
        
        if job_cat in cv_title or cv_title in job_cat:
            score += 0.15 * 0.8
        else:
            score += 0.15 * 0.3
    else:
        score += 0.15 * 0.5
    
    return min(score, 1.0)


def calculate_salary_factor(cv, job, persona):
    """
    Adjust score based on salary expectations vs offering
    """
    if job['job_type'] == 'small_job' or pd.isna(cv.get('salary_expectation_min')):
        return 1.0  # No adjustment
    
    try:
        cv_min = float(cv['salary_expectation_min'])
        job_max = float(job.get('salary_max_zmw', 0))
        
        if job_max >= cv_min:
            return 1.0  # Salary meets expectations
        elif job_max >= cv_min * 0.8:
            return 0.85  # Close enough
        else:
            # Salary too low - bigger penalty for picky users
            penalty = persona['salary_sensitivity']
            return max(0.3, 1.0 - penalty)
    except:
        return 1.0


def simulate_user_action(match_score, persona, cv, job):
    """
    Simulate what action a user would take given a match score and their persona
    Returns: (action, sub_scores, explanation)
    """
    
    # Adjust score for salary
    salary_factor = calculate_salary_factor(cv, job, persona)
    adjusted_score = match_score * salary_factor
    
    # Add random noise (humans are unpredictable)
    noise = np.random.normal(0, 0.05)  # ±5% randomness
    final_score = np.clip(adjusted_score + noise, 0, 1)
    
    # Sub-scores (for explainability)
    sub_scores = {
        'qualification': round(random.uniform(0.5, 0.9), 4),
        'experience': round(random.uniform(0.4, 0.95), 4),
        'skills': round(match_score * 0.9, 4),  # Skills drive main score
        'location': round(random.uniform(0.3, 1.0), 4),
        'category': round(random.uniform(0.4, 0.8), 4),
        'personalization': round(random.uniform(0.5, 0.7), 4)
    }
    
    # Determine action based on thresholds
    if final_score >= persona['apply_threshold']:
        action = 'applied'
        explanation = 'Good match - applied'
    elif final_score >= persona['save_threshold']:
        action = 'saved'
        explanation = 'Interesting - saved for later'
    elif final_score < persona['rejection_threshold']:
        action = 'rejected'
        explanation = 'Not a good fit'
    else:
        action = 'viewed'
        explanation = 'Reviewed but not interested'
    
    return action, sub_scores, final_score, explanation


def simulate_feedback(action, match_score, persona):
    """
    Simulate whether user gives feedback and if they find it helpful
    """
    # Decide if user gives feedback
    if random.random() > persona['feedback_rate']:
        return None  # No feedback
    
    # Determine if match was helpful
    if action == 'applied':
        helpful = True  # Applied = definitely helpful
        reason = 'good_match'
    elif action == 'saved':
        helpful = random.choice([True, True, False])  # Mostly helpful
        reason = 'interesting'
    elif action == 'rejected':
        helpful = False
        # Determine why rejected
        if match_score < 0.4:
            reason = random.choice(['skills_mismatch', 'experience_mismatch', 'category_mismatch'])
        else:
            reason = random.choice(['salary_too_low', 'location_issue', 'other'])
    else:  # viewed
        helpful = random.choice([True, False])
        reason = 'neutral'
    
    comment = None
    if random.random() < 0.1:  # 10% leave comments
        comments = {
            'good_match': 'This looks perfect for my skills!',
            'skills_mismatch': 'Required skills don\'t match my background',
            'salary_too_low': 'Salary is below my expectations',
            'location_issue': 'Location is too far from where I live',
            'interesting': 'Will consider this option'
        }
        comment = comments.get(reason, 'No specific feedback')
    
    return {
        'helpful': helpful,
        'reason': reason,
        'comment': comment
    }

# ============================================================================
# GENERATE SYNTHETIC INTERACTIONS
# ============================================================================
print(f"\n[2/5] Generating synthetic interactions for {NUM_USERS_TO_SIMULATE} users...")

# Assign personas to users
cv_sample = cvs.sample(n=min(NUM_USERS_TO_SIMULATE, len(cvs)), random_state=42)

interactions = []
feedbacks = []

for idx, cv in cv_sample.iterrows():
    # Assign persona
    persona_type = np.random.choice(
        list(USER_PERSONAS.keys()),
        p=[USER_PERSONAS[k]['weight'] for k in USER_PERSONAS.keys()]
    )
    persona = USER_PERSONAS[persona_type]
    
    # Number of jobs this user will interact with
    num_interactions = random.randint(INTERACTIONS_PER_USER_MIN, INTERACTIONS_PER_USER_MAX)
    
    # Sample jobs
    jobs_sample = all_jobs.sample(n=min(num_interactions, len(all_jobs)))
    
    # Generate session
    session_id = str(uuid.uuid4())
    base_time = datetime.now() - timedelta(days=random.randint(1, 90))
    
    for job_idx, job in jobs_sample.iterrows():
        # Calculate match score
        match_score = calculate_base_match_score(cv, job)
        
        # Simulate user action
        action, sub_scores, final_score, explanation = simulate_user_action(
            match_score, persona, cv, job
        )
        
        # Create interaction record
        interaction = {
            'user_id': cv['cv_id'],
            'job_id': job['job_id'],
            'job_type': job['job_type'],
            'action': action,
            'match_score': round(final_score, 4),
            'sub_scores': json.dumps(sub_scores),
            'source': random.choice(['recommendation', 'search', 'notification']),
            'session_id': session_id,
            'timestamp': base_time + timedelta(minutes=random.randint(0, 120)),
            'device_type': random.choice(['mobile', 'web', 'desktop']),
            'location': cv.get('city', 'Unknown'),
            'persona_type': persona_type  # For analysis (not stored in DB)
        }
        interactions.append(interaction)
        
        # Simulate feedback
        feedback_data = simulate_feedback(action, final_score, persona)
        if feedback_data:
            feedback = {
                'user_id': cv['cv_id'],
                'job_id': job['job_id'],
                'job_type': job['job_type'],
                'helpful': feedback_data['helpful'],
                'reason': feedback_data['reason'],
                'comment': feedback_data['comment'],
                'timestamp': interaction['timestamp'] + timedelta(minutes=random.randint(1, 30))
            }
            feedbacks.append(feedback)

print(f"  ✓ Generated {len(interactions):,} interactions")
print(f"  ✓ Generated {len(feedbacks):,} feedback records")

# ============================================================================
# ANALYZE SYNTHETIC DATA
# ============================================================================
print("\n[3/5] Analyzing synthetic data quality...")

interactions_df = pd.DataFrame(interactions)

print("\n  Action Distribution:")
action_counts = interactions_df['action'].value_counts()
for action, count in action_counts.items():
    pct = count / len(interactions_df) * 100
    print(f"    {action:15s}: {count:5,} ({pct:5.1f}%)")

print("\n  Persona Distribution:")
persona_counts = interactions_df['persona_type'].value_counts()
for persona, count in persona_counts.items():
    pct = count / len(interactions_df) * 100
    print(f"    {persona:15s}: {count:5,} ({pct:5.1f}%)")

print("\n  Match Score Statistics by Action:")
for action in ['applied', 'saved', 'viewed', 'rejected']:
    scores = interactions_df[interactions_df['action'] == action]['match_score']
    if len(scores) > 0:
        print(f"    {action:15s}: mean={scores.mean():.3f}, std={scores.std():.3f}")

print("\n  Feedback Statistics:")
if len(feedbacks) > 0:
    feedbacks_df = pd.DataFrame(feedbacks)
    helpful_rate = feedbacks_df['helpful'].mean() * 100
    print(f"    Helpful rate: {helpful_rate:.1f}%")
    print(f"    Top reasons:")
    for reason, count in feedbacks_df['reason'].value_counts().head(5).items():
        print(f"      {reason:20s}: {count:4,}")

# ============================================================================
# INSERT INTO DATABASE
# ============================================================================
print("\n[4/5] Inserting synthetic data into database...")

try:
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()
    
    # Insert interactions
    print("  Inserting interactions...")
    for interaction in interactions:
        cur.execute("""
            INSERT INTO matching_metadata.user_job_interactions
                (user_id, job_id, job_type, action, match_score, sub_scores,
                 source, session_id, timestamp, device_type, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            interaction['user_id'],
            interaction['job_id'],
            interaction['job_type'],
            interaction['action'],
            interaction['match_score'],
            interaction['sub_scores'],
            interaction['source'],
            interaction['session_id'],
            interaction['timestamp'],
            interaction['device_type'],
            interaction['location']
        ))
        interaction_id = cur.fetchone()[0]
        interaction['interaction_id'] = interaction_id
    
    print(f"    ✓ Inserted {len(interactions):,} interactions")
    
    # Insert feedback
    print("  Inserting feedback...")
    for feedback in feedbacks:
        # Find corresponding interaction_id
        matching_interaction = next(
            (i for i in interactions 
             if i['user_id'] == feedback['user_id'] 
             and i['job_id'] == feedback['job_id']),
            None
        )
        
        if matching_interaction:
            cur.execute("""
                INSERT INTO matching_metadata.match_feedback
                    (interaction_id, user_id, job_id, job_type, helpful, reason, comment, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                matching_interaction['interaction_id'],
                feedback['user_id'],
                feedback['job_id'],
                feedback['job_type'],
                feedback['helpful'],
                feedback['reason'],
                feedback['comment'],
                feedback['timestamp']
            ))
    
    print(f"    ✓ Inserted {len(feedbacks):,} feedback records")
    
    conn.commit()
    print("  ✓ Data committed to database")
    
except Exception as e:
    conn.rollback()
    print(f"  ✗ Database error: {e}")
    exit(1)
finally:
    cur.close()
    conn.close()

# ============================================================================
# VERIFICATION
# ============================================================================
print("\n[5/5] Verifying database contents...")

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM matching_metadata.user_job_interactions")
interaction_count = cur.fetchone()[0]
print(f"  ✓ Total interactions in DB: {interaction_count:,}")

cur.execute("SELECT COUNT(*) FROM matching_metadata.match_feedback")
feedback_count = cur.fetchone()[0]
print(f"  ✓ Total feedback in DB: {feedback_count:,}")

cur.execute("""
    SELECT action, COUNT(*), AVG(match_score)
    FROM matching_metadata.user_job_interactions
    GROUP BY action
    ORDER BY COUNT(*) DESC
""")
print("\n  Action breakdown in database:")
for row in cur.fetchall():
    print(f"    {row[0]:15s}: {row[1]:5,} (avg score: {row[2]:.3f})")

cur.close()
conn.close()

# ============================================================================
# EXPORT FOR ML TRAINING
# ============================================================================
print("\n[6/5] Exporting ML training data...")

# Export to CSV for easy ML training
interactions_df.to_csv('synthetic_interactions_training.csv', index=False)
print(f"  ✓ Exported to synthetic_interactions_training.csv")

if len(feedbacks) > 0:
    pd.DataFrame(feedbacks).to_csv('synthetic_feedback_training.csv', index=False)
    print(f"  ✓ Exported to synthetic_feedback_training.csv")

print("\n" + "=" * 80)
print("✓ SYNTHETIC DATA GENERATION COMPLETE!")
print("=" * 80)
print(f"\nGenerated:")
print(f"  • {len(interactions):,} user-job interactions")
print(f"  • {len(feedbacks):,} feedback records")
print(f"  • {len(cv_sample)} simulated users")
print(f"  • 3 behavioral personas (rational, picky, desperate)")
print(f"\nYou can now:")
print(f"  1. Train ML models on this synthetic data")
print(f"  2. Test different matching algorithms")
print(f"  3. Validate model performance")
print(f"  4. A/B test various approaches")
print("\n" + "=" * 80)
