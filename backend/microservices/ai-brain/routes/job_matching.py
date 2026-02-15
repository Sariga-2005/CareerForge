from flask import Blueprint, request, jsonify
import logging
from models.job_matcher import JobMatcher

logger = logging.getLogger('ai-brain')
job_matching_bp = Blueprint('job_matching', __name__)

matcher = JobMatcher()

@job_matching_bp.route('/match', methods=['POST'])
def match_jobs():
    """
    Match student profile with available jobs
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        student_profile = data.get('student_profile')
        jobs = data.get('jobs', [])
        
        if not student_profile:
            return jsonify({'error': 'Student profile is required'}), 400
        
        if not jobs:
            return jsonify({'error': 'Jobs list is required'}), 400
        
        # Rank jobs
        ranked_jobs = matcher.rank_jobs(student_profile, jobs)
        
        return jsonify({
            'success': True,
            'matched_jobs': ranked_jobs,
            'total_jobs': len(ranked_jobs),
            'top_match': ranked_jobs[0] if ranked_jobs else None
        }), 200
        
    except Exception as e:
        logger.error(f"Error in job matching: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_matching_bp.route('/calculate-score', methods=['POST'])
def calculate_match_score():
    """
    Calculate match score between a student and a specific job
    """
    try:
        data = request.get_json()
        
        student_profile = data.get('student_profile')
        job = data.get('job')
        
        if not student_profile or not job:
            return jsonify({'error': 'Both student_profile and job are required'}), 400
        
        score = matcher.calculate_match_score(student_profile, job)
        
        return jsonify({
            'success': True,
            'match_score': score,
            'match_percentage': round(score * 100, 2),
            'job_title': job.get('title', 'Unknown')
        }), 200
        
    except Exception as e:
        logger.error(f"Error calculating match score: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_matching_bp.route('/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get personalized job recommendations
    """
    try:
        data = request.get_json()
        
        student_profile = data.get('student_profile')
        jobs = data.get('jobs', [])
        limit = data.get('limit', 10)
        min_score = data.get('min_score', 0.5)
        
        if not student_profile:
            return jsonify({'error': 'Student profile is required'}), 400
        
        # Rank all jobs
        ranked_jobs = matcher.rank_jobs(student_profile, jobs)
        
        # Filter by minimum score and limit
        recommendations = [
            job for job in ranked_jobs 
            if job['match_score'] >= min_score
        ][:limit]
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'count': len(recommendations),
            'average_match': round(sum(j['match_score'] for j in recommendations) / len(recommendations) * 100, 2) if recommendations else 0
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@job_matching_bp.route('/ai-analyze', methods=['POST'])
def ai_analyze_job():
    """
    Use AI to analyze how well a student fits a specific job
    """
    try:
        data = request.get_json()
        
        student_profile = data.get('student_profile')
        job = data.get('job')
        
        if not student_profile or not job:
            return jsonify({'error': 'Both student_profile and job are required'}), 400
        
        analysis = matcher.ai_analyze_job_fit(student_profile, job)
        
        return jsonify({
            'success': analysis.get('success', False),
            'analysis': analysis.get('analysis', {}),
            'job_title': job.get('title', 'Unknown')
        }), 200
        
    except Exception as e:
        logger.error(f"Error in AI job analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@job_matching_bp.route('/ai-recommend', methods=['POST'])
def ai_recommend_jobs():
    """
    Get AI-powered job recommendations based on student profile
    """
    try:
        data = request.get_json()
        
        student_profile = data.get('student_profile')
        limit = data.get('limit', 5)
        
        if not student_profile:
            return jsonify({'error': 'Student profile is required'}), 400
        
        result = matcher.ai_recommend_jobs(student_profile, limit)
        
        return jsonify({
            'success': result.get('success', False),
            'recommendations': result.get('recommendations', []),
            'count': len(result.get('recommendations', []))
        }), 200
        
    except Exception as e:
        logger.error(f"Error in AI job recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

