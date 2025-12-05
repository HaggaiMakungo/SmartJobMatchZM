"""
CAMSS 2.0 - Database Seeding Script for Synthetic Interactions
==============================================================
Loads synthetic interaction data into PostgreSQL database.

Tables populated:
- matching_metadata.user_job_interactions
- matching_metadata.match_feedback
"""

import json
import psycopg2
from psycopg2.extras import execute_batch
from pathlib import Path
from datetime import datetime
from typing import List, Dict
import sys
import uuid

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',
    'user': 'postgres',
    'password': 'Winter123',
    'port': 5432
}

# ============================================================================
# DATABASE CONNECTION
# ============================================================================

def get_connection():
    """Create database connection with error handling."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print(f"   Please check:")
        print(f"   - PostgreSQL is running")
        print(f"   - Database '{DB_CONFIG['database']}' exists")
        print(f"   - User '{DB_CONFIG['user']}' has access")
        print(f"   - Password is correct")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error connecting to database: {e}")
        sys.exit(1)

# ============================================================================
# TABLE VERIFICATION
# ============================================================================

def verify_tables(conn):
    """Verify that required tables exist."""
    print("🔍 Verifying database tables...")
    
    tables_to_check = [
        'user_job_interactions',  # In public schema, not matching_metadata
        'match_feedback'
    ]
    
    cursor = conn.cursor()
    
    for table_name in tables_to_check:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = %s
            );
        """, (table_name,))
        
        exists = cursor.fetchone()[0]
        
        if exists:
            print(f"  ✅ {table_name} exists")
        else:
            print(f"  ❌ {table_name} does NOT exist!")
            cursor.close()
            return False
    
    cursor.close()
    return True

# ============================================================================
# DATA INSERTION
# ============================================================================

def clear_existing_data(conn, clear_all: bool = False):
    """
    Clear existing synthetic data or all data from tables.
    
    Args:
        conn: Database connection
        clear_all: If True, clears ALL data. If False, only clears synthetic data.
    """
    cursor = conn.cursor()
    
    try:
        if clear_all:
            print("🗑️  Clearing ALL existing data...")
            cursor.execute("DELETE FROM match_feedback;")
            cursor.execute("DELETE FROM user_job_interactions;")
        else:
            print("🗑️  Clearing existing synthetic data...")
            cursor.execute("""
                DELETE FROM match_feedback 
                WHERE user_id IN (
                    SELECT user_id FROM user_job_interactions 
                    WHERE source = 'simulated'
                );
            """)
            cursor.execute("""
                DELETE FROM user_job_interactions 
                WHERE source = 'simulated';
            """)
        
        deleted_feedback = cursor.rowcount
        conn.commit()
        print(f"  ✅ Cleared existing data")
        
    except Exception as e:
        conn.rollback()
        print(f"  ⚠️  Warning: Could not clear existing data: {e}")
    finally:
        cursor.close()

def insert_interactions(conn, interactions: List[Dict]) -> int:
    """
    Insert user_job_interactions into database.
    Matches the actual schema: event_id, timestamp, user_id, job_id, job_type,
    match_score, sub_scores (JSONB), action, source, session_id, rank_position, total_results
    
    Returns number of rows inserted.
    """
    if not interactions:
        print("⚠️  No interactions to insert")
        return 0
    
    print(f"📥 Inserting {len(interactions)} interactions...")
    
    cursor = conn.cursor()
    
    # Match actual table schema from user_job_interaction.py model
    insert_query = """
        INSERT INTO user_job_interactions (
            event_id, timestamp, user_id, job_id, job_type,
            match_score, sub_scores, action, source, session_id,
            rank_position, total_results
        ) VALUES (
            %(event_id)s, %(timestamp)s, %(user_id)s, %(job_id)s, %(job_type)s,
            %(match_score)s, %(sub_scores)s, %(action)s, %(source)s, %(session_id)s,
            %(rank_position)s, %(total_results)s
        );
    """
    
    # Transform data to match database schema
    insert_data = []
    for idx, interaction in enumerate(interactions):
        # Get sub_scores and convert to proper format
        sub_scores = interaction.get('sub_scores', {})
        
        # Create JSONB-compatible sub_scores
        sub_scores_json = {
            'location': sub_scores.get('location_score', 0.5),
            'salary': sub_scores.get('salary_score', 0.5),
            'skills': sub_scores.get('skills_score', 0.5),
            'experience': sub_scores.get('experience_score', 0.5),
            'context_boost': sub_scores.get('context_boost', 1.0)
        }
        
        record = {
            'event_id': str(uuid.uuid4()),  # Generate unique event_id
            'timestamp': interaction['timestamp'],
            'user_id': str(interaction['user_id']),
            'job_id': str(interaction['job_id']),
            'job_type': interaction['job_type'],
            'match_score': interaction['match_score'],
            'sub_scores': json.dumps(sub_scores_json),  # Convert to JSON string
            'action': interaction['action'],
            'source': interaction['source'],
            'session_id': interaction.get('session_id'),
            'rank_position': idx % 10 + 1,  # Simulate position in results (1-10)
            'total_results': 50  # Simulate 50 total results per search
        }
        insert_data.append(record)
    
    try:
        # Batch insert for better performance
        execute_batch(cursor, insert_query, insert_data, page_size=500)
        conn.commit()
        rows_inserted = len(insert_data)
        print(f"  ✅ Inserted {rows_inserted} interactions")
        return rows_inserted
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"  ❌ Error inserting interactions: {e}")
        print(f"  First record causing issue: {insert_data[0] if insert_data else 'N/A'}")
        return 0
    finally:
        cursor.close()

def insert_feedback(conn, feedback_records: List[Dict]) -> int:
    """
    Insert match_feedback into database.
    Matches actual schema: feedback_id, match_event_id, timestamp,
    user_id, job_id, helpful, reason, comment
    
    Returns number of rows inserted.
    """
    if not feedback_records:
        print("⚠️  No feedback to insert")
        return 0
    
    print(f"📥 Inserting {len(feedback_records)} feedback records...")
    
    cursor = conn.cursor()
    
    # Match actual table schema from match_feedback.py model
    insert_query = """
        INSERT INTO match_feedback (
            feedback_id, match_event_id, timestamp,
            user_id, job_id, helpful, reason, comment
        ) VALUES (
            %(feedback_id)s, %(match_event_id)s, %(timestamp)s,
            %(user_id)s, %(job_id)s, %(helpful)s, %(reason)s, %(comment)s
        );
    """
    
    # Convert feedback_reason to reason
    feedback_data = []
    for record in feedback_records:
        feedback_data.append({
            'feedback_id': str(uuid.uuid4()),  # Generate unique feedback_id
            'match_event_id': str(uuid.uuid4()),  # Would normally link to event_id
            'timestamp': record['timestamp'],
            'user_id': str(record['user_id']),
            'job_id': str(record['job_id']),
            'helpful': record['helpful'],
            'reason': record.get('feedback_reason'),  # Maps to 'reason' column
            'comment': None  # No comments in synthetic data
        })
    
    try:
        execute_batch(cursor, insert_query, feedback_data, page_size=500)
        conn.commit()
        rows_inserted = len(feedback_data)
        print(f"  ✅ Inserted {rows_inserted} feedback records")
        return rows_inserted
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"  ❌ Error inserting feedback: {e}")
        print(f"  First record causing issue: {feedback_data[0] if feedback_data else 'N/A'}")
        return 0
    finally:
        cursor.close()

# ============================================================================
# VALIDATION QUERIES
# ============================================================================

def run_validation_queries(conn):
    """Run validation queries to verify data integrity."""
    print("\n" + "=" * 70)
    print("📊 DATA VALIDATION")
    print("=" * 70)
    
    cursor = conn.cursor()
    
    # Total interactions
    cursor.execute("SELECT COUNT(*) FROM user_job_interactions;")
    total_interactions = cursor.fetchone()[0]
    print(f"\n✅ Total interactions in database: {total_interactions}")
    
    if total_interactions == 0:
        print("\n⚠️  No data to validate!")
        cursor.close()
        return
    
    # Action distribution
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM user_job_interactions
        GROUP BY action
        ORDER BY count DESC;
    """)
    print("\n🎬 Action Distribution:")
    for action, count in cursor.fetchall():
        pct = (count / total_interactions * 100) if total_interactions > 0 else 0
        print(f"  {action:12s}: {count:5d} ({pct:5.1f}%)")
    
    # Average match scores by action
    cursor.execute("""
        SELECT action, 
               ROUND(AVG(match_score)::numeric, 3) as avg_score,
               ROUND(MIN(match_score)::numeric, 3) as min_score,
               ROUND(MAX(match_score)::numeric, 3) as max_score
        FROM user_job_interactions
        GROUP BY action
        ORDER BY avg_score DESC;
    """)
    print("\n🎯 Match Scores by Action:")
    for action, avg, min_s, max_s in cursor.fetchall():
        print(f"  {action:12s}: avg={avg:.3f}, min={min_s:.3f}, max={max_s:.3f}")
    
    # Job type distribution
    cursor.execute("""
        SELECT job_type, COUNT(*) as count
        FROM user_job_interactions
        GROUP BY job_type;
    """)
    print("\n💼 Job Type Distribution:")
    for job_type, count in cursor.fetchall():
        pct = (count / total_interactions * 100) if total_interactions > 0 else 0
        print(f"  {job_type:12s}: {count:5d} ({pct:5.1f}%)")
    
    # Feedback statistics
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN helpful THEN 1 ELSE 0 END) as helpful_count,
            ROUND(AVG(CASE WHEN helpful THEN 1 ELSE 0 END)::numeric * 100, 1) as helpful_pct
        FROM match_feedback;
    """)
    result = cursor.fetchone()
    if result:
        total, helpful_count, helpful_pct = result
        print(f"\n👍 Feedback Statistics:")
        print(f"  Total feedback: {total}")
        if helpful_pct is not None:
            print(f"  Helpful: {helpful_count} ({helpful_pct}%)")
    
    # Feedback reasons
    cursor.execute("""
        SELECT 
            reason, 
            COUNT(*) as count
        FROM match_feedback
        WHERE NOT helpful AND reason IS NOT NULL
        GROUP BY reason
        ORDER BY count DESC;
    """)
    print("\n📝 Not Helpful Reasons:")
    for reason, count in cursor.fetchall():
        print(f"  {reason:25s}: {count}")
    
    # Time range
    cursor.execute("""
        SELECT 
            MIN(timestamp) as earliest,
            MAX(timestamp) as latest
        FROM user_job_interactions;
    """)
    result = cursor.fetchone()
    if result:
        earliest, latest = result
        print(f"\n📅 Interaction Time Range:")
        print(f"  Earliest: {earliest}")
        print(f"  Latest:   {latest}")
    
    # User activity
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT user_id) as unique_users,
            ROUND(AVG(interaction_count)::numeric, 1) as avg_interactions_per_user
        FROM (
            SELECT user_id, COUNT(*) as interaction_count
            FROM user_job_interactions
            GROUP BY user_id
        ) as user_stats;
    """)
    result = cursor.fetchone()
    if result:
        unique_users, avg_per_user = result
        print(f"\n👥 User Activity:")
        print(f"  Unique users: {unique_users}")
        print(f"  Avg interactions per user: {avg_per_user}")
    
    # Data source verification
    cursor.execute("""
        SELECT source, COUNT(*) as count
        FROM user_job_interactions
        GROUP BY source;
    """)
    print(f"\n🏷️  Data Sources:")
    for source, count in cursor.fetchall():
        print(f"  {source}: {count}")
    
    cursor.close()
    
    print("\n" + "=" * 70)

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function."""
    print("=" * 70)
    print("CAMSS 2.0 - Database Seeding Script")
    print("=" * 70)
    print()
    
    # Define file path
    data_file = Path(r"C:\Dev\ai-job-matchingV2\backend\datasets\synthetic_interactions.json")
    
    # Check if file exists
    if not data_file.exists():
        print(f"❌ Error: Data file not found at {data_file}")
        print(f"   Please run simulate_interactions.py first to generate the data.")
        sys.exit(1)
    
    # Load data
    print(f"📂 Loading data from {data_file.name}...")
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        interactions = data.get('interactions', [])
        feedback = data.get('feedback', [])
        metadata = data.get('metadata', {})
        
        print(f"✅ Loaded {len(interactions)} interactions")
        print(f"✅ Loaded {len(feedback)} feedback records")
        print(f"✅ Generated at: {metadata.get('generated_at', 'unknown')}")
        print()
        
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON file - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading data file: {e}")
        sys.exit(1)
    
    # Connect to database
    print("🔌 Connecting to PostgreSQL database...")
    conn = get_connection()
    print(f"✅ Connected to {DB_CONFIG['database']}")
    print()
    
    try:
        # Verify tables exist
        if not verify_tables(conn):
            print("❌ Required tables do not exist. Please create schema first.")
            sys.exit(1)
        print()
        
        # Ask user if they want to clear existing data
        print("⚠️  Do you want to clear existing synthetic data before inserting?")
        print("   1. Clear only synthetic data (source='simulated')")
        print("   2. Clear ALL data from tables")
        print("   3. Keep existing data (append new data)")
        choice = input("\nEnter choice (1/2/3): ").strip()
        print()
        
        if choice == '1':
            clear_existing_data(conn, clear_all=False)
        elif choice == '2':
            clear_existing_data(conn, clear_all=True)
        elif choice == '3':
            print("📌 Keeping existing data...")
        else:
            print("⚠️  Invalid choice. Keeping existing data...")
        print()
        
        # Insert interactions
        interactions_inserted = insert_interactions(conn, interactions)
        print()
        
        # Insert feedback
        feedback_inserted = insert_feedback(conn, feedback)
        print()
        
        # Run validation queries
        run_validation_queries(conn)
        
        # Success summary
        print("\n" + "=" * 70)
        print("✨ DATABASE SEEDING COMPLETE!")
        print("=" * 70)
        print(f"✅ Inserted {interactions_inserted} interactions")
        print(f"✅ Inserted {feedback_inserted} feedback records")
        print(f"✅ Ready for ML model training and algorithm tuning")
        print("=" * 70)
        print()
        
        # Next steps
        print("📋 NEXT STEPS:")
        print("  1. Review validation statistics above")
        print("  2. Run additional SQL queries to explore data")
        print("  3. Train initial ML models")
        print("  4. Build recommendation algorithms")
        print("  5. Deploy to beta users and collect real data")
        print()
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        sys.exit(1)
        
    finally:
        conn.close()
        print("🔌 Database connection closed.")

if __name__ == "__main__":
    main()
