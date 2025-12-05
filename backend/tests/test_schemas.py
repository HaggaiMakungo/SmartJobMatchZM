"""
Unit tests for Pydantic schemas
Run with: pytest tests/test_schemas.py -v
"""
import pytest
from datetime import date, datetime
from pydantic import ValidationError

from app.schemas import (
    # Match schemas
    MatchRequest, MatchResponse, SingleJobMatchRequest,
    CorporateJobMatch, SmallJobMatch, ComponentScores,
    JobType, CollarType, SortBy,
    
    # CV schemas
    CVCreate, CVUpdate, CVResponse,
    EducationLevel, EmploymentStatus,
    
    # Job schemas
    CorporateJobCreate, CorporateJobUpdate,
    SmallJobCreate, SmallJobUpdate,
    EmploymentType, PaymentType, JobStatus
)


# ============================================================================
# MATCH SCHEMA TESTS
# ============================================================================

class TestMatchRequest:
    """Tests for MatchRequest schema"""
    
    def test_valid_match_request(self):
        """Test valid match request creation"""
        request = MatchRequest(
            job_type=JobType.CORPORATE,
            limit=20,
            min_score=0.4
        )
        assert request.job_type == JobType.CORPORATE
        assert request.limit == 20
        assert request.min_score == 0.4
    
    def test_default_values(self):
        """Test default values are set correctly"""
        request = MatchRequest()
        assert request.job_type == JobType.CORPORATE
        assert request.limit == 20
        assert request.min_score == 0.3
        assert request.sort_by == SortBy.SCORE
        assert request.sort_order == "desc"
        assert request.offset == 0
    
    def test_limit_validation(self):
        """Test limit must be between 1 and 100"""
        # Valid limits
        MatchRequest(limit=1)
        MatchRequest(limit=100)
        
        # Invalid limits
        with pytest.raises(ValidationError):
            MatchRequest(limit=0)
        
        with pytest.raises(ValidationError):
            MatchRequest(limit=101)
    
    def test_min_score_validation(self):
        """Test min_score must be between 0.0 and 1.0"""
        # Valid scores
        MatchRequest(min_score=0.0)
        MatchRequest(min_score=1.0)
        
        # Invalid scores
        with pytest.raises(ValidationError):
            MatchRequest(min_score=-0.1)
        
        with pytest.raises(ValidationError):
            MatchRequest(min_score=1.5)
    
    def test_salary_range_validation(self):
        """Test salary_max must be >= salary_min"""
        # Valid range
        MatchRequest(salary_min=10000, salary_max=30000)
        
        # Invalid range
        with pytest.raises(ValidationError):
            MatchRequest(salary_min=30000, salary_max=10000)
    
    def test_with_filters(self):
        """Test request with all filters"""
        request = MatchRequest(
            job_type=JobType.CORPORATE,
            categories=["IT", "Engineering"],
            locations=["Lusaka", "Copperbelt"],
            salary_min=15000,
            salary_max=25000,
            collar_types=[CollarType.GREY, CollarType.WHITE],
            employment_types=["Full-time"]
        )
        assert len(request.categories) == 2
        assert len(request.locations) == 2
        assert len(request.collar_types) == 2


class TestComponentScores:
    """Tests for ComponentScores schema"""
    
    def test_valid_corporate_scores(self):
        """Test valid corporate job component scores"""
        scores = ComponentScores(
            qualification=0.85,
            experience=0.72,
            skills=0.90,
            location=1.0,
            category=0.68,
            personalization=0.55
        )
        assert scores.qualification == 0.85
        assert scores.skills == 0.90
    
    def test_valid_small_job_scores(self):
        """Test valid small job component scores"""
        scores = ComponentScores(
            skills=0.85,
            location=1.0,
            availability=0.60
        )
        assert scores.skills == 0.85
        assert scores.location == 1.0
    
    def test_score_range_validation(self):
        """Test scores must be between 0.0 and 1.0"""
        # Valid
        ComponentScores(skills=0.0)
        ComponentScores(skills=1.0)
        
        # Invalid
        with pytest.raises(ValidationError):
            ComponentScores(skills=-0.1)
        
        with pytest.raises(ValidationError):
            ComponentScores(skills=1.5)


class TestCorporateJobMatch:
    """Tests for CorporateJobMatch schema"""
    
    def test_valid_match(self):
        """Test valid corporate job match"""
        match = CorporateJobMatch(
            job_id="job_001",
            title="Software Engineer",
            company="TechCo",
            category="IT",
            location="Lusaka, Lusaka",
            final_score=0.87,
            component_scores=ComponentScores(
                qualification=0.85,
                experience=0.90,
                skills=0.92,
                location=1.0,
                category=0.75,
                personalization=0.60
            ),
            explanation="Strong match"
        )
        assert match.job_id == "job_001"
        assert match.final_score == 0.87
        assert match.component_scores.skills == 0.92


# ============================================================================
# CV SCHEMA TESTS
# ============================================================================

class TestCVCreate:
    """Tests for CVCreate schema"""
    
    def test_valid_cv_creation(self):
        """Test valid CV creation"""
        cv = CVCreate(
            full_name="John Banda",
            email="john@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED
        )
        assert cv.full_name == "John Banda"
        assert cv.education_level == EducationLevel.BACHELORS
    
    def test_email_validation(self):
        """Test email must be valid format"""
        # Valid email
        CVCreate(
            full_name="John Banda",
            email="john@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED
        )
        
        # Invalid email
        with pytest.raises(ValidationError):
            CVCreate(
                full_name="John Banda",
                email="not-an-email",
                phone="260977123456",
                city="Lusaka",
                province="Lusaka",
                education_level=EducationLevel.BACHELORS,
                employment_status=EmploymentStatus.EMPLOYED
            )
    
    def test_name_length_validation(self):
        """Test name must be 2-100 characters"""
        # Valid names
        CVCreate(
            full_name="Jo",  # Minimum
            email="jo@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED
        )
        
        # Invalid name (too short)
        with pytest.raises(ValidationError):
            CVCreate(
                full_name="J",
                email="j@example.com",
                phone="260977123456",
                city="Lusaka",
                province="Lusaka",
                education_level=EducationLevel.BACHELORS,
                employment_status=EmploymentStatus.EMPLOYED
            )
    
    def test_experience_range_validation(self):
        """Test experience must be 0-50 years"""
        # Valid experience
        CVCreate(
            full_name="John Banda",
            email="john@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED,
            total_years_experience=25.0
        )
        
        # Invalid experience (too high)
        with pytest.raises(ValidationError):
            CVCreate(
                full_name="John Banda",
                email="john@example.com",
                phone="260977123456",
                city="Lusaka",
                province="Lusaka",
                education_level=EducationLevel.BACHELORS,
                employment_status=EmploymentStatus.EMPLOYED,
                total_years_experience=60.0
            )
    
    def test_salary_range_validation(self):
        """Test salary_max must be >= salary_min"""
        # Valid range
        CVCreate(
            full_name="John Banda",
            email="john@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED,
            salary_expectation_min=15000.0,
            salary_expectation_max=25000.0
        )
        
        # Invalid range
        with pytest.raises(ValidationError):
            CVCreate(
                full_name="John Banda",
                email="john@example.com",
                phone="260977123456",
                city="Lusaka",
                province="Lusaka",
                education_level=EducationLevel.BACHELORS,
                employment_status=EmploymentStatus.EMPLOYED,
                salary_expectation_min=25000.0,
                salary_expectation_max=15000.0
            )


# ============================================================================
# JOB SCHEMA TESTS
# ============================================================================

class TestCorporateJobCreate:
    """Tests for CorporateJobCreate schema"""
    
    def test_valid_job_creation(self):
        """Test valid corporate job creation"""
        job = CorporateJobCreate(
            title="Software Engineer",
            company="TechCo",
            category="IT",
            collar_type=CollarType.GREY,
            description="A" * 50,  # Minimum 50 chars
            required_skills="Python, JavaScript",
            required_experience_years=3.0,
            required_education="Bachelor's",
            location_city="Lusaka",
            location_province="Lusaka",
            salary_min_zmw=15000.0,
            salary_max_zmw=25000.0,
            employment_type=EmploymentType.FULL_TIME
        )
        assert job.title == "Software Engineer"
        assert job.collar_type == CollarType.GREY
    
    def test_title_length_validation(self):
        """Test title must be 3-200 characters"""
        # Valid title
        CorporateJobCreate(
            title="Dev",  # Minimum 3 chars
            company="TechCo",
            category="IT",
            collar_type=CollarType.GREY,
            description="A" * 50,
            required_skills="Python",
            required_experience_years=0.0,
            required_education="Any",
            location_city="Lusaka",
            location_province="Lusaka",
            salary_min_zmw=10000.0,
            salary_max_zmw=20000.0,
            employment_type=EmploymentType.FULL_TIME
        )
        
        # Invalid title (too short)
        with pytest.raises(ValidationError):
            CorporateJobCreate(
                title="AB",
                company="TechCo",
                category="IT",
                collar_type=CollarType.GREY,
                description="A" * 50,
                required_skills="Python",
                required_experience_years=0.0,
                required_education="Any",
                location_city="Lusaka",
                location_province="Lusaka",
                salary_min_zmw=10000.0,
                salary_max_zmw=20000.0,
                employment_type=EmploymentType.FULL_TIME
            )
    
    def test_description_length_validation(self):
        """Test description must be at least 50 characters"""
        # Valid description
        CorporateJobCreate(
            title="Software Engineer",
            company="TechCo",
            category="IT",
            collar_type=CollarType.GREY,
            description="A" * 50,  # Exactly 50 chars
            required_skills="Python",
            required_experience_years=0.0,
            required_education="Any",
            location_city="Lusaka",
            location_province="Lusaka",
            salary_min_zmw=10000.0,
            salary_max_zmw=20000.0,
            employment_type=EmploymentType.FULL_TIME
        )
        
        # Invalid description (too short)
        with pytest.raises(ValidationError):
            CorporateJobCreate(
                title="Software Engineer",
                company="TechCo",
                category="IT",
                collar_type=CollarType.GREY,
                description="Short",
                required_skills="Python",
                required_experience_years=0.0,
                required_education="Any",
                location_city="Lusaka",
                location_province="Lusaka",
                salary_min_zmw=10000.0,
                salary_max_zmw=20000.0,
                employment_type=EmploymentType.FULL_TIME
            )
    
    def test_salary_range_validation(self):
        """Test salary_max must be >= salary_min"""
        # Valid range
        CorporateJobCreate(
            title="Software Engineer",
            company="TechCo",
            category="IT",
            collar_type=CollarType.GREY,
            description="A" * 50,
            required_skills="Python",
            required_experience_years=0.0,
            required_education="Any",
            location_city="Lusaka",
            location_province="Lusaka",
            salary_min_zmw=15000.0,
            salary_max_zmw=25000.0,
            employment_type=EmploymentType.FULL_TIME
        )
        
        # Invalid range
        with pytest.raises(ValidationError):
            CorporateJobCreate(
                title="Software Engineer",
                company="TechCo",
                category="IT",
                collar_type=CollarType.GREY,
                description="A" * 50,
                required_skills="Python",
                required_experience_years=0.0,
                required_education="Any",
                location_city="Lusaka",
                location_province="Lusaka",
                salary_min_zmw=25000.0,
                salary_max_zmw=15000.0,
                employment_type=EmploymentType.FULL_TIME
            )


class TestSmallJobCreate:
    """Tests for SmallJobCreate schema"""
    
    def test_valid_gig_creation(self):
        """Test valid small job creation"""
        gig = SmallJobCreate(
            title="Website Design",
            category="Web Development",
            description="Need a landing page",  # Min 20 chars
            province="Lusaka",
            location="CBD",
            budget=2500.0,
            payment_type=PaymentType.FIXED,
            posted_by="user_123"
        )
        assert gig.title == "Website Design"
        assert gig.payment_type == PaymentType.FIXED
        assert gig.status == JobStatus.OPEN  # Default
    
    def test_description_length_validation(self):
        """Test description must be at least 20 characters"""
        # Valid description
        SmallJobCreate(
            title="Task",
            category="Category",
            description="A" * 20,  # Minimum 20 chars
            province="Lusaka",
            location="CBD",
            budget=1000.0,
            payment_type=PaymentType.FIXED,
            posted_by="user_123"
        )
        
        # Invalid description (too short)
        with pytest.raises(ValidationError):
            SmallJobCreate(
                title="Task",
                category="Category",
                description="Short",
                province="Lusaka",
                location="CBD",
                budget=1000.0,
                payment_type=PaymentType.FIXED,
                posted_by="user_123"
            )


# ============================================================================
# ENUM TESTS
# ============================================================================

class TestEnums:
    """Tests for enum validations"""
    
    def test_job_type_enum(self):
        """Test JobType enum values"""
        assert JobType.CORPORATE == "corporate"
        assert JobType.SMALL == "small"
        assert JobType.BOTH == "both"
    
    def test_collar_type_enum(self):
        """Test CollarType enum values"""
        assert CollarType.WHITE == "white"
        assert CollarType.BLUE == "blue"
        assert CollarType.PINK == "pink"
        assert CollarType.GREY == "grey"
        assert CollarType.GREEN == "green"
    
    def test_education_level_enum(self):
        """Test EducationLevel enum values"""
        assert EducationLevel.CERTIFICATE == "Certificate"
        assert EducationLevel.BACHELORS == "Bachelor's"
        assert EducationLevel.MASTERS == "Master's"


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestSchemaIntegration:
    """Integration tests for schema interactions"""
    
    def test_match_response_with_corporate_matches(self):
        """Test complete match response with corporate jobs"""
        response = MatchResponse(
            success=True,
            job_type=JobType.CORPORATE,
            total_matches=5,
            returned_matches=5,
            corporate_matches=[
                CorporateJobMatch(
                    job_id="job_001",
                    title="Software Engineer",
                    company="TechCo",
                    category="IT",
                    location="Lusaka, Lusaka",
                    final_score=0.87,
                    component_scores=ComponentScores(
                        qualification=0.85,
                        experience=0.90,
                        skills=0.92,
                        location=1.0,
                        category=0.75,
                        personalization=0.60
                    ),
                    explanation="Strong match"
                )
            ],
            cv_id="cv_001",
            execution_time_ms=250.0,
            has_more=False
        )
        
        assert response.success is True
        assert len(response.corporate_matches) == 1
        assert response.corporate_matches[0].final_score == 0.87
    
    def test_cv_to_dict(self):
        """Test CV schema serialization"""
        cv = CVCreate(
            full_name="John Banda",
            email="john@example.com",
            phone="260977123456",
            city="Lusaka",
            province="Lusaka",
            education_level=EducationLevel.BACHELORS,
            employment_status=EmploymentStatus.EMPLOYED
        )
        
        cv_dict = cv.dict()
        assert cv_dict["full_name"] == "John Banda"
        assert cv_dict["education_level"] == "Bachelor's"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
