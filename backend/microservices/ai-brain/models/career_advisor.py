from groq import Groq
from typing import List, Dict, Any
import logging
from config.settings import Config

logger = logging.getLogger('ai-brain')

class CareerAdvisor:
    """
    AI-powered career path advisor using Groq AI
    """
    
    def __init__(self):
        self.client = Groq(api_key=Config.GROQ_API_KEY)
        self.model = Config.GROQ_MODEL
    
    def generate_career_path(self, student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized career path recommendations
        """
        try:
            prompt = self._build_career_path_prompt(student_profile)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert career advisor for students and professionals. Always respond with valid JSON only, no markdown."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4096
            )
            
            career_advice = response.choices[0].message.content.strip()
            
            # Clean up markdown code blocks if present
            if career_advice.startswith('```'):
                import re
                career_advice = re.sub(r'^```json?\s*', '', career_advice)
                career_advice = re.sub(r'\s*```$', '', career_advice)
            
            import json
            career_path = json.loads(career_advice)
            
            return {
                'success': True,
                'career_path': career_path,
                'raw_advice': career_advice
            }
            
        except Exception as e:
            logger.error(f"Error generating career path: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_career_path_prompt(self, profile: Dict[str, Any]) -> str:
        """Build prompt for career path generation"""
        
        skills = ', '.join(profile.get('skills', []))
        education = profile.get('education', 'Not specified')
        experience = profile.get('experience', 0)
        interests = ', '.join(profile.get('interests', []))
        career_goals = ', '.join(profile.get('career_goals', []))
        
        prompt = f"""
Based on the following student profile, provide a detailed 5-year career path.

Education: {education}
Skills: {skills}
Years of Experience: {experience}
Interests: {interests}
Career Goals: {career_goals}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
    "current_position": "their likely current role based on profile",
    "milestones": [
        {{
            "year": 1,
            "role": "Job title for year 1",
            "skills_to_acquire": ["skill1", "skill2", "skill3"],
            "expected_salary": "salary range in INR like 5-8 LPA",
            "key_activities": ["activity1", "activity2", "activity3"]
        }},
        {{
            "year": 2,
            "role": "Job title for year 2",
            "skills_to_acquire": ["skill1", "skill2"],
            "expected_salary": "salary range",
            "key_activities": ["activity1", "activity2"]
        }},
        {{
            "year": 3,
            "role": "Job title for year 3",
            "skills_to_acquire": ["skill1", "skill2"],
            "expected_salary": "salary range",
            "key_activities": ["activity1", "activity2"]
        }},
        {{
            "year": 4,
            "role": "Job title for year 4",
            "skills_to_acquire": ["skill1", "skill2"],
            "expected_salary": "salary range",
            "key_activities": ["activity1", "activity2"]
        }},
        {{
            "year": 5,
            "role": "Job title for year 5",
            "skills_to_acquire": ["skill1", "skill2"],
            "expected_salary": "salary range",
            "key_activities": ["activity1", "activity2"]
        }}
    ],
    "industry_recommendations": ["industry1", "industry2", "industry3"],
    "skill_gaps": ["missing skill 1", "missing skill 2", "missing skill 3"],
    "immediate_actions": ["action 1 to take now", "action 2 to take now", "action 3 to take now"]
}}
"""
        return prompt
    
    def analyze_skill_gap(self, student_skills: List[str], target_role: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze skill gaps between student's current skills and target role
        """
        try:
            required_skills = target_role.get('required_skills', [])
            student_skills_lower = [s.lower() for s in student_skills]
            required_skills_lower = [s.lower() for s in required_skills]
            
            # Find matching and missing skills
            matching_skills = list(set(student_skills_lower) & set(required_skills_lower))
            missing_skills = list(set(required_skills_lower) - set(student_skills_lower))
            
            # Calculate readiness score
            if len(required_skills) > 0:
                readiness_score = len(matching_skills) / len(required_skills)
            else:
                readiness_score = 0.0
            
            # Generate learning recommendations
            learning_path = self._generate_learning_path(missing_skills)
            
            return {
                'success': True,
                'matching_skills': matching_skills,
                'missing_skills': missing_skills,
                'readiness_score': round(readiness_score * 100, 2),
                'learning_path': learning_path,
                'estimated_time_to_ready': self._estimate_learning_time(missing_skills)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing skill gap: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_learning_path(self, missing_skills: List[str]) -> List[Dict[str, Any]]:
        """Generate learning recommendations for missing skills"""
        
        learning_resources = {
            'python': {'platform': 'Coursera', 'duration': '4-6 weeks'},
            'javascript': {'platform': 'freeCodeCamp', 'duration': '3-4 weeks'},
            'react': {'platform': 'Udemy', 'duration': '4-5 weeks'},
            'node.js': {'platform': 'Pluralsight', 'duration': '3-4 weeks'},
            'sql': {'platform': 'DataCamp', 'duration': '2-3 weeks'},
            'docker': {'platform': 'Docker Documentation', 'duration': '2 weeks'},
            'aws': {'platform': 'AWS Training', 'duration': '6-8 weeks'},
            'machine learning': {'platform': 'Coursera', 'duration': '8-12 weeks'},
        }
        
        learning_path = []
        for skill in missing_skills:
            skill_lower = skill.lower()
            resource = learning_resources.get(skill_lower, {
                'platform': 'Online tutorials',
                'duration': '3-4 weeks'
            })
            
            learning_path.append({
                'skill': skill,
                'recommended_platform': resource['platform'],
                'estimated_duration': resource['duration'],
                'priority': 'high' if skill_lower in ['python', 'javascript', 'sql'] else 'medium'
            })
        
        return learning_path
    
    def _estimate_learning_time(self, missing_skills: List[str]) -> str:
        """Estimate total time needed to acquire missing skills"""
        
        if len(missing_skills) == 0:
            return "You're ready now!"
        elif len(missing_skills) <= 3:
            return "2-3 months with focused learning"
        elif len(missing_skills) <= 6:
            return "4-6 months with consistent effort"
        else:
            return "6-12 months with structured learning plan"

if __name__ == "__main__":
    from groq import Groq
    client = Groq(api_key=Config.GROQ_API_KEY)
    print("Groq client initialized successfully")
    models = client.models.list()
    print("Available models:", [m.id for m in models.data])
