import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Cognitive Screener Service Configuration"""
    
    # Flask Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    # Service Config
    PORT = int(os.getenv('PORT', 5002))
    SERVICE_NAME = 'cognitive-screener'
    
    # Groq AI Config
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
    
    # Azure Document Intelligence (for PDF parsing)
    AZURE_DOC_INTELLIGENCE_KEY = os.getenv('AZURE_DOC_INTELLIGENCE_KEY', '')
    AZURE_DOC_INTELLIGENCE_ENDPOINT = os.getenv('AZURE_DOC_INTELLIGENCE_ENDPOINT', '')
    
    # Database Config
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'careerforge')
    
    # Redis Config
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 1))
    
    # Resume Analysis Config
    MAX_RESUME_SIZE_MB = int(os.getenv('MAX_RESUME_SIZE_MB', 5))
    SUPPORTED_RESUME_FORMATS = ['pdf', 'docx', 'txt']
    
    # Interview Evaluation Config
    SPEECH_TO_TEXT_PROVIDER = os.getenv('SPEECH_TO_TEXT_PROVIDER', 'whisper')
    INTERVIEW_EVALUATION_CRITERIA = [
        'technical_knowledge',
        'communication_skills',
        'problem_solving',
        'confidence',
        'clarity'
    ]
    
    # Cognitive Assessment Config
    ASSESSMENT_TIME_LIMIT = int(os.getenv('ASSESSMENT_TIME_LIMIT', 3600))  # seconds
    MIN_PASSING_SCORE = float(os.getenv('MIN_PASSING_SCORE', 0.7))
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', 50))
    RATE_LIMIT_PERIOD = int(os.getenv('RATE_LIMIT_PERIOD', 3600))
