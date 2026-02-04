import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """AI Brain Service Configuration"""
    
    # Flask Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    # Service Config
    PORT = int(os.getenv('PORT', 5001))
    SERVICE_NAME = 'ai-brain'
    
    # Gemini AI Config
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    # Database Config
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'careerforge')
    
    # Redis Config
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # Matching Algorithm Config
    SIMILARITY_THRESHOLD = float(os.getenv('SIMILARITY_THRESHOLD', 0.7))
    MAX_RECOMMENDATIONS = int(os.getenv('MAX_RECOMMENDATIONS', 10))
    
    # Career Path Config
    CAREER_PREDICTION_YEARS = int(os.getenv('CAREER_PREDICTION_YEARS', 5))
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_PERIOD = int(os.getenv('RATE_LIMIT_PERIOD', 3600))
