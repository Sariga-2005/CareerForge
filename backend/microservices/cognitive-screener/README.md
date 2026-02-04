# Cognitive Screener Microservice

AI-powered resume analysis, interview evaluation, and cognitive assessment service for CareerForge.

## Features

### Resume Analysis
- Automated resume parsing (PDF, DOCX, TXT)
- Skills and experience extraction
- Quality scoring and feedback
- ATS compatibility checking
- Job-resume matching analysis
- Improvement suggestions

### Interview Evaluation
- AI-powered answer evaluation using GPT-4
- Multi-criteria scoring system
- Comprehensive feedback generation
- Performance recommendations
- Technical and behavioral interview support

### Cognitive Assessment
- Automated question generation
- Multiple assessment types (technical, behavioral, aptitude)
- Difficulty-based filtering
- Instant evaluation and scoring
- Category-wise analysis

## API Endpoints

### Resume Analysis
- `POST /api/cognitive-screener/resume/analyze` - Comprehensive resume analysis
- `POST /api/cognitive-screener/resume/extract` - Extract structured data
- `POST /api/cognitive-screener/resume/quality-check` - Quality assessment
- `POST /api/cognitive-screener/resume/ats-check` - ATS compatibility check
- `POST /api/cognitive-screener/resume/job-match` - Job matching analysis

### Interview Evaluation
- `POST /api/cognitive-screener/interview/evaluate` - Evaluate complete interview
- `POST /api/cognitive-screener/interview/evaluate-answer` - Evaluate single answer
- `POST /api/cognitive-screener/interview/feedback` - Get detailed feedback
- `POST /api/cognitive-screener/interview/scores` - Get scores only

### Cognitive Assessment
- `POST /api/cognitive-screener/assessment/generate-questions` - Generate questions
- `POST /api/cognitive-screener/assessment/evaluate-aptitude` - Evaluate aptitude test
- `GET /api/cognitive-screener/assessment/categories` - Get categories
- `GET /api/cognitive-screener/assessment/difficulty-levels` - Get difficulty levels

### Health Check
- `GET /health` - Service health check

## Setup

### Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure `.env` with your settings (especially `OPENAI_API_KEY`)

5. Run the service:
```bash
python app.py
```

The service will be available at `http://localhost:5002`

### Docker Deployment

Build and run with Docker:
```bash
docker build -t cognitive-screener .
docker run -p 5002:5002 --env-file .env cognitive-screener
```

### Docker Compose

Run as part of CareerForge stack:
```bash
cd ../..  # Go to project root
docker-compose up cognitive-screener
```

## Configuration

Key environment variables:

- `PORT` - Service port (default: 5002)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `OPENAI_MODEL` - Model to use (default: gpt-4)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host
- `MAX_RESUME_SIZE_MB` - Max resume file size (default: 5)
- `ASSESSMENT_TIME_LIMIT` - Assessment time limit in seconds (default: 3600)
- `MIN_PASSING_SCORE` - Minimum passing score (default: 0.7)

## Architecture

```
cognitive-screener/
├── app.py                      # Flask application entry point
├── config/               
│   └── settings.py            # Configuration management
├── models/
│   ├── resume_analyzer.py     # Resume parsing & analysis
│   └── interview_evaluator.py # Interview evaluation
├── routes/
│   ├── resume_analysis.py     # Resume endpoints
│   ├── interview_evaluation.py # Interview endpoints
│   └── cognitive_assessment.py # Assessment endpoints
└── utils/
    └── logger.py              # Logging utilities
```

## Technologies

- **Flask** - Web framework
- **PyPDF2** - PDF parsing
- **python-docx** - Word document parsing
- **OpenAI GPT-4** - AI-powered evaluation
- **scikit-learn** - Machine learning
- **MongoDB** - Database
- **Redis** - Caching

## Usage Examples

### Resume Analysis
```python
import requests

# Analyze resume
with open('resume.pdf', 'rb') as f:
    files = {'file': f}
    data = {'job_description': 'Software Engineer...'}
    response = requests.post(
        'http://localhost:5002/api/cognitive-screener/resume/analyze',
        files=files,
        data=data
    )
    print(response.json())
```

### Interview Evaluation
```python
import requests

data = {
    'interview_id': '12345',
    'type': 'technical',
    'questions': [
        'Explain object-oriented programming',
        'What is a REST API?'
    ],
    'answers': [
        'OOP is a programming paradigm...',
        'REST API is an architectural style...'
    ]
}

response = requests.post(
    'http://localhost:5002/api/cognitive-screener/interview/evaluate',
    json=data
)
print(response.json())
```

## Testing

Run tests:
```bash
pytest
```

## License

MIT
