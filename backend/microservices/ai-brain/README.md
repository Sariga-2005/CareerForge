# AI Brain Microservice

AI-powered job matching, career path planning, and skill analysis service for CareerForge.

## Features

### Job Matching
- Advanced job-student matching using ML algorithms
- TF-IDF and cosine similarity for resume-job matching
- Multi-factor scoring (skills, experience, education, text similarity)
- Personalized job recommendations

### Career Path Planning
- AI-powered career path generation using GPT-4
- Skill gap analysis
- Personalized learning path recommendations
- Industry trend analysis

### Skill Analysis
- Trending skills tracking
- Market demand analysis
- Competency assessment
- Career progression suggestions

## API Endpoints

### Job Matching
- `POST /api/ai-brain/job-matching/match` - Match student with jobs
- `POST /api/ai-brain/job-matching/calculate-score` - Calculate match score
- `POST /api/ai-brain/job-matching/recommendations` - Get personalized recommendations

### Career Path
- `POST /api/ai-brain/career-path/generate` - Generate career path
- `POST /api/ai-brain/career-path/skill-gap` - Analyze skill gaps
- `POST /api/ai-brain/career-path/learning-path` - Get learning recommendations

### Skill Analysis
- `GET /api/ai-brain/skill-analysis/trending` - Get trending skills
- `POST /api/ai-brain/skill-analysis/market-demand` - Analyze market demand
- `POST /api/ai-brain/skill-analysis/competency-assessment` - Assess competency

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

The service will be available at `http://localhost:5001`

### Docker Deployment

Build and run with Docker:
```bash
docker build -t ai-brain .
docker run -p 5001:5001 --env-file .env ai-brain
```

### Docker Compose

Run as part of CareerForge stack:
```bash
cd ../..  # Go to project root
docker-compose up ai-brain
```

## Configuration

Key environment variables:

- `PORT` - Service port (default: 5001)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `OPENAI_MODEL` - Model to use (default: gpt-4)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host
- `SIMILARITY_THRESHOLD` - Job match threshold (default: 0.7)
- `MAX_RECOMMENDATIONS` - Max recommendations to return (default: 10)

## Architecture

```
ai-brain/
├── app.py                 # Flask application entry point
├── config/               
│   └── settings.py       # Configuration management
├── models/
│   ├── job_matcher.py    # ML-based job matching
│   └── career_advisor.py # AI career guidance
├── routes/
│   ├── job_matching.py   # Job matching endpoints
│   ├── career_path.py    # Career planning endpoints
│   └── skill_analysis.py # Skill analysis endpoints
└── utils/
    └── logger.py         # Logging utilities
```

## Technologies

- **Flask** - Web framework
- **scikit-learn** - Machine learning
- **OpenAI GPT-4** - AI-powered insights
- **MongoDB** - Database
- **Redis** - Caching
- **NumPy/Pandas** - Data processing

## Testing

Run tests:
```bash
pytest
```

## License

MIT
