from app.db.session import Base

# Import all models here for Alembic
from app.models.user import User
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob
from app.models.skill_taxonomy import SkillTaxonomy
from app.models.skill_cooccurrence import SkillCooccurrence
from app.models.industry_transition import IndustryTransition
from app.models.user_job_interaction import UserJobInteraction
from app.models.match_feedback import MatchFeedback
