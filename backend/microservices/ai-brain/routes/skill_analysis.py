from flask import Blueprint, request, jsonify
import logging
from typing import List, Dict
from groq import Groq
from config.settings import Config
import json

logger = logging.getLogger('ai-brain')
skill_analysis_bp = Blueprint('skill_analysis', __name__)

# Initialize Groq AI
client = Groq(api_key=Config.GROQ_API_KEY)
model = Config.GROQ_MODEL

@skill_analysis_bp.route('/trending', methods=['GET'])
def get_trending_skills():
    """
    Get trending skills in the industry
    """
    try:
        industry = request.args.get('industry', 'technology')
        
        # Mock trending skills data - in production, fetch from real data source
        trending_skills = {
            'technology': [
                {'skill': 'Python', 'trend': 'rising', 'demand_score': 95},
                {'skill': 'Machine Learning', 'trend': 'rising', 'demand_score': 92},
                {'skill': 'AWS', 'trend': 'stable', 'demand_score': 89},
                {'skill': 'React', 'trend': 'rising', 'demand_score': 87},
                {'skill': 'Docker', 'trend': 'rising', 'demand_score': 85},
                {'skill': 'TypeScript', 'trend': 'rising', 'demand_score': 83},
                {'skill': 'Kubernetes', 'trend': 'rising', 'demand_score': 81},
                {'skill': 'GraphQL', 'trend': 'rising', 'demand_score': 78},
                {'skill': 'Node.js', 'trend': 'stable', 'demand_score': 86},
                {'skill': 'PostgreSQL', 'trend': 'stable', 'demand_score': 80}
            ],
            'data-science': [
                {'skill': 'Python', 'trend': 'rising', 'demand_score': 97},
                {'skill': 'TensorFlow', 'trend': 'rising', 'demand_score': 90},
                {'skill': 'PyTorch', 'trend': 'rising', 'demand_score': 88},
                {'skill': 'SQL', 'trend': 'stable', 'demand_score': 92},
                {'skill': 'R', 'trend': 'declining', 'demand_score': 75}
            ]
        }
        
        skills = trending_skills.get(industry.lower(), trending_skills['technology'])
        
        return jsonify({
            'success': True,
            'industry': industry,
            'trending_skills': skills,
            'count': len(skills)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting trending skills: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@skill_analysis_bp.route('/market-demand', methods=['POST'])
def analyze_market_demand():
    """
    Analyze market demand for specific skills
    """
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        
        if not skills:
            return jsonify({'error': 'Skills list is required'}), 400
        
        # Mock demand analysis - in production, use real job market data
        demand_analysis = []
        for skill in skills:
            demand_analysis.append({
                'skill': skill,
                'demand_level': 'high',
                'job_postings': 1500,
                'average_salary': 95000,
                'growth_rate': 12.5,
                'top_companies': ['Google', 'Amazon', 'Microsoft']
            })
        
        return jsonify({
            'success': True,
            'demand_analysis': demand_analysis,
            'total_skills_analyzed': len(demand_analysis)
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing market demand: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@skill_analysis_bp.route('/competency-assessment', methods=['POST'])
def assess_competency():
    """
    Assess student's competency level in various skills
    """
    try:
        data = request.get_json()
        
        skills = data.get('skills', [])
        experience_years = data.get('experience_years', 0)
        projects = data.get('projects', [])
        
        competency_levels = []
        
        for skill in skills:
            # Simple competency calculation based on experience and projects
            base_score = min(experience_years * 10, 50)
            project_bonus = min(len(projects) * 5, 30)
            competency_score = base_score + project_bonus
            
            level = 'beginner'
            if competency_score >= 70:
                level = 'expert'
            elif competency_score >= 50:
                level = 'intermediate'
            elif competency_score >= 30:
                level = 'proficient'
            
            competency_levels.append({
                'skill': skill,
                'level': level,
                'score': min(competency_score, 100),
                'recommendation': f"Focus on advanced projects to reach expert level" if level != 'expert' else "Maintain and share expertise"
            })
        
        return jsonify({
            'success': True,
            'competency_assessment': competency_levels,
            'overall_competency': sum(c['score'] for c in competency_levels) / len(competency_levels) if competency_levels else 0
        }), 200
        
    except Exception as e:
        logger.error(f"Error assessing competency: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@skill_analysis_bp.route('/ai-analyze', methods=['POST'])
def ai_analyze_skills():
    """
    Use AI to analyze skills and provide detailed recommendations
    """
    try:
        data = request.get_json()
        
        skills = data.get('skills', [])
        target_role = data.get('target_role', '')
        experience = data.get('experience', 0)
        
        if not skills:
            return jsonify({'error': 'Skills list is required'}), 400
        
        skills_str = ', '.join(skills)
        
        prompt = f"""
Analyze these skills for a candidate targeting a "{target_role}" role with {experience} years of experience:

Current Skills: {skills_str}

Provide a detailed analysis in JSON format:
{{
    "skill_assessment": [
        {{
            "skill": "skill name",
            "relevance_score": 0-100,
            "market_demand": "high/medium/low",
            "proficiency_recommendation": "specific advice to improve"
        }}
    ],
    "missing_skills": [
        {{
            "skill": "skill they should learn",
            "importance": "critical/important/nice-to-have",
            "learning_time": "estimated time to learn",
            "resources": ["suggested learning resources"]
        }}
    ],
    "skill_combinations": ["powerful skill combinations they have"],
    "overall_readiness": 0-100,
    "summary": "brief assessment summary"
}}
"""
        
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4096
        )
        response_text = response.choices[0].message.content.strip()
        
        # Clean up response
        if response_text.startswith('```'):
            import re
            response_text = re.sub(r'^```json?\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
        
        analysis = json.loads(response_text)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'skills_analyzed': len(skills)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in AI skill analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@skill_analysis_bp.route('/ai-roadmap', methods=['POST'])
def ai_generate_roadmap():
    """
    Generate personalized learning roadmap using AI
    """
    try:
        data = request.get_json()
        
        current_skills = data.get('current_skills', [])
        target_role = data.get('target_role', 'Software Developer')
        timeframe = data.get('timeframe_months', 6)
        
        skills_str = ', '.join(current_skills) if current_skills else 'None specified'
        
        prompt = f"""
Create a personalized {timeframe}-month learning roadmap:

Current Skills: {skills_str}
Target Role: {target_role}
Timeframe: {timeframe} months

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
    "roadmap": [
        {{
            "month": 1,
            "focus_area": "main focus for this month",
            "skills_to_learn": ["skill1", "skill2"],
            "projects": ["hands-on project ideas"],
            "milestones": ["measurable goals"]
        }}
    ],
    "key_resources": [
        {{
            "resource_type": "course/book/platform",
            "name": "resource name",
            "url": "optional url",
            "for_skills": ["related skills"]
        }}
    ],
    "estimated_time_per_week": "hours per week needed",
    "success_metrics": ["how to measure success"]
}}
"""
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a career learning advisor. Always respond with valid JSON only, no markdown, no explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4096
        )
        response_text = response.choices[0].message.content.strip()
        
        # Clean up markdown code blocks if present
        if response_text.startswith('```'):
            import re
            response_text = re.sub(r'^```json?\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
        
        # Try to extract JSON if there's surrounding text
        if not response_text.startswith('{'):
            start = response_text.find('{')
            end = response_text.rfind('}')
            if start != -1 and end != -1:
                response_text = response_text[start:end+1]
        
        roadmap = json.loads(response_text)
        
        return jsonify({
            'success': True,
            'roadmap': roadmap,
            'target_role': target_role,
            'timeframe_months': timeframe
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating AI roadmap: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
