import google.generativeai as genai
from typing import List, Dict, Any
import logging
from config.settings import Config

logger = logging.getLogger('ai-brain')

class CareerAdvisor:
    """
    AI-powered career path advisor using Google Gemini
    """
    
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def generate_career_path(self, student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized career path recommendations
        """
        try:
            prompt = self._build_career_path_prompt(student_profile)
            
            system_prompt = "You are an expert career advisor for students and professionals."
            full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = self.model.generate_content(full_prompt)
            
            career_advice = response.text
            
            return {
                'success': True,
                'career_path': self._parse_career_advice(career_advice),
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
        
        prompt = f"""
Based on the following student profile, provide a detailed 5-year career path:

Education: {education}
Skills: {skills}
Years of Experience: {experience}
Interests: {interests}

Please provide:
1. Short-term goals (0-1 year)
2. Mid-term goals (1-3 years)
3. Long-term goals (3-5 years)
4. Recommended skills to learn
5. Potential job roles and career progression
6. Industry trends to watch

Format the response in clear sections.
"""
        return prompt
    
    def _parse_career_advice(self, advice: str) -> Dict[str, Any]:
        """Parse structured career advice from AI response"""
        
        sections = {
            'short_term': '',
            'mid_term': '',
            'long_term': '',
            'recommended_skills': [],
            'job_roles': [],
            'industry_trends': []
        }
        
        # Simple parsing logic - can be enhanced
        lines = advice.split('\n')
        current_section = None
        
        for line in lines:
            line_lower = line.lower()
            if 'short-term' in line_lower:
                current_section = 'short_term'
            elif 'mid-term' in line_lower:
                current_section = 'mid_term'
            elif 'long-term' in line_lower:
                current_section = 'long_term'
            elif 'skills' in line_lower:
                current_section = 'recommended_skills'
            elif 'job roles' in line_lower or 'career progression' in line_lower:
                current_section = 'job_roles'
            elif 'trends' in line_lower:
                current_section = 'industry_trends'
            elif current_section and line.strip():
                if isinstance(sections[current_section], list):
                    sections[current_section].append(line.strip())
                else:
                    sections[current_section] += line + '\n'
        
        return sections
    
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
