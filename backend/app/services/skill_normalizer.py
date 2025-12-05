"""
CAMSS 2.0 - Skill Normalizer (Phase 1)
=======================================
Normalizes skills by grouping synonyms and creating semantic clusters.
Solves the problem of "MS Office" vs "Microsoft Office" vs "Office Suite".

Academic Context:
-----------------
Implements:
- Lexical normalization
- Synonym mapping
- Semantic clustering
- Fuzzy string matching

Purpose:
--------
Reduce matching failures caused by linguistic variation.
Group related skills into coherent clusters for better matching.
"""

from typing import List, Set, Dict, Tuple
import re
from difflib import SequenceMatcher


# ============================================================================
# SKILL CLUSTERS - Semantic groupings of related skills
# ============================================================================

SKILL_CLUSTERS = {
    # ==================== OFFICE & ADMINISTRATIVE ====================
    'productivity_tools': {
        'canonical': 'Microsoft Office Suite',
        'synonyms': [
            'microsoft office', 'ms office', 'office suite', 'office 365',
            'excel', 'word', 'powerpoint', 'outlook', 'ms excel', 'ms word',
            'google workspace', 'google docs', 'google sheets', 'g suite'
        ]
    },
    
    'administrative_support': {
        'canonical': 'Administrative Support',
        'synonyms': [
            'admin support', 'office administration', 'clerical work',
            'administrative duties', 'office management', 'admin tasks'
        ]
    },
    
    'reception_skills': {
        'canonical': 'Reception & Front Desk',
        'synonyms': [
            'reception', 'receptionist', 'front desk', 'front office',
            'visitor management', 'phone handling', 'call management'
        ]
    },
    
    'scheduling': {
        'canonical': 'Scheduling & Calendar Management',
        'synonyms': [
            'scheduling', 'calendar management', 'appointment booking',
            'meeting coordination', 'diary management', 'time management'
        ]
    },
    
    # ==================== TEACHING & EDUCATION ====================
    'teaching_methods': {
        'canonical': 'Teaching Methodology',
        'synonyms': [
            'teaching', 'instruction', 'pedagogy', 'teaching methods',
            'instructional methods', 'educational methods', 'didactics'
        ]
    },
    
    'classroom_management': {
        'canonical': 'Classroom Management',
        'synonyms': [
            'classroom management', 'class management', 'student management',
            'behavior management', 'discipline', 'classroom control'
        ]
    },
    
    'curriculum_development': {
        'canonical': 'Curriculum Development',
        'synonyms': [
            'curriculum development', 'curriculum design', 'curriculum planning',
            'lesson planning', 'course design', 'syllabus development'
        ]
    },
    
    'assessment': {
        'canonical': 'Student Assessment',
        'synonyms': [
            'assessment', 'evaluation', 'grading', 'testing', 'examination',
            'student evaluation', 'marking', 'academic assessment'
        ]
    },
    
    # ==================== IT & TECHNOLOGY ====================
    'programming': {
        'canonical': 'Software Development',
        'synonyms': [
            'programming', 'coding', 'software development', 'software engineering',
            'development', 'developer', 'programmer', 'coding skills'
        ]
    },
    
    'database_management': {
        'canonical': 'Database Management',
        'synonyms': [
            'database', 'sql', 'mysql', 'postgresql', 'database management',
            'database administration', 'dbms', 'rdbms', 'data management'
        ]
    },
    
    'it_support': {
        'canonical': 'IT Support',
        'synonyms': [
            'it support', 'technical support', 'tech support', 'helpdesk',
            'help desk', 'desktop support', 'user support'
        ]
    },
    
    # ==================== HOSPITALITY ====================
    'hotel_operations': {
        'canonical': 'Hotel Operations',
        'synonyms': [
            'hotel operations', 'hospitality management', 'hotel management',
            'guest services', 'hotel services', 'lodging operations'
        ]
    },
    
    'food_service': {
        'canonical': 'Food & Beverage Service',
        'synonyms': [
            'food service', 'food and beverage', 'f&b', 'restaurant service',
            'catering', 'food preparation', 'culinary service'
        ]
    },
    
    # ==================== CUSTOMER SERVICE ====================
    'customer_service': {
        'canonical': 'Customer Service',
        'synonyms': [
            'customer service', 'client service', 'customer care', 'client relations',
            'customer support', 'customer relations', 'client care'
        ]
    },
    
    # ==================== SOFT SKILLS ====================
    'communication': {
        'canonical': 'Communication',
        'synonyms': [
            'communication', 'verbal communication', 'written communication',
            'interpersonal communication', 'communication skills'
        ]
    },
    
    'problem_solving': {
        'canonical': 'Problem Solving',
        'synonyms': [
            'problem solving', 'problem-solving', 'troubleshooting',
            'analytical thinking', 'critical thinking', 'issue resolution'
        ]
    },
    
    'time_management': {
        'canonical': 'Time Management',
        'synonyms': [
            'time management', 'time-management', 'prioritization',
            'task management', 'deadline management', 'organization'
        ]
    },
    
    'teamwork': {
        'canonical': 'Teamwork',
        'synonyms': [
            'teamwork', 'team collaboration', 'collaboration',
            'team player', 'cooperative', 'team building'
        ]
    },
    
    # ==================== TRADES ====================
    'plumbing': {
        'canonical': 'Plumbing',
        'synonyms': [
            'plumbing', 'pipe fitting', 'pipe installation', 'pipework',
            'water systems', 'drainage', 'sanitation systems'
        ]
    },
    
    'electrical': {
        'canonical': 'Electrical Work',
        'synonyms': [
            'electrical', 'electrical work', 'electrical installation',
            'wiring', 'electrical systems', 'electrician'
        ]
    },
    
    'welding': {
        'canonical': 'Welding',
        'synonyms': [
            'welding', 'metal joining', 'arc welding', 'mig welding',
            'tig welding', 'fabrication', 'metal fabrication'
        ]
    },
    
    # ==================== HEALTHCARE ====================
    'patient_care': {
        'canonical': 'Patient Care',
        'synonyms': [
            'patient care', 'nursing care', 'clinical care', 'patient support',
            'bedside care', 'direct care', 'patient assistance'
        ]
    },
    
    'medical_records': {
        'canonical': 'Medical Records Management',
        'synonyms': [
            'medical records', 'health records', 'patient records',
            'medical documentation', 'health information', 'emr', 'ehr'
        ]
    },
    
    # ==================== FINANCE ====================
    'accounting': {
        'canonical': 'Accounting',
        'synonyms': [
            'accounting', 'bookkeeping', 'financial accounting',
            'accounts', 'financial records', 'ledger management'
        ]
    },
    
    'financial_analysis': {
        'canonical': 'Financial Analysis',
        'synonyms': [
            'financial analysis', 'financial planning', 'budgeting',
            'financial management', 'budget management', 'fiscal planning'
        ]
    },
    
    # ==================== LOGISTICS & SUPPLY CHAIN ====================
    'logistics_management': {
        'canonical': 'Logistics Management',
        'synonyms': [
            'logistics', 'logistics management', 'logistics coordination',
            'logistics operations', 'transportation logistics', 'freight management'
        ]
    },
    
    'supply_chain': {
        'canonical': 'Supply Chain Management',
        'synonyms': [
            'supply chain', 'supply chain management', 'supply chain operations',
            'supply chain knowledge', 'supply chain coordination', 'scm'
        ]
    },
    
    'inventory_management': {
        'canonical': 'Inventory Management',
        'synonyms': [
            'inventory', 'inventory management', 'inventory control',
            'stock management', 'warehouse management', 'stock control'
        ]
    },
    
    'procurement': {
        'canonical': 'Procurement',
        'synonyms': [
            'procurement', 'purchasing', 'sourcing', 'vendor management',
            'supplier management', 'buying', 'purchase management'
        ]
    },
    
    'route_planning': {
        'canonical': 'Route Planning',
        'synonyms': [
            'route planning', 'route optimization', 'route management',
            'transportation planning', 'delivery planning', 'dispatch'
        ]
    },
    
    'transportation': {
        'canonical': 'Transportation Management',
        'synonyms': [
            'transportation', 'transport management', 'fleet management',
            'vehicle management', 'delivery management', 'distribution'
        ]
    },
}


# ============================================================================
# SKILL NORMALIZER CLASS
# ============================================================================

class SkillNormalizer:
    """
    Normalizes skills to canonical forms and groups them into clusters.
    
    Methods:
    --------
    normalize_skill(skill: str) -> str
        Converts skill to canonical form
        
    get_skill_cluster(skill: str) -> str
        Returns the cluster name for a skill
        
    normalize_skill_list(skills: List[str]) -> Dict
        Normalizes a list of skills with cluster information
    """
    
    def __init__(self):
        self.clusters = SKILL_CLUSTERS
        
        # Build reverse lookup: synonym -> (cluster_name, canonical)
        self.synonym_map = {}
        for cluster_name, cluster_data in self.clusters.items():
            canonical = cluster_data['canonical']
            synonyms = cluster_data['synonyms']
            
            # Map each synonym to its cluster
            for synonym in synonyms:
                self.synonym_map[synonym.lower()] = (cluster_name, canonical)
    
    
    def normalize_skill(self, skill: str) -> str:
        """
        Normalize a skill to its canonical form.
        
        Process:
        1. Clean and lowercase
        2. Check exact match in synonym map
        3. Check fuzzy match (>0.85 similarity)
        4. Return canonical form or original
        
        Args:
            skill: Raw skill string
            
        Returns:
            Canonical form or original if no match
        """
        if not skill:
            return ""
        
        cleaned = skill.lower().strip()
        
        # Exact match
        if cleaned in self.synonym_map:
            _, canonical = self.synonym_map[cleaned]
            return canonical
        
        # Fuzzy match
        best_match = None
        best_score = 0.85  # Threshold for fuzzy matching
        
        for synonym, (cluster_name, canonical) in self.synonym_map.items():
            similarity = SequenceMatcher(None, cleaned, synonym).ratio()
            if similarity > best_score:
                best_score = similarity
                best_match = canonical
        
        return best_match if best_match else skill.title()
    
    
    def get_skill_cluster(self, skill: str) -> str:
        """
        Get the cluster name for a skill.
        
        Args:
            skill: Skill string
            
        Returns:
            Cluster name or 'unclustered'
        """
        cleaned = skill.lower().strip()
        
        # Exact match
        if cleaned in self.synonym_map:
            cluster_name, _ = self.synonym_map[cleaned]
            return cluster_name
        
        # Fuzzy match
        best_match = None
        best_score = 0.85
        
        for synonym, (cluster_name, _) in self.synonym_map.items():
            similarity = SequenceMatcher(None, cleaned, synonym).ratio()
            if similarity > best_score:
                best_score = similarity
                best_match = cluster_name
        
        return best_match if best_match else 'unclustered'
    
    
    def normalize_skill_list(self, skills: List[str]) -> Dict[str, any]:
        """
        Normalize a list of skills with full details.
        
        Args:
            skills: List of raw skill strings
            
        Returns:
            Dictionary with:
            {
                'original': [...],
                'normalized': [...],
                'clusters': {...},
                'cluster_count': int
            }
        """
        if not skills:
            return {
                'original': [],
                'normalized': [],
                'clusters': {},
                'cluster_count': 0
            }
        
        normalized = []
        clusters = {}
        
        for skill in skills:
            if not skill or not skill.strip():
                continue
            
            norm_skill = self.normalize_skill(skill)
            cluster = self.get_skill_cluster(skill)
            
            normalized.append(norm_skill)
            
            if cluster not in clusters:
                clusters[cluster] = []
            clusters[cluster].append(norm_skill)
        
        return {
            'original': skills,
            'normalized': normalized,
            'clusters': clusters,
            'cluster_count': len(clusters)
        }
    
    
    def calculate_cluster_overlap(self, skills1: List[str], 
                                  skills2: List[str]) -> Dict[str, float]:
        """
        Calculate skill overlap at the cluster level.
        More sophisticated than exact string matching.
        
        Args:
            skills1: First skill list
            skills2: Second skill list
            
        Returns:
            Dictionary with overlap statistics:
            {
                'cluster_overlap_count': int,
                'cluster_overlap_score': float (0-1),
                'shared_clusters': [...]
            }
        """
        # Get clusters for each skill list
        clusters1 = set()
        for skill in skills1:
            cluster = self.get_skill_cluster(skill)
            if cluster != 'unclustered':
                clusters1.add(cluster)
        
        clusters2 = set()
        for skill in skills2:
            cluster = self.get_skill_cluster(skill)
            if cluster != 'unclustered':
                clusters2.add(cluster)
        
        # Calculate overlap
        shared = clusters1 & clusters2
        total = clusters1 | clusters2
        
        overlap_score = len(shared) / len(total) if total else 0.0
        
        return {
            'cluster_overlap_count': len(shared),
            'cluster_overlap_score': overlap_score,
            'shared_clusters': list(shared),
            'candidate_clusters': list(clusters1),
            'job_clusters': list(clusters2)
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    normalizer = SkillNormalizer()
    
    # Test normalization
    test_skills = [
        "Microsoft Office",
        "MS Office",
        "Excel",
        "office 365",
        "Teaching",
        "Classroom Management",
        "Lesson Planning",
        "SQL",
        "Database Management"
    ]
    
    print("=" * 80)
    print("SKILL NORMALIZATION TEST")
    print("=" * 80)
    
    for skill in test_skills:
        normalized = normalizer.normalize_skill(skill)
        cluster = normalizer.get_skill_cluster(skill)
        print(f"{skill:30} → {normalized:35} [{cluster}]")
    
    # Test cluster overlap
    print("\n" + "=" * 80)
    print("CLUSTER OVERLAP TEST")
    print("=" * 80)
    
    teacher_skills = [
        "Mathematics Teaching", "Classroom Management", "Lesson Planning",
        "Assessment", "Communication", "MS Office"
    ]
    
    job_skills = [
        "Teaching", "Class Management", "Curriculum Design",
        "Student Evaluation", "Microsoft Office"
    ]
    
    overlap = normalizer.calculate_cluster_overlap(teacher_skills, job_skills)
    
    print(f"Teacher clusters: {overlap['candidate_clusters']}")
    print(f"Job clusters: {overlap['job_clusters']}")
    print(f"Shared clusters: {overlap['shared_clusters']}")
    print(f"Overlap score: {overlap['cluster_overlap_score']:.2%}")
