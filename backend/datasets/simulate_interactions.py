import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from pathlib import Path
import random
from typing import Dict, List, Tuple

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# ============================================================================
# CONFIGURATION - Adjust these parameters to tune simulation behavior
# ============================================================================

CONFIG = {
    'num_interactions': 7500,
    'application_rate': 0.35,  # 35% of qualified views convert (aggressive Zambian market)
    'save_rate': 0.22,  # 22% of views result in saves
    
    # Matching weights (must sum to ~1.0)
    'location_weight': 0.35,
    'salary_weight': 0.30,
    'skills_weight': 0.25,
    'experience_weight': 0.10,
    
    # Time simulation
    'time_range_days': 90,  # Spread over 3 months
    
    # User behavior profiles (adjusted for Zambian market - higher unemployment)
    'desperate_users_pct': 0.15,  # 15% apply to everything (was 5%)
    'selective_users_pct': 0.15,  # 15% very picky (was 20%)
    'moderate_users_pct': 0.70,   # 70% normal behavior (was 75%)
    
    # Job type preferences
    'corp_job_preference': 0.70,  # 70% prefer corp jobs
    
    # Zambian market specifics
    'remote_work_adoption': 0.30,  # 30% open to remote
    'government_preference': 1.15,  # 15% boost for gov jobs
    'mining_sector_boost': 1.25,   # 25% boost for mining (Copperbelt)
}

# ============================================================================
# ZAMBIAN LOCATION DATA
# ============================================================================

ZAMBIAN_CITIES = {
    'Lusaka': {'province': 'Lusaka Province', 'tier': 1},
    'Kitwe': {'province': 'Copperbelt Province', 'tier': 2},
    'Ndola': {'province': 'Copperbelt Province', 'tier': 2},
    'Kabwe': {'province': 'Central Province', 'tier': 3},
    'Chingola': {'province': 'Copperbelt Province', 'tier': 3},
    'Mufulira': {'province': 'Copperbelt Province', 'tier': 3},
    'Livingstone': {'province': 'Southern Province', 'tier': 3},
    'Luanshya': {'province': 'Copperbelt Province', 'tier': 3},
    'Kasama': {'province': 'Northern Province', 'tier': 4},
    'Chipata': {'province': 'Eastern Province', 'tier': 4},
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def normalize_skills(skills_str: str) -> set:
    """Convert comma-separated skills string to normalized set."""
    if pd.isna(skills_str) or skills_str == '':
        return set()
    return set([s.strip().lower() for s in str(skills_str).split(',')])

def calculate_location_score(cv_city: str, cv_province: str, 
                             job_city: str, job_province: str,
                             is_remote: bool = False) -> float:
    """
    Calculate location match score (0.0 to 1.0)
    
    Zambian context:
    - Same city = perfect match (1.0)
    - Same province = good match (0.7)
    - Different province = poor match (0.3)
    - Remote = very good (0.9) if candidate is open to remote
    """
    if is_remote:
        return 0.9 if random.random() < CONFIG['remote_work_adoption'] else 0.5
    
    if pd.isna(cv_city) or pd.isna(job_city):
        return 0.5
    
    cv_city = str(cv_city).strip()
    job_city = str(job_city).strip()
    cv_province = str(cv_province).strip()
    job_province = str(job_province).strip()
    
    # Same city - perfect match
    if cv_city.lower() == job_city.lower():
        return 1.0
    
    # Same province - good match (commutable)
    if cv_province.lower() == job_province.lower():
        return 0.7
    
    # Both in Copperbelt (mining region) - moderate match
    if 'copperbelt' in cv_province.lower() and 'copperbelt' in job_province.lower():
        return 0.6
    
    # Different province - poor match
    return 0.3

def calculate_salary_score(cv_min: float, cv_max: float,
                           job_min: float, job_max: float) -> float:
    """
    Calculate salary alignment score (0.0 to 1.0)
    
    Logic:
    - Job salary within CV expectation = 1.0
    - Job salary above expectation = 0.9 (bonus!)
    - Job salary below by 20% = 0.5
    - Job salary below by 50%+ = 0.1
    """
    try:
        cv_min = float(cv_min) if not pd.isna(cv_min) else 0
        cv_max = float(cv_max) if not pd.isna(cv_max) else 999999
        job_min = float(job_min) if not pd.isna(job_min) else 0
        job_max = float(job_max) if not pd.isna(job_max) else 999999
        
        # Job max within CV range
        if cv_min <= job_max <= cv_max:
            return 1.0
        
        # Job offers more than expected
        if job_max > cv_max:
            return 0.95
        
        # Job offers less - calculate penalty
        if job_max < cv_min:
            shortfall = (cv_min - job_max) / cv_min
            if shortfall < 0.2:  # Less than 20% below
                return 0.6
            elif shortfall < 0.4:  # 20-40% below
                return 0.3
            else:  # More than 40% below
                return 0.1
        
        return 0.5  # Default moderate match
        
    except (ValueError, TypeError):
        return 0.5  # If salary data is missing/invalid

def calculate_skills_score(cv_technical: str, cv_soft: str,
                          job_required: str, job_preferred: str) -> float:
    """
    Calculate skills overlap score (0.0 to 1.0)
    
    Considers both technical and soft skills.
    Required skills are weighted more heavily than preferred.
    """
    cv_tech = normalize_skills(cv_technical)
    cv_soft = normalize_skills(cv_soft)
    job_req = normalize_skills(job_required)
    job_pref = normalize_skills(job_preferred)
    
    all_cv_skills = cv_tech.union(cv_soft)
    all_job_skills = job_req.union(job_pref)
    
    if len(all_job_skills) == 0:
        return 0.5  # No requirements specified
    
    # Required skills match (70% weight)
    if len(job_req) > 0:
        required_match = len(cv_tech.intersection(job_req)) / len(job_req)
    else:
        required_match = 1.0
    
    # Preferred skills match (30% weight)
    if len(job_pref) > 0:
        preferred_match = len(all_cv_skills.intersection(job_pref)) / len(job_pref)
    else:
        preferred_match = 0.5
    
    final_score = (required_match * 0.7) + (preferred_match * 0.3)
    
    return min(1.0, final_score)

def calculate_experience_score(cv_years: float, job_required: str) -> float:
    """
    Calculate experience match score (0.0 to 1.0)
    
    Logic:
    - Meets requirement exactly = 1.0
    - Under-qualified by 1-2 years = 0.6
    - Under-qualified by 3+ years = 0.3
    - Over-qualified by 5+ years = 0.7 (overqualification penalty)
    """
    try:
        cv_years = float(cv_years) if not pd.isna(cv_years) else 0
        
        # Parse job requirement (e.g., "3-5 years", "5+ years")
        if pd.isna(job_required):
            return 0.8  # No requirement = good match
        
        job_req_str = str(job_required).lower()
        
        # Extract minimum years required
        if '+' in job_req_str:
            min_required = float(job_req_str.split('+')[0].strip())
        elif '-' in job_req_str:
            min_required = float(job_req_str.split('-')[0].strip())
        else:
            # Try to extract first number
            import re
            numbers = re.findall(r'\d+', job_req_str)
            min_required = float(numbers[0]) if numbers else 0
        
        # Calculate match
        if cv_years >= min_required:
            # Check for overqualification
            if cv_years > min_required + 5:
                return 0.7  # Overqualified
            return 1.0  # Perfect match
        else:
            # Under-qualified
            gap = min_required - cv_years
            if gap <= 2:
                return 0.6
            elif gap <= 4:
                return 0.4
            else:
                return 0.2
    
    except (ValueError, TypeError):
        return 0.5

def get_employment_multiplier(status: str) -> float:
    """
    Get application likelihood multiplier based on employment status.
    
    Zambian context:
    - Unemployed = desperate (2x more likely to apply)
    - Seeking = active (1.5x)
    - Employed = selective (1x)
    - Self-employed = cautious (0.8x)
    """
    status = str(status).lower()
    
    if 'unemployed' in status or 'seeking' in status:
        return 1.8
    elif 'self-employed' in status:
        return 0.9
    elif 'employed' in status:
        return 1.0
    else:
        return 1.2

def apply_zambian_context_boost(job_data: Dict, cv_data: Dict) -> float:
    """
    Apply Zambian job market specific boosts.
    
    - Mining jobs in Copperbelt = 25% boost
    - Government/parastatal = 15% boost
    - Finance/Banking in Lusaka = 10% boost
    """
    boost = 1.0
    
    # Mining sector boost (Copperbelt)
    if 'copperbelt' in str(job_data.get('location_province', '')).lower():
        if any(word in str(job_data.get('required_skills', '')).lower() 
               for word in ['mining', 'geology', 'metallurgy', 'extraction']):
            boost *= CONFIG['mining_sector_boost']
    
    # Government preference (across Zambia)
    if any(word in str(job_data.get('company_name', '')).lower() 
           for word in ['government', 'ministry', 'ministry', 'public service']):
        boost *= CONFIG['government_preference']
    
    return boost

def calculate_match_score(cv: Dict, job: Dict, job_type: str) -> Tuple[float, Dict]:
    """
    Calculate overall match score and sub-scores.
    
    Returns:
        (overall_score, sub_scores_dict)
    """
    # Calculate individual component scores
    location_score = calculate_location_score(
        cv.get('city'), cv.get('province'),
        job.get('location_city'), job.get('location_province'),
        is_remote=('remote' in str(job.get('location_city', '')).lower())
    )
    
    if job_type == 'corp':
        salary_score = calculate_salary_score(
            cv.get('salary_expectation_min'), cv.get('salary_expectation_max'),
            job.get('salary_min_zmw'), job.get('salary_max_zmw')
        )
    else:  # small job
        # For gig jobs, compare budget to expected salary
        salary_score = calculate_salary_score(
            cv.get('salary_expectation_min'), cv.get('salary_expectation_max'),
            job.get('budget', 0), job.get('budget', 0)
        )
    
    skills_score = calculate_skills_score(
        cv.get('skills_technical'), cv.get('skills_soft'),
        job.get('required_skills'), job.get('preferred_skills', '')
    )
    
    experience_score = calculate_experience_score(
        cv.get('total_years_experience'), 
        job.get('experience_required', '') if job_type == 'corp' else None
    )
    
    # Weighted combination
    overall_score = (
        location_score * CONFIG['location_weight'] +
        salary_score * CONFIG['salary_weight'] +
        skills_score * CONFIG['skills_weight'] +
        experience_score * CONFIG['experience_weight']
    )
    
    # Apply Zambian context boost
    context_boost = apply_zambian_context_boost(job, cv)
    overall_score = min(1.0, overall_score * context_boost)
    
    sub_scores = {
        'location_score': round(location_score, 3),
        'salary_score': round(salary_score, 3),
        'skills_score': round(skills_score, 3),
        'experience_score': round(experience_score, 3),
        'context_boost': round(context_boost, 3)
    }
    
    return overall_score, sub_scores

def determine_action(match_score: float, employment_status: str, 
                     user_profile: str) -> str:
    """
    Determine user action based on match score and user characteristics.
    
    Returns: 'applied', 'saved', 'viewed', or 'rejected'
    """
    # Get employment multiplier
    emp_multiplier = get_employment_multiplier(employment_status)
    
    # Adjust thresholds based on user profile
    # NOTE: Lowered thresholds to reflect Zambian job market reality
    # High unemployment means users are MUCH less selective
    if user_profile == 'desperate':
        apply_threshold = 0.30  # Was 0.35 - apply to almost anything
        save_threshold = 0.22   # Was 0.25
        view_threshold = 0.12   # Was 0.15
    elif user_profile == 'selective':
        apply_threshold = 0.65  # Was 0.70
        save_threshold = 0.55   # Was 0.60
        view_threshold = 0.45   # Was 0.50
    else:  # moderate
        apply_threshold = 0.48  # Was 0.55 - apply to anything "okay"
        save_threshold = 0.35   # Was 0.40
        view_threshold = 0.25   # Was 0.30
    
    # Apply employment multiplier (lowers thresholds for desperate job seekers)
    adjusted_score = match_score * emp_multiplier
    
    # Add randomness (humans are irrational!)
    noise = np.random.normal(0, 0.1)  # ±10% noise
    final_score = adjusted_score + noise
    
    # Determine action
    if final_score >= apply_threshold and random.random() < CONFIG['application_rate']:
        return 'applied'
    elif final_score >= save_threshold and random.random() < CONFIG['save_rate']:
        return 'saved'
    elif final_score >= view_threshold:
        return 'viewed'
    else:
        return 'rejected'

def generate_timestamp(days_ago_range: int) -> str:
    """Generate realistic timestamp within the past N days."""
    days_ago = random.randint(0, days_ago_range)
    
    # Weight towards recent dates (exponential decay)
    if random.random() < 0.3:  # 30% in last 10 days
        days_ago = random.randint(0, 10)
    
    # Weekday bias and time-of-day patterns
    base_time = datetime.now() - timedelta(days=days_ago)
    
    # Avoid weekends slightly (20% less traffic)
    while base_time.weekday() >= 5 and random.random() < 0.2:
        days_ago += 1
        base_time = datetime.now() - timedelta(days=days_ago)
    
    # Peak hours: 6pm-9pm (18:00-21:00)
    if random.random() < 0.4:  # 40% during peak
        hour = random.randint(18, 21)
    else:
        hour = random.randint(6, 23)  # Normal waking hours
    
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    
    return base_time.replace(hour=hour, minute=minute, second=second).isoformat()

def assign_user_profile(employment_status: str) -> str:
    """Assign user behavior profile based on employment status."""
    status = str(employment_status).lower()
    
    if 'unemployed' in status:
        # Unemployed users are more likely to be desperate
        return np.random.choice(
            ['desperate', 'moderate', 'selective'],
            p=[0.3, 0.6, 0.1]
        )
    elif 'employed' in status:
        # Employed users are more selective
        return np.random.choice(
            ['desperate', 'moderate', 'selective'],
            p=[0.02, 0.48, 0.5]
        )
    else:
        # Default distribution
        return np.random.choice(
            ['desperate', 'moderate', 'selective'],
            p=[0.05, 0.75, 0.2]
        )

# ============================================================================
# MAIN SIMULATION LOGIC
# ============================================================================

def simulate_interactions(cvs_df: pd.DataFrame, 
                         corp_jobs_df: pd.DataFrame,
                         small_jobs_df: pd.DataFrame,
                         num_interactions: int) -> List[Dict]:
    """
    Generate synthetic user-job interactions.
    
    Returns list of interaction dictionaries.
    """
    interactions = []
    session_counter = 1000
    
    print(f"🎯 Starting simulation for {num_interactions} interactions...")
    print(f"📊 Available: {len(cvs_df)} CVs, {len(corp_jobs_df)} Corp Jobs, {len(small_jobs_df)} Small Jobs")
    
    # Assign user profiles to all CVs
    cv_profiles = {}
    for _, cv in cvs_df.iterrows():
        cv_profiles[cv['cv_id']] = assign_user_profile(cv.get('employment_status', ''))
    
    # Track interactions per user to ensure realistic distribution
    user_interaction_counts = {cv_id: 0 for cv_id in cvs_df['cv_id']}
    max_interactions_per_user = 25  # Realistic cap
    
    attempts = 0
    max_attempts = num_interactions * 3  # Prevent infinite loops
    
    while len(interactions) < num_interactions and attempts < max_attempts:
        attempts += 1
        
        # Select random CV (weighted by how many interactions they already have)
        available_users = [uid for uid, count in user_interaction_counts.items() 
                          if count < max_interactions_per_user]
        if not available_users:
            print("⚠️ All users reached max interactions. Resetting counts...")
            user_interaction_counts = {cv_id: 0 for cv_id in cvs_df['cv_id']}
            available_users = list(user_interaction_counts.keys())
        
        cv_id = random.choice(available_users)
        cv = cvs_df[cvs_df['cv_id'] == cv_id].iloc[0].to_dict()
        user_profile = cv_profiles[cv_id]
        
        # Decide corp vs small job (70/30 split)
        if random.random() < CONFIG['corp_job_preference'] and len(corp_jobs_df) > 0:
            job = corp_jobs_df.sample(1).iloc[0].to_dict()
            job_id = job['job_id']
            job_type = 'corp'
        elif len(small_jobs_df) > 0:
            job = small_jobs_df.sample(1).iloc[0].to_dict()
            job_id = job['id']
            job_type = 'small'
        else:
            continue  # No jobs available
        
        # Calculate match score
        match_score, sub_scores = calculate_match_score(cv, job, job_type)
        
        # Determine action
        action = determine_action(
            match_score, 
            cv.get('employment_status', ''), 
            user_profile
        )
        
        # Skip if rejected (don't record non-interactions)
        if action == 'rejected':
            continue
        
        # Generate session_id (users view multiple jobs per session)
        if random.random() < 0.3:  # 30% chance of new session
            session_counter += 1
        
        # Create interaction record
        interaction = {
            'user_id': str(cv_id),  # Keep as string to handle both formats
            'job_id': str(job_id),  # Keep as string to handle formats like 'JOB000445'
            'job_type': job_type,
            'action': action,
            'match_score': round(match_score, 3),
            'sub_scores': sub_scores,
            'timestamp': generate_timestamp(CONFIG['time_range_days']),
            'source': 'simulated',
            'session_id': f"sim_session_{session_counter}",
            'user_profile': user_profile
        }
        
        interactions.append(interaction)
        user_interaction_counts[cv_id] += 1
        
        # Progress indicator
        if len(interactions) % 500 == 0:
            print(f"✅ Generated {len(interactions)}/{num_interactions} interactions...")
    
    print(f"🎉 Simulation complete! Generated {len(interactions)} interactions in {attempts} attempts.")
    
    return interactions

def generate_match_feedback(interactions: List[Dict]) -> List[Dict]:
    """
    Generate match feedback based on user actions.
    
    Logic:
    - Applied → 90% helpful
    - Saved → 70% helpful  
    - Viewed → 40% helpful
    """
    feedback_records = []
    
    print("📝 Generating match feedback...")
    
    for interaction in interactions:
        action = interaction['action']
        match_score = interaction['match_score']
        
        # Determine if match was helpful
        if action == 'applied':
            helpful = random.random() < 0.90
        elif action == 'saved':
            helpful = random.random() < 0.70
        elif action == 'viewed':
            helpful = random.random() < 0.40
        else:
            continue  # No feedback for rejected
        
        # Generate feedback reason if not helpful
        feedback_reason = None
        if not helpful:
            reasons = [
                ('skills_mismatch', 0.30),
                ('salary_too_low', 0.25),
                ('location_issue', 0.20),
                ('overqualified', 0.10),
                ('company_reputation', 0.05),
                (None, 0.10)  # No reason given
            ]
            feedback_reason = np.random.choice(
                [r[0] for r in reasons],
                p=[r[1] for r in reasons]
            )
        
        feedback = {
            'user_id': interaction['user_id'],
            'job_id': interaction['job_id'],
            'job_type': interaction['job_type'],
            'match_score': interaction['match_score'],
            'helpful': helpful,
            'feedback_reason': feedback_reason,
            'timestamp': interaction['timestamp']
        }
        
        feedback_records.append(feedback)
    
    print(f"✅ Generated {len(feedback_records)} feedback records")
    
    return feedback_records

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function."""
    print("=" * 70)
    print("CAMSS 2.0 - Synthetic Interaction Data Simulator")
    print("=" * 70)
    print()
    
    # Define file paths
    base_path = Path(r"C:\Dev\ai-job-matchingV2\backend\datasets")
    
    cvs_path = base_path / "CVs.csv"
    corp_jobs_path = base_path / "Corp_jobs.csv"
    small_jobs_path = base_path / "Small_jobs.csv"
    output_path = base_path / "synthetic_interactions.json"
    
    # Load datasets
    print("📂 Loading datasets...")
    try:
        cvs_df = pd.read_csv(cvs_path)
        corp_jobs_df = pd.read_csv(corp_jobs_path)
        small_jobs_df = pd.read_csv(small_jobs_path)
        print(f"✅ Loaded {len(cvs_df)} CVs")
        print(f"✅ Loaded {len(corp_jobs_df)} Corp Jobs")
        print(f"✅ Loaded {len(small_jobs_df)} Small Jobs")
    except FileNotFoundError as e:
        print(f"❌ Error: Could not find file - {e}")
        return
    except Exception as e:
        print(f"❌ Error loading datasets: {e}")
        return
    
    print()
    
    # Generate interactions
    interactions = simulate_interactions(
        cvs_df, corp_jobs_df, small_jobs_df,
        CONFIG['num_interactions']
    )
    
    print()
    
    # Generate feedback
    feedback = generate_match_feedback(interactions)
    
    print()
    
    # Combine into output
    output_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'num_interactions': len(interactions),
            'num_feedback': len(feedback),
            'config': CONFIG,
            'source': 'synthetic_simulation'
        },
        'interactions': interactions,
        'feedback': feedback
    }
    
    # Save to JSON
    print(f"💾 Saving to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("✅ File saved successfully!")
    print()
    
    # Print statistics
    print("=" * 70)
    print("📊 SIMULATION STATISTICS")
    print("=" * 70)
    
    # Action distribution
    action_counts = {}
    for interaction in interactions:
        action = interaction['action']
        action_counts[action] = action_counts.get(action, 0) + 1
    
    print("\n🎬 Action Distribution:")
    for action, count in sorted(action_counts.items()):
        pct = (count / len(interactions)) * 100
        print(f"  {action:12s}: {count:5d} ({pct:5.1f}%)")
    
    # Match score statistics
    scores = [i['match_score'] for i in interactions]
    print(f"\n🎯 Match Score Statistics:")
    print(f"  Average: {np.mean(scores):.3f}")
    print(f"  Median:  {np.median(scores):.3f}")
    print(f"  Std Dev: {np.std(scores):.3f}")
    print(f"  Min:     {np.min(scores):.3f}")
    print(f"  Max:     {np.max(scores):.3f}")
    
    # Applications by score
    applied = [i for i in interactions if i['action'] == 'applied']
    if applied:
        applied_scores = [i['match_score'] for i in applied]
        print(f"\n📋 Applied Jobs - Average Score: {np.mean(applied_scores):.3f}")
    
    # Feedback statistics
    helpful_count = sum(1 for f in feedback if f['helpful'])
    helpful_pct = (helpful_count / len(feedback)) * 100 if feedback else 0
    print(f"\n👍 Feedback Statistics:")
    print(f"  Helpful: {helpful_count}/{len(feedback)} ({helpful_pct:.1f}%)")
    
    # Job type distribution
    corp_count = sum(1 for i in interactions if i['job_type'] == 'corp')
    small_count = sum(1 for i in interactions if i['job_type'] == 'small')
    print(f"\n💼 Job Type Distribution:")
    print(f"  Corp:  {corp_count} ({(corp_count/len(interactions)*100):.1f}%)")
    print(f"  Small: {small_count} ({(small_count/len(interactions)*100):.1f}%)")
    
    print()
    print("=" * 70)
    print("✨ Simulation Complete! Ready for database seeding.")
    print("=" * 70)

if __name__ == "__main__":
    main()