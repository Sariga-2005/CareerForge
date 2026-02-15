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
    
    # Groq AI Config
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
    
    # Database Config
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge')
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
