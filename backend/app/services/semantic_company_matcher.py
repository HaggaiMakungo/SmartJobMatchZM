"""
Semantic Company Name Matcher
Uses sentence-transformers to match company name variations

Example:
- "ZESCO" matches "Zambia Electricity Supply Corporation"
- "MTN" matches "MTN Zambia"
- "Shoprite" matches "Shoprite Checkers"
"""
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Tuple
import numpy as np


class SemanticCompanyMatcher:
    """
    Match company names semantically using transformer embeddings
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', similarity_threshold: float = 0.70):
        """
        Initialize the semantic company matcher
        
        Args:
            model_name: Sentence transformer model to use
            similarity_threshold: Minimum similarity score (0-1) to consider a match
        """
        print(f"🏢 Loading semantic company matcher ({model_name})...")
        self.model = SentenceTransformer(model_name)
        self.similarity_threshold = similarity_threshold
        print("✅ Semantic company matcher ready!")
    
    def normalize_company_name(self, company: str) -> str:
        """
        Normalize company name for better matching
        
        Examples:
        - "ZESCO LIMITED" -> "zesco"
        - "MTN Zambia Ltd." -> "mtn zambia"
        - "Shoprite Holdings" -> "shoprite"
        """
        if not company:
            return ""
        
        # Convert to lowercase
        normalized = company.lower()
        
        # Remove common suffixes
        suffixes = [
            'limited', 'ltd', 'ltd.', 'plc', 'inc', 'inc.', 'corp', 'corporation',
            'holdings', 'group', 'zambia', 'zm', '(zambia)', 'pty'
        ]
        
        for suffix in suffixes:
            normalized = normalized.replace(f' {suffix}', '')
            normalized = normalized.replace(f'({suffix})', '')
        
        # Remove special characters
        normalized = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in normalized)
        
        # Remove extra spaces
        normalized = ' '.join(normalized.split())
        
        return normalized.strip()
    
    def compute_similarity(self, company1: str, company2: str) -> float:
        """
        Compute semantic similarity between two company names
        
        Returns:
            Similarity score between 0 and 1
        """
        # Normalize first
        norm1 = self.normalize_company_name(company1)
        norm2 = self.normalize_company_name(company2)
        
        # Quick exact match check
        if norm1 == norm2:
            return 1.0
        
        # Check if one is substring of other (e.g., "ZESCO" in "ZESCO Limited")
        if norm1 in norm2 or norm2 in norm1:
            return 0.95
        
        # Compute semantic similarity
        embeddings = self.model.encode([norm1, norm2])
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        return float(similarity)
    
    def matches(self, company1: str, company2: str) -> bool:
        """
        Check if two company names match
        
        Args:
            company1: First company name
            company2: Second company name
        
        Returns:
            True if companies match (similarity >= threshold)
        """
        similarity = self.compute_similarity(company1, company2)
        return similarity >= self.similarity_threshold
    
    def find_matching_companies(
        self, 
        target_company: str, 
        company_list: List[str],
        top_k: int = 5
    ) -> List[Tuple[str, float]]:
        """
        Find all companies that match the target company
        
        Args:
            target_company: Company name to match against
            company_list: List of company names to search
            top_k: Return top K matches
        
        Returns:
            List of (company_name, similarity_score) tuples, sorted by score
        """
        matches = []
        
        for company in company_list:
            similarity = self.compute_similarity(target_company, company)
            if similarity >= self.similarity_threshold:
                matches.append((company, similarity))
        
        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches[:top_k]
    
    def get_canonical_name(
        self,
        company: str,
        company_list: List[str]
    ) -> Optional[str]:
        """
        Get the canonical (most common) name for a company
        
        Useful for normalizing variations to a single name
        
        Args:
            company: Company name to find canonical for
            company_list: List of all company names in database
        
        Returns:
            Most common matching company name, or None if no match
        """
        matches = self.find_matching_companies(company, company_list, top_k=10)
        
        if not matches:
            return None
        
        # Return the name with highest similarity
        return matches[0][0]


# Example usage and testing
if __name__ == "__main__":
    print("\n" + "="*70)
    print("🧪 TESTING SEMANTIC COMPANY MATCHER")
    print("="*70 + "\n")
    
    # Initialize matcher
    matcher = SemanticCompanyMatcher(similarity_threshold=0.70)
    
    # Test cases
    test_cases = [
        ("ZESCO", "Zambia Electricity Supply Corporation"),
        ("ZESCO", "ZESCO Limited"),
        ("ZESCO", "Zesco"),
        ("MTN", "MTN Zambia"),
        ("MTN Zambia", "MTN"),
        ("Shoprite", "Shoprite Checkers"),
        ("Shoprite", "Shoprite Holdings Zambia"),
        ("FQM", "First Quantum Minerals"),  # Should NOT match (different)
        ("Zanaco", "Zambia National Commercial Bank"),
        ("ZNBC", "Zambia National Broadcasting Corporation"),
    ]
    
    print("Test Results:\n")
    for company1, company2 in test_cases:
        similarity = matcher.compute_similarity(company1, company2)
        matches = matcher.matches(company1, company2)
        status = "✅ MATCH" if matches else "❌ NO MATCH"
        
        print(f"{status}")
        print(f"   '{company1}' vs '{company2}'")
        print(f"   Similarity: {similarity:.2f} (threshold: {matcher.similarity_threshold})")
        print()
    
    # Test find_matching_companies
    print("="*70)
    print("🔍 FINDING ZESCO VARIATIONS")
    print("="*70 + "\n")
    
    all_companies = [
        "ZESCO",
        "ZESCO Limited",
        "Zambia Electricity Supply Corporation",
        "Zambia Electricity Supply Corporation (ZESCO)",
        "Zesco",
        "MTN Zambia",  # Should not match
        "Shoprite",    # Should not match
    ]
    
    matches = matcher.find_matching_companies("ZESCO", all_companies)
    
    print("Matches for 'ZESCO':")
    for company, score in matches:
        print(f"   • {company} (similarity: {score:.2f})")
