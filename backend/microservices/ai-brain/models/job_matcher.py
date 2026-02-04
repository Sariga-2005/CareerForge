import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
import logging

logger = logging.getLogger('ai-brain')

class JobMatcher:
    """
    Advanced job matching using NLP and ML techniques
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words='english'
        )
        self.skill_weights = {
            'exact_match': 2.0,
            'partial_match': 1.0,
            'experience': 1.5,
            'education': 1.2,
            'location': 0.8
        }
    
    def calculate_match_score(self, student_profile: Dict[str, Any], job: Dict[str, Any]) -> float:
        """
        Calculate comprehensive match score between student and job
        """
        try:
            # Skills matching
            skills_score = self._calculate_skills_match(
                student_profile.get('skills', []),
                job.get('required_skills', [])
            )
            
            # Experience matching
            experience_score = self._calculate_experience_match(
                student_profile.get('experience', 0),
                job.get('min_experience', 0),
                job.get('max_experience', 10)
            )
            
            # Education matching
            education_score = self._calculate_education_match(
                student_profile.get('education', ''),
                job.get('required_education', '')
            )
            
            # Text similarity (resume vs job description)
            text_similarity = self._calculate_text_similarity(
                student_profile.get('resume_text', ''),
                job.get('description', '')
            )
            
            # Weighted combination
            total_score = (
                skills_score * 0.4 +
                experience_score * 0.25 +
                education_score * 0.15 +
                text_similarity * 0.2
            )
            
            return min(total_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating match score: {str(e)}")
            return 0.0
    
    def _calculate_skills_match(self, student_skills: List[str], required_skills: List[str]) -> float:
        """Calculate skills match score"""
        if not student_skills or not required_skills:
            return 0.0
        
        student_skills_lower = [s.lower() for s in student_skills]
        required_skills_lower = [s.lower() for s in required_skills]
        
        matched_skills = set(student_skills_lower) & set(required_skills_lower)
        
        if len(required_skills) == 0:
            return 0.0
        
        return len(matched_skills) / len(required_skills)
    
    def _calculate_experience_match(self, student_exp: float, min_exp: float, max_exp: float) -> float:
        """Calculate experience match score"""
        if student_exp < min_exp:
            # Penalize below minimum
            return max(0.0, 1.0 - (min_exp - student_exp) * 0.2)
        elif student_exp > max_exp:
            # Slight penalty for overqualification
            return max(0.7, 1.0 - (student_exp - max_exp) * 0.1)
        else:
            return 1.0
    
    def _calculate_education_match(self, student_edu: str, required_edu: str) -> float:
        """Calculate education match score"""
        education_hierarchy = {
            'phd': 5,
            'doctorate': 5,
            'masters': 4,
            'mba': 4,
            'bachelors': 3,
            'diploma': 2,
            'high school': 1
        }
        
        student_level = 0
        required_level = 0
        
        student_edu_lower = student_edu.lower()
        required_edu_lower = required_edu.lower()
        
        for edu, level in education_hierarchy.items():
            if edu in student_edu_lower:
                student_level = max(student_level, level)
            if edu in required_edu_lower:
                required_level = max(required_level, level)
        
        if student_level >= required_level:
            return 1.0
        else:
            return max(0.0, student_level / required_level if required_level > 0 else 0.5)
    
    def _calculate_text_similarity(self, student_text: str, job_text: str) -> float:
        """Calculate text similarity using TF-IDF and cosine similarity"""
        if not student_text or not job_text:
            return 0.0
        
        try:
            vectors = self.vectorizer.fit_transform([student_text, job_text])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating text similarity: {str(e)}")
            return 0.0
    
    def rank_jobs(self, student_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank jobs based on match scores
        """
        scored_jobs = []
        
        for job in jobs:
            score = self.calculate_match_score(student_profile, job)
            scored_jobs.append({
                **job,
                'match_score': score,
                'match_percentage': round(score * 100, 2)
            })
        
        # Sort by match score (descending)
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return scored_jobs
