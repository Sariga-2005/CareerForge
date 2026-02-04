from flask import Blueprint, request, jsonify
import logging
from typing import List, Dict

logger = logging.getLogger('ai-brain')
skill_analysis_bp = Blueprint('skill_analysis', __name__)

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
