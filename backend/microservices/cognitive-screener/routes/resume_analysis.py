from flask import Blueprint, request, jsonify
import logging
from models.resume_analyzer import ResumeAnalyzer
from werkzeug.utils import secure_filename
import os

logger = logging.getLogger('cognitive-screener')
resume_analysis_bp = Blueprint('resume_analysis', __name__)

analyzer = ResumeAnalyzer()

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_analysis_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    Analyze resume from text or file upload
    """
    try:
        # Check if it's a file upload or text
        if 'file' in request.files:
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type. Allowed: PDF, DOCX, TXT'}), 400
            
            # Extract text from file
            if file.filename.endswith('.pdf'):
                resume_text = analyzer.parse_pdf(file)
            else:
                resume_text = file.read().decode('utf-8')
            
            # Log extracted text length for debugging
            logger.info(f"Extracted {len(resume_text)} chars from {file.filename}")
            logger.info(f"First 500 chars: {resume_text[:500]}")
            
            job_description = request.form.get('job_description', None)
            
        else:
            # Text-based analysis
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            resume_text = data.get('resume_text')
            job_description = data.get('job_description', None)
            
            if not resume_text:
                return jsonify({'error': 'Resume text is required'}), 400
        
        # Perform analysis
        result = analyzer.analyze_resume(resume_text, job_description)
        
        # Log skills detected for debugging
        if result.get('success'):
            tech = result.get('extracted_data', {}).get('technical_skills', [])
            soft = result.get('extracted_data', {}).get('soft_skills', [])
            logger.info(f"Detected {len(tech)} technical skills: {tech[:10]}")
            logger.info(f"Detected {len(soft)} soft skills: {soft[:10]}")
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"Error in resume analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@resume_analysis_bp.route('/extract', methods=['POST'])
def extract_resume_data():
    """
    Extract structured data from resume
    """
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'Resume text is required'}), 400
        
        resume_text = data['resume_text']
        
        # Extract data
        extracted_data = analyzer._extract_resume_data(resume_text)
        
        return jsonify({
            'success': True,
            'extracted_data': extracted_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error extracting resume data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@resume_analysis_bp.route('/quality-check', methods=['POST'])
def check_quality():
    """
    Check resume quality and get improvement suggestions
    """
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'Resume text is required'}), 400
        
        resume_text = data['resume_text']
        
        # Extract data and calculate quality
        extracted_data = analyzer._extract_resume_data(resume_text)
        quality_score = analyzer._calculate_quality_score(extracted_data)
        suggestions = analyzer._generate_suggestions(extracted_data, resume_text)
        ats_check = analyzer._check_ats_compatibility(resume_text)
        
        return jsonify({
            'success': True,
            'quality_score': quality_score,
            'suggestions': suggestions,
            'ats_compatibility': ats_check
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking resume quality: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@resume_analysis_bp.route('/ats-check', methods=['POST'])
def ats_compatibility_check():
    """
    Check ATS (Applicant Tracking System) compatibility
    """
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'Resume text is required'}), 400
        
        resume_text = data['resume_text']
        
        # Check ATS compatibility
        ats_result = analyzer._check_ats_compatibility(resume_text)
        
        return jsonify({
            'success': True,
            'ats_compatibility': ats_result
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking ATS compatibility: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@resume_analysis_bp.route('/job-match', methods=['POST'])
def job_match_analysis():
    """
    Analyze resume match with job description
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        resume_text = data.get('resume_text')
        job_description = data.get('job_description')
        
        if not resume_text or not job_description:
            return jsonify({'error': 'Both resume_text and job_description are required'}), 400
        
        # Analyze match
        match_result = analyzer._analyze_job_match(resume_text, job_description)
        
        return jsonify({
            'success': True,
            'job_match': match_result
        }), 200
        
    except Exception as e:
        logger.error(f"Error in job match analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
