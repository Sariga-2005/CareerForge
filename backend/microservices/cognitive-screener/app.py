from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from dotenv import load_dotenv
import os

from routes.resume_analysis import resume_analysis_bp
from routes.interview_evaluation import interview_evaluation_bp
from routes.cognitive_assessment import cognitive_assessment_bp
from utils.logger import setup_logger
from config.settings import Config

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Setup logging
logger = setup_logger('cognitive-screener')

# Register blueprints
app.register_blueprint(resume_analysis_bp, url_prefix='/api/cognitive-screener/resume')
app.register_blueprint(interview_evaluation_bp, url_prefix='/api/cognitive-screener/interview')
app.register_blueprint(cognitive_assessment_bp, url_prefix='/api/cognitive-screener/assessment')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'cognitive-screener',
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
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False') == 'True')
