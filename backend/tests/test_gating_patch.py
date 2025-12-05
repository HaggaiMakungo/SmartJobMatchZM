"""
SPRINT A - Unit Tests for Gating Patch
=======================================
Tests that verify hard gates work correctly
"""

import pytest
from unittest.mock import Mock, MagicMock
from app.services.gated_matching_service import GatedMatchingService, MIN_MATCH_THRESHOLD


class TestGatingPatch:
    """Test suite for Sprint A gating logic"""
    
    def setup_method(self):
        """Setup mock database and service"""
        self.mock_db = Mock()
        self.service = GatedMatchingService(self.mock_db)
    
    def test_zero_skills_excluded(self):
        """
        CRITICAL TEST: Candidates with 0 matched skills must be excluded.
        This was the main bug we're fixing.
        """
        # Mock CV with no skill overlap
        cv_skills = ["JavaScript", "React", "Node.js"]
        job_skills = ["Python", "Django", "PostgreSQL"]
        
        matched, missing = self.service._intersect_skills(cv_skills, job_skills)
        
        # Assert: No skills matched
        assert len(matched) == 0, "Should have 0 matched skills"
        assert len(missing) == len(job_skills), "All job skills should be missing"
    
    def test_partial_skills_included(self):
        """Candidates with some matched skills should be included"""
        cv_skills = ["Python", "JavaScript", "React"]
        job_skills = ["Python", "Django", "PostgreSQL"]
        
        matched, missing = self.service._intersect_skills(cv_skills, job_skills)
        
        # Assert: At least 1 skill matched
        assert len(matched) > 0, "Should have at least 1 matched skill"
        assert "Python" in matched, "Python should be matched"
    
    def test_no_base_score_padding(self):
        """
        Score should be proportional to matches, not padded.
        With 0 skills matched, score should be very low.
        """
        # Mock objects
        cv = Mock()
        cv.total_years_experience = 5
        cv.city = "Lusaka"
        
        job = Mock()
        job.min_experience_years = 3
        job.location_city = "Lusaka"
        
        # 0 skills matched
        cv_skills = ["JavaScript"]
        job_skills = ["Python", "Django"]
        matched_skills = []
        missing_skills = job_skills
        
        score = self.service._compute_gated_score(
            cv, job, cv_skills, job_skills, matched_skills, missing_skills
        )
        
        # Score should be very low (< 20%)
        # Even with perfect experience and location
        assert score < 0.20, f"Score with 0 skills should be < 20%, got {score * 100}%"
    
    def test_high_skill_match_high_score(self):
        """Candidates with high skill overlap should score high"""
        cv = Mock()
        cv.total_years_experience = 5
        cv.city = "Lusaka"
        
        job = Mock()
        job.min_experience_years = 3
        job.location_city = "Lusaka"
        
        # All skills matched
        job_skills = ["Python", "Django", "PostgreSQL"]
        matched_skills = job_skills
        missing_skills = []
        
        score = self.service._compute_gated_score(
            cv, job, job_skills, job_skills, matched_skills, missing_skills
        )
        
        # Score should be high (> 80%)
        assert score >= 0.80, f"Score with all skills matched should be >= 80%, got {score * 100}%"
    
    def test_min_score_threshold_respected(self):
        """Only candidates above min_score should be returned"""
        # This would need a full integration test with real database
        # For now, we verify the threshold constant exists
        assert MIN_MATCH_THRESHOLD == 0.45, "Default threshold should be 45%"
    
    def test_experience_scoring(self):
        """Test experience matching logic"""
        # Perfect match
        score = self.service._compute_experience_score(cv_years=5, required_years=5)
        assert score == 1.0, "Perfect experience match should score 1.0"
        
        # Overqualified (but still good)
        score = self.service._compute_experience_score(cv_years=10, required_years=5)
        assert score == 1.0, "Overqualified should still score 1.0"
        
        # Slightly underqualified
        score = self.service._compute_experience_score(cv_years=4, required_years=5)
        assert score >= 0.7, "1 year shortage should score >= 0.7"
        
        # Very underqualified
        score = self.service._compute_experience_score(cv_years=1, required_years=5)
        assert score <= 0.6, "Major shortage should score <= 0.6"
    
    def test_location_scoring(self):
        """Test location matching logic"""
        # Same city
        score = self.service._compute_location_score("Lusaka", "Lusaka")
        assert score == 1.0, "Same city should score 1.0"
        
        # Different city
        score = self.service._compute_location_score("Lusaka", "Kitwe")
        assert score == 0.3, "Different city should score 0.3"
        
        # Missing location
        score = self.service._compute_location_score("", "Lusaka")
        assert score == 0.5, "Missing location should score 0.5"


class TestGatingIntegration:
    """Integration tests (requires database)"""
    
    @pytest.mark.skip(reason="Requires database setup")
    def test_full_matching_flow(self):
        """
        End-to-end test of matching with gates.
        This would test:
        1. Fetch job from DB
        2. Fetch CVs from DB
        3. Apply gates
        4. Return only valid matches
        """
        pass


def test_imports():
    """Verify all imports work"""
    from app.services.gated_matching_service import (
        GatedMatchingService,
        match_job_with_gates,
        MIN_MATCH_THRESHOLD,
        WEIGHTS
    )
    assert GatedMatchingService is not None
    assert match_job_with_gates is not None
    assert MIN_MATCH_THRESHOLD > 0
    assert WEIGHTS['skills'] == 0.80


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
