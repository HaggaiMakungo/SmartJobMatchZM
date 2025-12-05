"""
CAMSS 2.0 - Keyword Extractor (Phase 1)
========================================
Extracts meaningful keywords from job descriptions and CVs.
Removes corporate fluff and focuses on job-specific terms.

Academic Context:
-----------------
Implements Term Extraction using a combination of:
- Stop word filtering
- Domain-specific keyword lists
- Frequency-based filtering
- N-gram extraction for multi-word terms

Purpose:
--------
Reduce noise from generic soft skills that contaminate matching scores.
Focus on technical skills, tools, and job-specific competencies.
"""

from typing import List, Set, Dict
import re
from collections import Counter


# ============================================================================
# FLUFF WORDS - Generic terms that don't indicate job-specific skills
# ============================================================================

GENERIC_SOFT_SKILLS = {
    # Overused soft skills
    'team player', 'team work', 'teamwork', 'motivated', 'self-motivated',
    'hard working', 'hardworking', 'dedicated', 'passionate', 'enthusiastic',
    'detail-oriented', 'detail oriented', 'results-driven', 'results driven',
    'fast learner', 'quick learner', 'problem solver', 'problem solving',
    'flexible', 'adaptable', 'proactive', 'innovative', 'creative',
    
    # Corporate buzzwords
    'synergy', 'leverage', 'paradigm', 'dynamic', 'disruptive', 'agile',
    'strategic', 'tactical', 'holistic', 'best practices', 'world class',
    'cutting edge', 'state of the art', 'industry leading',
    
    # Vague descriptors
    'excellent', 'strong', 'good', 'great', 'outstanding', 'exceptional',
    'proven', 'demonstrated', 'extensive', 'comprehensive', 'thorough',
    
    # Generic work terms
    'work', 'working', 'experience', 'years', 'position', 'role',
    'responsibilities', 'duties', 'tasks', 'job', 'opportunity',
}

# Stop words (common English words with no meaning)
STOP_WORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
}


# ============================================================================
# DOMAIN-SPECIFIC KEYWORDS - Terms that ARE meaningful
# ============================================================================

TECHNICAL_KEYWORDS = {
    # Software/IT
    'python', 'java', 'javascript', 'sql', 'database', 'api', 'cloud',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'linux', 'windows',
    
    # Office/Admin
    'microsoft office', 'ms office', 'excel', 'word', 'powerpoint',
    'scheduling', 'calendar management', 'phone systems', 'reception',
    'filing', 'data entry', 'bookkeeping', 'invoicing',
    
    # Education
    'curriculum', 'lesson planning', 'classroom management', 'assessment',
    'pedagogy', 'teaching methods', 'student engagement', 'grading',
    
    # Healthcare
    'patient care', 'medical records', 'vital signs', 'medication',
    'diagnosis', 'treatment', 'nursing', 'clinical',
    
    # Trades
    'welding', 'plumbing', 'electrical', 'hvac', 'carpentry', 'masonry',
    'pipe fitting', 'wiring', 'installation', 'repair', 'maintenance',
    
    # Hospitality
    'food service', 'customer service', 'front desk', 'reservations',
    'housekeeping', 'catering', 'menu planning', 'inventory management',
}


class KeywordExtractor:
    """
    Extracts meaningful keywords from text while filtering out fluff.
    
    Methods:
    --------
    extract_from_job_description(text: str) -> List[str]
        Extracts job-specific keywords from job posting
        
    extract_from_cv_section(text: str) -> List[str]
        Extracts relevant skills and experience from CV
        
    is_meaningful_keyword(keyword: str) -> bool
        Determines if a keyword is job-specific or generic fluff
    """
    
    def __init__(self):
        self.technical_keywords = TECHNICAL_KEYWORDS
        self.fluff_words = GENERIC_SOFT_SKILLS
        self.stop_words = STOP_WORDS
    
    
    def extract_keywords(self, text: str, min_length: int = 3) -> List[str]:
        """
        Extract meaningful keywords from any text.
        
        Process:
        1. Convert to lowercase
        2. Extract n-grams (1-3 words)
        3. Filter out stop words and fluff
        4. Keep only meaningful terms
        
        Args:
            text: Input text to extract keywords from
            min_length: Minimum keyword length (default: 3 characters)
            
        Returns:
            List of meaningful keywords
        """
        if not text:
            return []
        
        # Clean and lowercase
        text = text.lower().strip()
        
        # Extract both single words and phrases
        keywords = []
        
        # Get multi-word phrases (2-3 words)
        keywords.extend(self._extract_phrases(text))
        
        # Get single words
        words = re.findall(r'\b[a-z]+\b', text)
        keywords.extend([w for w in words if len(w) >= min_length])
        
        # Filter out fluff and stop words
        meaningful_keywords = [
            kw for kw in keywords 
            if self.is_meaningful_keyword(kw)
        ]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = []
        for kw in meaningful_keywords:
            if kw not in seen:
                seen.add(kw)
                unique_keywords.append(kw)
        
        return unique_keywords
    
    
    def _extract_phrases(self, text: str) -> List[str]:
        """Extract 2-3 word phrases from text."""
        words = re.findall(r'\b[a-z]+\b', text.lower())
        phrases = []
        
        # 2-word phrases
        for i in range(len(words) - 1):
            phrase = f"{words[i]} {words[i+1]}"
            phrases.append(phrase)
        
        # 3-word phrases
        for i in range(len(words) - 2):
            phrase = f"{words[i]} {words[i+1]} {words[i+2]}"
            phrases.append(phrase)
        
        return phrases
    
    
    def is_meaningful_keyword(self, keyword: str) -> bool:
        """
        Determine if a keyword is meaningful or just fluff.
        
        A keyword is meaningful if:
        1. Not a stop word
        2. Not generic fluff
        3. Either technical or domain-specific
        4. Long enough (>2 chars for single words)
        
        Args:
            keyword: Keyword to evaluate
            
        Returns:
            True if meaningful, False if fluff
        """
        keyword = keyword.lower().strip()
        
        # Too short
        if len(keyword) < 3 and ' ' not in keyword:
            return False
        
        # Stop word
        if keyword in self.stop_words:
            return False
        
        # Generic fluff
        if keyword in self.fluff_words:
            return False
        
        # Known technical keyword
        if keyword in self.technical_keywords:
            return True
        
        # Contains numbers (likely technical: "5 years", "level 3")
        if any(char.isdigit() for char in keyword):
            return True
        
        # Phrases are usually more meaningful than single generic words
        if ' ' in keyword:
            return True
        
        # Default: keep it (conservative approach)
        return True
    
    
    def extract_from_job_description(self, job_description: str, 
                                     required_skills: str = None,
                                     preferred_skills: str = None) -> Dict[str, List[str]]:
        """
        Extract keywords from job posting components.
        
        Args:
            job_description: Main job description text
            required_skills: Required skills (comma-separated)
            preferred_skills: Preferred skills (comma-separated)
            
        Returns:
            Dictionary with categorized keywords:
            {
                'description_keywords': [...],
                'required_skills': [...],
                'preferred_skills': [...],
                'all_keywords': [...]  # Combined unique list
            }
        """
        result = {
            'description_keywords': [],
            'required_skills': [],
            'preferred_skills': [],
            'all_keywords': []
        }
        
        # Extract from main description
        if job_description:
            result['description_keywords'] = self.extract_keywords(job_description)
        
        # Parse skills lists
        if required_skills:
            skills = [s.strip() for s in required_skills.split(',')]
            result['required_skills'] = [
                s.lower() for s in skills 
                if self.is_meaningful_keyword(s)
            ]
        
        if preferred_skills:
            skills = [s.strip() for s in preferred_skills.split(',')]
            result['preferred_skills'] = [
                s.lower() for s in skills 
                if self.is_meaningful_keyword(s)
            ]
        
        # Combine all unique keywords
        all_kw = (result['description_keywords'] + 
                  result['required_skills'] + 
                  result['preferred_skills'])
        
        result['all_keywords'] = list(dict.fromkeys(all_kw))  # Remove duplicates
        
        return result
    
    
    def extract_from_cv(self, technical_skills: str = None,
                       soft_skills: str = None,
                       experience_description: str = None) -> Dict[str, List[str]]:
        """
        Extract keywords from CV components.
        
        Args:
            technical_skills: Technical skills (comma-separated)
            soft_skills: Soft skills (comma-separated)
            experience_description: Work experience description
            
        Returns:
            Dictionary with categorized keywords:
            {
                'technical_keywords': [...],
                'soft_keywords': [...],
                'experience_keywords': [...],
                'all_keywords': [...]
            }
        """
        result = {
            'technical_keywords': [],
            'soft_keywords': [],
            'experience_keywords': [],
            'all_keywords': []
        }
        
        # Technical skills (keep most)
        if technical_skills:
            skills = [s.strip() for s in technical_skills.split(',')]
            result['technical_keywords'] = [
                s.lower() for s in skills 
                if self.is_meaningful_keyword(s)
            ]
        
        # Soft skills (filter heavily)
        if soft_skills:
            skills = [s.strip() for s in soft_skills.split(',')]
            # Only keep soft skills that aren't pure fluff
            result['soft_keywords'] = [
                s.lower() for s in skills 
                if self.is_meaningful_keyword(s) and s.lower() not in self.fluff_words
            ]
        
        # Experience description
        if experience_description:
            result['experience_keywords'] = self.extract_keywords(experience_description)
        
        # Combine all unique keywords
        all_kw = (result['technical_keywords'] + 
                  result['soft_keywords'] + 
                  result['experience_keywords'])
        
        result['all_keywords'] = list(dict.fromkeys(all_kw))
        
        return result
    
    
    def get_keyword_frequency(self, texts: List[str]) -> Dict[str, int]:
        """
        Calculate keyword frequency across multiple documents.
        Used for TF-IDF-style weighting later.
        
        Args:
            texts: List of text documents
            
        Returns:
            Dictionary mapping keywords to their frequency count
        """
        all_keywords = []
        for text in texts:
            all_keywords.extend(self.extract_keywords(text))
        
        return dict(Counter(all_keywords))


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    extractor = KeywordExtractor()
    
    # Test with job description
    job_desc = """
    We are seeking a highly motivated and passionate teacher to join our team.
    The ideal candidate will have excellent communication skills and be a team player.
    
    Required: Mathematics teaching, classroom management, lesson planning, assessment.
    Preferred: Cambridge curriculum experience, computer literacy.
    """
    
    job_keywords = extractor.extract_from_job_description(
        job_desc,
        required_skills="Mathematics teaching, Classroom management, Lesson planning",
        preferred_skills="Cambridge curriculum, Computer literacy"
    )
    
    print("=" * 80)
    print("JOB KEYWORDS EXTRACTION")
    print("=" * 80)
    print(f"Description keywords: {job_keywords['description_keywords'][:10]}")
    print(f"Required skills: {job_keywords['required_skills']}")
    print(f"Preferred skills: {job_keywords['preferred_skills']}")
    print(f"Total unique: {len(job_keywords['all_keywords'])} keywords")
    
    # Test with CV
    cv_tech = "Python, SQL, Data Analysis, Microsoft Office"
    cv_soft = "Communication, Team Player, Problem Solving, Motivated"
    
    cv_keywords = extractor.extract_from_cv(
        technical_skills=cv_tech,
        soft_skills=cv_soft
    )
    
    print("\n" + "=" * 80)
    print("CV KEYWORDS EXTRACTION")
    print("=" * 80)
    print(f"Technical: {cv_keywords['technical_keywords']}")
    print(f"Soft (filtered): {cv_keywords['soft_keywords']}")
    print(f"Total kept: {len(cv_keywords['all_keywords'])} keywords")
