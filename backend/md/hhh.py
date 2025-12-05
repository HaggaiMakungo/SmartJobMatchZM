import psycopg2
conn = psycopg2.connect('host=localhost dbname=job_match_db user=postgres password=Winter123')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM matching_metadata.skills_taxonomy')
print(f'✓ Skills: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM matching_metadata.category_compatibility')
print(f'✓ Transitions: {cur.fetchone()[0]}')
print('✅ Database ready for Phase 2!')