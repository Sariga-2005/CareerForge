from flask import Blueprint, request, jsonify
import logging
from models.career_advisor import CareerAdvisor

logger = logging.getLogger('ai-brain')
career_path_bp = Blueprint('career_path', __name__)

advisor = CareerAdvisor()

@career_path_bp.route('/generate', methods=['POST'])
@career_path_bp.route('/path', methods=['POST'])  # Alias for frontend compatibility
def generate_career_path():
    """
    Generate personalized career path for a student
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        student_profile = data.get('student_profile')
        
        if not student_profile:
            return jsonify({'error': 'Student profile is required'}), 400
        
        # Generate career path
        result = advisor.generate_career_path(student_profile)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"Error generating career path: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_path_bp.route('/skill-gap', methods=['POST'])
def analyze_skill_gap():
    """
    Analyze skill gap for a target role
    """
    try:
        data = request.get_json()
        
        student_skills = data.get('student_skills', [])
        target_role = data.get('target_role')
        
        if not target_role:
            return jsonify({'error': 'Target role is required'}), 400
        
        # Analyze skill gap
        result = advisor.analyze_skill_gap(student_skills, target_role)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"Error analyzing skill gap: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_path_bp.route('/learning-path', methods=['POST'])
def get_learning_path():
    """
    Get personalized learning path recommendations
    """
    try:
        data = request.get_json()
        
        current_skills = data.get('current_skills', [])
        target_skills = data.get('target_skills', [])
        
        if not target_skills:
            return jsonify({'error': 'Target skills are required'}), 400
        
        # Calculate missing skills
        missing_skills = list(set(target_skills) - set(current_skills))
        
        # Generate learning path
        learning_path = advisor._generate_learning_path(missing_skills)
        
        return jsonify({
            'success': True,
            'learning_path': learning_path,
            'total_skills_to_learn': len(missing_skills),
            'estimated_time': advisor._estimate_learning_time(missing_skills)
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating learning path: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
