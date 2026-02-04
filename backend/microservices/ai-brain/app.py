from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from dotenv import load_dotenv
import os

from routes.job_matching import job_matching_bp
from routes.career_path import career_path_bp
from routes.skill_analysis import skill_analysis_bp
from utils.logger import setup_logger
from config.settings import Config

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Setup logging
logger = setup_logger('ai-brain')

# Register blueprints
app.register_blueprint(job_matching_bp, url_prefix='/api/ai-brain/job-matching')
app.register_blueprint(career_path_bp, url_prefix='/api/ai-brain/career-path')
app.register_blueprint(skill_analysis_bp, url_prefix='/api/ai-brain/skill-analysis')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'ai-brain',
        'version': '1.0.0'
    }), 200

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False') == 'True')
