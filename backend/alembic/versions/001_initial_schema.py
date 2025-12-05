"""Initial schema for AI Job Matching System

Revision ID: 001_initial_schema
Revises: 
Create Date: 2024-11-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # CVs table
    op.create_table('cvs',
        sa.Column('cv_id', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('gender', sa.String(), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('nationality', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('province', sa.String(), nullable=True),
        sa.Column('education_level', sa.String(), nullable=True),
        sa.Column('institution', sa.String(), nullable=True),
        sa.Column('graduation_year', sa.Integer(), nullable=True),
        sa.Column('major', sa.String(), nullable=True),
        sa.Column('certifications', sa.Text(), nullable=True),
        sa.Column('languages', sa.String(), nullable=True),
        sa.Column('language_proficiency', sa.String(), nullable=True),
        sa.Column('total_years_experience', sa.Float(), nullable=True),
        sa.Column('current_job_title', sa.String(), nullable=True),
        sa.Column('employment_status', sa.String(), nullable=True),
        sa.Column('preferred_job_type', sa.String(), nullable=True),
        sa.Column('preferred_location', sa.String(), nullable=True),
        sa.Column('salary_expectation_min', sa.Float(), nullable=True),
        sa.Column('salary_expectation_max', sa.Float(), nullable=True),
        sa.Column('availability', sa.String(), nullable=True),
        sa.Column('skills_technical', sa.Text(), nullable=True),
        sa.Column('skills_soft', sa.Text(), nullable=True),
        sa.Column('work_experience_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('projects_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('references_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('resume_quality_score', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('cv_id')
    )
    op.create_index(op.f('ix_cvs_cv_id'), 'cvs', ['cv_id'], unique=False)
    op.create_index(op.f('ix_cvs_email'), 'cvs', ['email'], unique=True)
    op.create_index(op.f('ix_cvs_city'), 'cvs', ['city'], unique=False)
    op.create_index(op.f('ix_cvs_province'), 'cvs', ['province'], unique=False)
    op.create_index(op.f('ix_cvs_education_level'), 'cvs', ['education_level'], unique=False)
    op.create_index(op.f('ix_cvs_total_years_experience'), 'cvs', ['total_years_experience'], unique=False)
    op.create_index(op.f('ix_cvs_employment_status'), 'cvs', ['employment_status'], unique=False)
    op.create_index(op.f('ix_cvs_availability'), 'cvs', ['availability'], unique=False)

    # Corporate Jobs table
    op.create_table('corporate_jobs',
        sa.Column('job_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('company', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('collar_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('key_responsibilities', sa.Text(), nullable=True),
        sa.Column('required_skills', sa.Text(), nullable=True),
        sa.Column('preferred_skills', sa.Text(), nullable=True),
        sa.Column('required_experience_years', sa.Float(), nullable=True),
        sa.Column('required_education', sa.String(), nullable=True),
        sa.Column('preferred_certifications', sa.Text(), nullable=True),
        sa.Column('location_city', sa.String(), nullable=True),
        sa.Column('location_province', sa.String(), nullable=True),
        sa.Column('salary_min_zmw', sa.Float(), nullable=True),
        sa.Column('salary_max_zmw', sa.Float(), nullable=True),
        sa.Column('employment_type', sa.String(), nullable=True),
        sa.Column('work_schedule', sa.String(), nullable=True),
        sa.Column('language_requirements', sa.String(), nullable=True),
        sa.Column('application_deadline', sa.Date(), nullable=True),
        sa.Column('posted_date', sa.Date(), nullable=True),
        sa.Column('benefits', sa.Text(), nullable=True),
        sa.Column('growth_opportunities', sa.Text(), nullable=True),
        sa.Column('company_size', sa.String(), nullable=True),
        sa.Column('industry_sector', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('job_id')
    )
    op.create_index(op.f('ix_corporate_jobs_job_id'), 'corporate_jobs', ['job_id'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_title'), 'corporate_jobs', ['title'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_company'), 'corporate_jobs', ['company'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_category'), 'corporate_jobs', ['category'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_collar_type'), 'corporate_jobs', ['collar_type'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_location_city'), 'corporate_jobs', ['location_city'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_location_province'), 'corporate_jobs', ['location_province'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_required_education'), 'corporate_jobs', ['required_education'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_required_experience_years'), 'corporate_jobs', ['required_experience_years'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_employment_type'), 'corporate_jobs', ['employment_type'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_posted_date'), 'corporate_jobs', ['posted_date'], unique=False)
    op.create_index(op.f('ix_corporate_jobs_industry_sector'), 'corporate_jobs', ['industry_sector'], unique=False)

    # Small Jobs table
    op.create_table('small_jobs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('province', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('payment_type', sa.String(), nullable=True),
        sa.Column('duration', sa.String(), nullable=True),
        sa.Column('posted_by', sa.String(), nullable=True),
        sa.Column('date_posted', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_small_jobs_id'), 'small_jobs', ['id'], unique=False)
    op.create_index(op.f('ix_small_jobs_title'), 'small_jobs', ['title'], unique=False)
    op.create_index(op.f('ix_small_jobs_category'), 'small_jobs', ['category'], unique=False)
    op.create_index(op.f('ix_small_jobs_province'), 'small_jobs', ['province'], unique=False)
    op.create_index(op.f('ix_small_jobs_location'), 'small_jobs', ['location'], unique=False)
    op.create_index(op.f('ix_small_jobs_date_posted'), 'small_jobs', ['date_posted'], unique=False)
    op.create_index(op.f('ix_small_jobs_status'), 'small_jobs', ['status'], unique=False)

    # Skills Taxonomy table
    op.create_table('skills_taxonomy',
        sa.Column('skill_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('skill_name', sa.String(), nullable=False),
        sa.Column('normalized_name', sa.String(), nullable=True),
        sa.Column('synonyms', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('frequency', sa.Integer(), nullable=True),
        sa.Column('percentage', sa.Float(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('skill_id'),
        sa.UniqueConstraint('skill_name')
    )
    op.create_index(op.f('ix_skills_taxonomy_skill_name'), 'skills_taxonomy', ['skill_name'], unique=False)
    op.create_index(op.f('ix_skills_taxonomy_normalized_name'), 'skills_taxonomy', ['normalized_name'], unique=False)

    # Skill Co-occurrence table
    op.create_table('skill_cooccurrence',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('skill_a', sa.String(), nullable=False),
        sa.Column('skill_b', sa.String(), nullable=False),
        sa.Column('co_occurrences', sa.Integer(), nullable=True),
        sa.Column('jaccard_similarity', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_cooccurrence_skill_a'), 'skill_cooccurrence', ['skill_a'], unique=False)
    op.create_index(op.f('ix_skill_cooccurrence_skill_b'), 'skill_cooccurrence', ['skill_b'], unique=False)

    # Industry Transitions table
    op.create_table('industry_transitions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('from_industry', sa.String(), nullable=False),
        sa.Column('to_industry', sa.String(), nullable=False),
        sa.Column('transitions', sa.Integer(), nullable=True),
        sa.Column('probability', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_industry_transitions_from_industry'), 'industry_transitions', ['from_industry'], unique=False)
    op.create_index(op.f('ix_industry_transitions_to_industry'), 'industry_transitions', ['to_industry'], unique=False)

    # User Job Interactions table (telemetry)
    op.create_table('user_job_interactions',
        sa.Column('event_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('job_id', sa.String(), nullable=True),
        sa.Column('job_type', sa.String(), nullable=True),
        sa.Column('match_score', sa.Float(), nullable=True),
        sa.Column('sub_scores', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('action', sa.String(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('rank_position', sa.Integer(), nullable=True),
        sa.Column('total_results', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('event_id')
    )
    op.create_index(op.f('ix_user_job_interactions_event_id'), 'user_job_interactions', ['event_id'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_timestamp'), 'user_job_interactions', ['timestamp'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_user_id'), 'user_job_interactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_job_id'), 'user_job_interactions', ['job_id'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_job_type'), 'user_job_interactions', ['job_type'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_match_score'), 'user_job_interactions', ['match_score'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_action'), 'user_job_interactions', ['action'], unique=False)
    op.create_index(op.f('ix_user_job_interactions_session_id'), 'user_job_interactions', ['session_id'], unique=False)

    # Match Feedback table
    op.create_table('match_feedback',
        sa.Column('feedback_id', sa.String(), nullable=False),
        sa.Column('match_event_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('job_id', sa.String(), nullable=True),
        sa.Column('helpful', sa.Boolean(), nullable=True),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('feedback_id')
    )
    op.create_index(op.f('ix_match_feedback_feedback_id'), 'match_feedback', ['feedback_id'], unique=False)
    op.create_index(op.f('ix_match_feedback_match_event_id'), 'match_feedback', ['match_event_id'], unique=False)
    op.create_index(op.f('ix_match_feedback_timestamp'), 'match_feedback', ['timestamp'], unique=False)
    op.create_index(op.f('ix_match_feedback_user_id'), 'match_feedback', ['user_id'], unique=False)
    op.create_index(op.f('ix_match_feedback_job_id'), 'match_feedback', ['job_id'], unique=False)
    op.create_index(op.f('ix_match_feedback_helpful'), 'match_feedback', ['helpful'], unique=False)


def downgrade() -> None:
    op.drop_table('match_feedback')
    op.drop_table('user_job_interactions')
    op.drop_table('industry_transitions')
    op.drop_table('skill_cooccurrence')
    op.drop_table('skills_taxonomy')
    op.drop_table('small_jobs')
    op.drop_table('corporate_jobs')
    op.drop_table('cvs')
