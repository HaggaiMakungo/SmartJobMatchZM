"""
CAMSS 2.0 - Unit Tests for Matching Service
===========================================
Tests core matching logic without database dependencies.
"""

import pytest
from app.services.matching_service import (
    normalize_skills,
    calculate_location_score,
    calculate_salary_score,
    calculate_skills_score,
    calculate_experience_score,
    apply_context_boost
)


class TestSkillNormalization:
    """Test skill string normalization."""
    
    def test_normalize_basic_skills(self):
        skills = "Python, Django, PostgreSQL"
        result = normalize_skills(skills)
        assert result == {'python', 'django', 'postgresql'}
    
    def test_normalize_with_whitespace(self):
        skills = "  Python  ,  Django  ,  PostgreSQL  "
        result = normalize_skills(skills)
        assert result == {'python', 'django', 'postgresql'}
    
    def test_normalize_empty(self):
        assert normalize_skills("") == set()
        assert normalize_skills(None) == set()
    
    def test_normalize_single_skill(self):
        assert normalize_skills("Python") == {'python'}


class TestLocationScoring:
    """Test location matching logic."""
    
    def test_same_city_perfect_match(self):
        score, reason = calculate_location_score(
            "Lusaka", "Lusaka Province",
            "Lusaka", "Lusaka Province"
        )
        assert score == 1.0
        assert "same city" in reason.lower()
    
    def test_same_province_good_match(self):
        score, reason = calculate_location_score(
            "Kitwe", "Copperbelt Province",
            "Ndola", "Copperbelt Province"
        )
        assert score == 0.7
        assert "same province" in reason.lower()
    
    def test_different_province_poor_match(self):
        score, reason = calculate_location_score(
            "Lusaka", "Lusaka Province",
            "Kitwe", "Copperbelt Province"
        )
        assert score == 0.3
        assert "different location" in reason.lower()
    
    def test_remote_job_high_score(self):
        score, reason = calculate_location_score(
            "Lusaka", "Lusaka Province",
            "Remote", "N/A",
            is_remote=True
        )
        assert score == 0.9
        assert "remote" in reason.lower()
    
    def test_copperbelt_interconnection(self):
        score, reason = calculate_location_score(
            "Kitwe", "Copperbelt Province",
            "Chingola", "Copperbelt Province"
        )
        assert score >= 0.6  # Either same province (0.7) or Copperbelt bonus (0.6)


class TestSalaryScoring:
    """Test salary alignment logic."""
    
    def test_salary_within_range_perfect(self):
        score, reason = calculate_salary_score(
            cv_min=5000, cv_max=10000,
            job_min=6000, job_max=8000
        )
        assert score == 1.0
        assert "matches expectations" in reason.lower()
    
    def test_salary_above_expectation(self):
        score, reason = calculate_salary_score(
            cv_min=5000, cv_max=8000,
            job_min=8000, job_max=12000
        )
        assert score == 0.95
        assert "exceeds expectations" in reason.lower()
    
    def test_salary_slightly_below(self):
        score, reason = calculate_salary_score(
            cv_min=10000, cv_max=15000,
            job_min=8000, job_max=9000
        )
        assert score == 0.6
        assert "slightly below" in reason.lower()
    
    def test_salary_significantly_below(self):
        score, reason = calculate_salary_score(
            cv_min=15000, cv_max=20000,
            job_min=5000, job_max=7000
        )
        assert score == 0.1
        assert "significantly below" in reason.lower()
    
    def test_missing_salary_data(self):
        score, reason = calculate_salary_score(
            cv_min=None, cv_max=None,
            job_min=5000, job_max=10000
        )
        assert score == 0.5
        assert "incomplete" in reason.lower()


class TestSkillsScoring:
    """Test skills matching logic."""
    
    def test_perfect_skills_match(self):
        score, matched, missing = calculate_skills_score(
            cv_technical="Python, Django, PostgreSQL",
            cv_soft="Communication, Teamwork",
            job_required="Python, Django",
            job_preferred="PostgreSQL"
        )
        assert score >= 0.9
        assert len(matched) == 3
        assert len(missing) == 0
    
    def test_partial_skills_match(self):
        score, matched, missing = calculate_skills_score(
            cv_technical="Python, Django",
            cv_soft="Communication",
            job_required="Python, Django, Docker",
            job_preferred="Kubernetes"
        )
        assert 0.4 < score < 0.8  # Partial match
        assert 'Python' in [s.lower() for s in matched]
        assert 'Docker' in [s.lower() for s in missing]
    
    def test_no_skills_match(self):
        score, matched, missing = calculate_skills_score(
            cv_technical="Python, Django",
            cv_soft="",
            job_required="Java, Spring, MySQL",
            job_preferred=""
        )
        assert score < 0.3  # Poor match
        assert len(matched) == 0
    
    def test_no_requirements(self):
        score, matched, missing = calculate_skills_score(
            cv_technical="Python, Django",
            cv_soft="",
            job_required="",
            job_preferred=""
        )
        assert score == 0.5  # Default when no requirements


class TestExperienceScoring:
    """Test experience matching logic."""
    
    def test_meets_requirement(self):
        score, reason = calculate_experience_score(
            cv_years=5,
            job_required_str="3-5 years"
        )
        assert score == 1.0
        assert "meets" in reason.lower()
    
    def test_exceeds_requirement(self):
        score, reason = calculate_experience_score(
            cv_years=10,
            job_required_str="3 years"
        )
        assert score >= 0.7  # May be overqualified
    
    def test_close_to_requirement(self):
        score, reason = calculate_experience_score(
            cv_years=2,
            job_required_str="3 years"
        )
        assert score >= 0.6
        assert "close" in reason.lower()
    
    def test_under_qualified(self):
        score, reason = calculate_experience_score(
            cv_years=1,
            job_required_str="5+ years"
        )
        assert score <= 0.5
        assert "under" in reason.lower()
    
    def test_no_requirement(self):
        score, reason = calculate_experience_score(
            cv_years=3,
            job_required_str=None
        )
        assert score == 0.8


class TestContextBoosts:
    """Test Zambian market context boosts."""
    
    def test_mining_sector_boost(self):
        job_data = {
            'location_province': 'Copperbelt Province',
            'required_skills': 'Mining, Geology, Mineral Processing',
            'company': 'Mining Corp'
        }
        cv_data = {'city': 'Kitwe', 'province': 'Copperbelt Province'}
        
        boost, reasons = apply_context_boost(job_data, cv_data)
        assert boost >= 1.2  # Should have mining boost
        assert any('mining' in r.lower() for r in reasons)
    
    def test_government_boost(self):
        job_data = {
            'location_province': 'Lusaka Province',
            'required_skills': 'Administration',
            'company': 'Ministry of Finance'
        }
        cv_data = {'city': 'Lusaka', 'province': 'Lusaka Province'}
        
        boost, reasons = apply_context_boost(job_data, cv_data)
        assert boost >= 1.1  # Should have government boost
        assert any('government' in r.lower() for r in reasons)
    
    def test_remote_boost(self):
        job_data = {
            'location_province': 'Remote',
            'required_skills': 'Software Development',
            'company': 'Tech Startup'
        }
        cv_data = {'city': 'Lusaka', 'province': 'Lusaka Province'}
        
        boost, reasons = apply_context_boost(job_data, cv_data)
        assert boost >= 1.05
        assert any('remote' in r.lower() for r in reasons)
    
    def test_no_boost(self):
        job_data = {
            'location_province': 'Lusaka Province',
            'required_skills': 'Sales, Marketing',
            'company': 'ABC Company'
        }
        cv_data = {'city': 'Lusaka', 'province': 'Lusaka Province'}
        
        boost, reasons = apply_context_boost(job_data, cv_data)
        assert boost == 1.0
        assert len(reasons) == 0


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
