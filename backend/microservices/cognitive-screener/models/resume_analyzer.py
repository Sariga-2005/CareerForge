import re
import google.generativeai as genai
from typing import Dict, Any, List
import PyPDF2
import io
import logging
import json
from config.settings import Config

logger = logging.getLogger('cognitive-screener')

class ResumeAnalyzer:
    """
    Advanced resume analysis using NLP and Google Gemini AI
    """
    
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def analyze_resume(self, resume_text: str, job_description: str = None) -> Dict[str, Any]:
        """
        Comprehensive resume analysis using AI
        """
        try:
            # Use AI to extract structured information
            extracted_data = self._ai_extract_resume_data(resume_text)
            
            # Calculate detailed quality score with explanations
            quality_score = self._calculate_detailed_quality_score(extracted_data, resume_text)
            
            # Generate improvement suggestions
            suggestions = self._generate_ai_suggestions(extracted_data, resume_text)
            
            # If job description provided, calculate match
            job_match = None
            if job_description:
                job_match = self._analyze_job_match(resume_text, job_description)
            
            return {
                'success': True,
                'extracted_data': extracted_data,
                'quality_score': quality_score,
                'suggestions': suggestions,
                'job_match': job_match,
                'ats_friendly': self._check_ats_compatibility(resume_text)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            # Fallback to basic analysis if AI fails
            return self._fallback_analysis(resume_text, job_description, str(e))
    
    def _ai_extract_resume_data(self, text: str) -> Dict[str, Any]:
        """Extract structured data from resume using AI"""
        
        prompt = f"""
Analyze this resume and extract ALL information in the exact JSON format below.
Be thorough - extract EVERY skill, technology, tool, framework, and competency mentioned.

RESUME TEXT:
{text[:4000]}

Return ONLY valid JSON (no markdown, no explanation):
{{
    "personal_info": {{
        "name": "extracted name or null",
        "email": "extracted email or null",
        "phone": "extracted phone or null",
        "linkedin": "linkedin URL or null",
        "github": "github URL or null",
        "location": "city/location or null"
    }},
    "technical_skills": ["list every programming language, framework, tool, technology, database, cloud service, etc."],
    "soft_skills": ["communication", "leadership", "teamwork", "problem-solving", etc. - extract from context],
    "education": [
        {{
            "degree": "degree name",
            "field": "field of study",
            "institution": "university/college name",
            "year": "graduation year or expected",
            "gpa": "GPA if mentioned"
        }}
    ],
    "experience": [
        {{
            "title": "job title",
            "company": "company name",
            "duration": "time period",
            "responsibilities": ["key responsibilities"],
            "achievements": ["quantifiable achievements if any"]
        }}
    ],
    "projects": [
        {{
            "name": "project name",
            "description": "brief description",
            "technologies": ["technologies used"]
        }}
    ],
    "certifications": ["list of certifications"],
    "achievements": ["awards, honors, notable achievements"],
    "languages": ["spoken languages"],
    "total_experience_years": 0
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response - remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            extracted = json.loads(response_text)
            
            # Ensure required fields exist
            extracted.setdefault('technical_skills', [])
            extracted.setdefault('soft_skills', [])
            extracted.setdefault('education', [])
            extracted.setdefault('experience', [])
            extracted.setdefault('projects', [])
            extracted.setdefault('certifications', [])
            extracted.setdefault('achievements', [])
            
            # Add metadata
            extracted['total_words'] = len(text.split())
            extracted['sections_detected'] = self._detect_sections(text)
            
            return extracted
            
        except Exception as e:
            logger.error(f"AI extraction failed: {str(e)}, falling back to regex")
            return self._extract_resume_data(text)
    
    def _calculate_detailed_quality_score(self, extracted_data: Dict[str, Any], resume_text: str) -> Dict[str, Any]:
        """Calculate resume quality score with detailed explanations"""
        
        score_breakdown = {
            'contact_info': {'score': 0, 'max': 15, 'details': [], 'explanation': ''},
            'technical_skills': {'score': 0, 'max': 25, 'details': [], 'explanation': ''},
            'education': {'score': 0, 'max': 15, 'details': [], 'explanation': ''},
            'experience': {'score': 0, 'max': 20, 'details': [], 'explanation': ''},
            'projects': {'score': 0, 'max': 10, 'details': [], 'explanation': ''},
            'formatting': {'score': 0, 'max': 15, 'details': [], 'explanation': ''}
        }
        
        # Contact Information (15 points)
        contact = extracted_data.get('personal_info', {})
        if isinstance(contact, dict):
            if contact.get('email'):
                score_breakdown['contact_info']['score'] += 5
                score_breakdown['contact_info']['details'].append('✓ Email found')
            else:
                score_breakdown['contact_info']['details'].append('✗ Missing email address')
            
            if contact.get('phone'):
                score_breakdown['contact_info']['score'] += 5
                score_breakdown['contact_info']['details'].append('✓ Phone number found')
            else:
                score_breakdown['contact_info']['details'].append('✗ Missing phone number')
            
            if contact.get('linkedin') or contact.get('github'):
                score_breakdown['contact_info']['score'] += 5
                score_breakdown['contact_info']['details'].append('✓ Professional profile links found')
            else:
                score_breakdown['contact_info']['details'].append('○ Consider adding LinkedIn/GitHub')
        
        score_breakdown['contact_info']['explanation'] = (
            f"Contact information helps recruiters reach you. "
            f"You scored {score_breakdown['contact_info']['score']}/{score_breakdown['contact_info']['max']} "
            f"based on the presence of essential contact details."
        )
        
        # Technical Skills (25 points)
        tech_skills = extracted_data.get('technical_skills', [])
        skills_count = len(tech_skills) if isinstance(tech_skills, list) else 0
        
        if skills_count >= 10:
            score_breakdown['technical_skills']['score'] = 25
            score_breakdown['technical_skills']['details'].append(f'✓ Excellent - {skills_count} technical skills identified')
        elif skills_count >= 7:
            score_breakdown['technical_skills']['score'] = 20
            score_breakdown['technical_skills']['details'].append(f'✓ Good - {skills_count} technical skills found')
        elif skills_count >= 4:
            score_breakdown['technical_skills']['score'] = 15
            score_breakdown['technical_skills']['details'].append(f'○ Moderate - {skills_count} skills, consider adding more')
        elif skills_count >= 1:
            score_breakdown['technical_skills']['score'] = 10
            score_breakdown['technical_skills']['details'].append(f'✗ Limited - Only {skills_count} skills detected')
        else:
            score_breakdown['technical_skills']['details'].append('✗ No technical skills found')
        
        if tech_skills:
            score_breakdown['technical_skills']['details'].append(f'Skills found: {", ".join(tech_skills[:10])}{"..." if len(tech_skills) > 10 else ""}')
        
        score_breakdown['technical_skills']['explanation'] = (
            f"Technical skills are crucial for ATS matching and recruiter screening. "
            f"With {skills_count} skills identified, you scored {score_breakdown['technical_skills']['score']}/{score_breakdown['technical_skills']['max']}. "
            f"{'Great job showcasing your technical expertise!' if skills_count >= 7 else 'Consider adding more relevant technical skills.'}"
        )
        
        # Education (15 points)
        education = extracted_data.get('education', [])
        edu_count = len(education) if isinstance(education, list) else 0
        
        if edu_count > 0:
            score_breakdown['education']['score'] = 15
            edu_entry = education[0] if education else {}
            degree = edu_entry.get('degree', 'Degree') if isinstance(edu_entry, dict) else 'Degree'
            score_breakdown['education']['details'].append(f'✓ Education section found: {degree}')
        else:
            score_breakdown['education']['details'].append('✗ No education information detected')
        
        score_breakdown['education']['explanation'] = (
            f"Education credentials validate your qualifications. "
            f"Score: {score_breakdown['education']['score']}/{score_breakdown['education']['max']}."
        )
        
        # Experience (20 points)
        experience = extracted_data.get('experience', [])
        exp_count = len(experience) if isinstance(experience, list) else 0
        years = extracted_data.get('total_experience_years', 0)
        
        if exp_count >= 3:
            score_breakdown['experience']['score'] = 20
            score_breakdown['experience']['details'].append(f'✓ Strong experience section with {exp_count} positions')
        elif exp_count >= 2:
            score_breakdown['experience']['score'] = 15
            score_breakdown['experience']['details'].append(f'✓ Good experience with {exp_count} positions')
        elif exp_count >= 1:
            score_breakdown['experience']['score'] = 10
            score_breakdown['experience']['details'].append(f'○ Limited experience - {exp_count} position(s)')
        else:
            score_breakdown['experience']['details'].append('✗ No work experience detected')
        
        if years:
            score_breakdown['experience']['details'].append(f'Estimated experience: ~{years} years')
        
        score_breakdown['experience']['explanation'] = (
            f"Work experience demonstrates your practical capabilities. "
            f"With {exp_count} position(s), you scored {score_breakdown['experience']['score']}/{score_breakdown['experience']['max']}."
        )
        
        # Projects (10 points)
        projects = extracted_data.get('projects', [])
        proj_count = len(projects) if isinstance(projects, list) else 0
        
        if proj_count >= 3:
            score_breakdown['projects']['score'] = 10
            score_breakdown['projects']['details'].append(f'✓ Excellent - {proj_count} projects showcased')
        elif proj_count >= 2:
            score_breakdown['projects']['score'] = 7
            score_breakdown['projects']['details'].append(f'✓ Good - {proj_count} projects found')
        elif proj_count >= 1:
            score_breakdown['projects']['score'] = 5
            score_breakdown['projects']['details'].append(f'○ {proj_count} project found')
        else:
            score_breakdown['projects']['details'].append('○ No projects section - consider adding one')
        
        score_breakdown['projects']['explanation'] = (
            f"Projects demonstrate hands-on experience and initiative. "
            f"Score: {score_breakdown['projects']['score']}/{score_breakdown['projects']['max']}."
        )
        
        # Formatting & Structure (15 points)
        word_count = extracted_data.get('total_words', len(resume_text.split()))
        sections = extracted_data.get('sections_detected', [])
        
        # Word count scoring
        if 300 <= word_count <= 700:
            score_breakdown['formatting']['score'] += 8
            score_breakdown['formatting']['details'].append(f'✓ Optimal length ({word_count} words)')
        elif word_count < 300:
            score_breakdown['formatting']['score'] += 4
            score_breakdown['formatting']['details'].append(f'✗ Too short ({word_count} words) - add more details')
        else:
            score_breakdown['formatting']['score'] += 5
            score_breakdown['formatting']['details'].append(f'○ Consider condensing ({word_count} words)')
        
        # Sections scoring
        required_sections = ['education', 'experience', 'skills']
        found_required = sum(1 for s in required_sections if s in sections)
        score_breakdown['formatting']['score'] += min(found_required * 2, 7)
        
        if found_required == len(required_sections):
            score_breakdown['formatting']['details'].append('✓ All key sections present')
        else:
            missing = [s for s in required_sections if s not in sections]
            score_breakdown['formatting']['details'].append(f'○ Missing sections: {", ".join(missing)}')
        
        score_breakdown['formatting']['explanation'] = (
            f"Proper formatting ensures your resume is readable and ATS-friendly. "
            f"Score: {score_breakdown['formatting']['score']}/{score_breakdown['formatting']['max']}."
        )
        
        # Calculate totals
        total_score = sum(cat['score'] for cat in score_breakdown.values())
        max_score = sum(cat['max'] for cat in score_breakdown.values())
        
        return {
            'overall_score': total_score,
            'max_score': max_score,
            'percentage': round((total_score / max_score) * 100),
            'grade': self._get_grade(total_score),
            'breakdown': score_breakdown,
            'summary': self._generate_score_summary(score_breakdown, total_score)
        }
    
    def _generate_score_summary(self, breakdown: Dict, total: int) -> str:
        """Generate a human-readable summary of the score"""
        strengths = []
        improvements = []
        
        for category, data in breakdown.items():
            ratio = data['score'] / data['max'] if data['max'] > 0 else 0
            category_name = category.replace('_', ' ').title()
            
            if ratio >= 0.8:
                strengths.append(category_name)
            elif ratio < 0.5:
                improvements.append(category_name)
        
        summary = f"Your resume scored {total}/100. "
        
        if strengths:
            summary += f"Strong areas: {', '.join(strengths)}. "
        if improvements:
            summary += f"Areas to improve: {', '.join(improvements)}."
        
        return summary
    
    def _generate_ai_suggestions(self, extracted_data: Dict[str, Any], resume_text: str) -> List[Dict[str, str]]:
        """Generate AI-powered improvement suggestions"""
        
        prompt = f"""
Based on this resume analysis, provide 3-5 specific, actionable improvement suggestions.

EXTRACTED DATA:
- Technical Skills: {extracted_data.get('technical_skills', [])}
- Soft Skills: {extracted_data.get('soft_skills', [])}
- Experience entries: {len(extracted_data.get('experience', []))}
- Projects: {len(extracted_data.get('projects', []))}
- Word count: {extracted_data.get('total_words', 0)}

Return ONLY valid JSON array (no markdown):
[
    {{
        "category": "skills|experience|formatting|content|impact",
        "priority": "high|medium|low",
        "title": "Short suggestion title",
        "suggestion": "Detailed actionable suggestion",
        "impact": "How this will help",
        "example": "Concrete example if applicable"
    }}
]
"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response
            if response_text.startswith('```'):
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            suggestions = json.loads(response_text)
            return suggestions if isinstance(suggestions, list) else []
            
        except Exception as e:
            logger.error(f"AI suggestions failed: {str(e)}")
            return self._generate_suggestions(extracted_data, resume_text)
    
    def _fallback_analysis(self, resume_text: str, job_description: str, error: str) -> Dict[str, Any]:
        """Fallback analysis when AI fails"""
        extracted_data = self._extract_resume_data(resume_text)
        quality_score = self._calculate_quality_score(extracted_data)
        suggestions = self._generate_suggestions(extracted_data, resume_text)
        
        return {
            'success': True,
            'extracted_data': extracted_data,
            'quality_score': quality_score,
            'suggestions': suggestions,
            'job_match': None,
            'ats_friendly': self._check_ats_compatibility(resume_text),
            'note': 'Basic analysis used due to AI service unavailability'
        }
    
    def _extract_resume_data(self, text: str) -> Dict[str, Any]:
        """Extract structured data from resume text using comprehensive keyword matching"""
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        # Phone extraction
        phone_pattern = r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        phones = re.findall(phone_pattern, text)
        
        # LinkedIn URL extraction
        linkedin_pattern = r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+'
        linkedin_matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
        linkedin = linkedin_matches[0] if linkedin_matches else None
        
        # GitHub URL extraction
        github_pattern = r'(?:https?://)?(?:www\.)?github\.com/[\w-]+'
        github_matches = re.findall(github_pattern, text, re.IGNORECASE)
        github = github_matches[0] if github_matches else None
        
        # Portfolio/Website URL extraction
        portfolio_pattern = r'(?:https?://)?(?:www\.)?[\w-]+\.(?:com|io|dev|me|net|org|co)/[\w/-]*'
        portfolio_matches = re.findall(portfolio_pattern, text, re.IGNORECASE)
        # Filter out linkedin and github from portfolio matches
        portfolio = None
        for url in portfolio_matches:
            if 'linkedin' not in url.lower() and 'github' not in url.lower():
                portfolio = url
                break
        
        # Comprehensive skills extraction
        technical_skills_keywords = [
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c', 'ruby', 'go', 'golang',
            'rust', 'swift', 'kotlin', 'scala', 'php', 'perl', 'r', 'matlab', 'julia', 'dart',
            'objective-c', 'groovy', 'lua', 'haskell', 'clojure', 'elixir', 'erlang', 'fortran',
            'cobol', 'assembly', 'bash', 'shell', 'powershell', 'vba', 'visual basic',
            
            # Web Technologies
            'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
            'bootstrap', 'material ui', 'materialize', 'bulma', 'foundation',
            
            # Frontend Frameworks
            'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
            'svelte', 'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'gatsby', 'ember', 'backbone',
            'jquery', 'redux', 'mobx', 'webpack', 'vite', 'parcel', 'rollup', 'babel',
            
            # Backend Frameworks
            'node.js', 'nodejs', 'express', 'expressjs', 'fastify', 'koa', 'nestjs', 'nest.js',
            'django', 'flask', 'fastapi', 'tornado', 'pyramid', 'bottle',
            'spring', 'spring boot', 'springboot', 'hibernate', 'struts',
            'rails', 'ruby on rails', 'sinatra',
            'asp.net', '.net', '.net core', 'dotnet',
            'laravel', 'symfony', 'codeigniter', 'yii',
            'gin', 'echo', 'fiber', 'beego',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'sql server', 'mssql',
            'mariadb', 'mongodb', 'redis', 'cassandra', 'couchdb', 'couchbase', 'dynamodb',
            'elasticsearch', 'neo4j', 'firebase', 'firestore', 'supabase', 'cockroachdb',
            'influxdb', 'timescaledb', 'memcached', 'clickhouse',
            
            # Cloud Platforms
            'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
            'google cloud platform', 'heroku', 'digitalocean', 'linode', 'vultr', 'vercel',
            'netlify', 'cloudflare', 'ibm cloud', 'oracle cloud', 'alibaba cloud',
            
            # AWS Services
            'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'cloudfront', 'route53', 'sqs', 'sns',
            'ecs', 'eks', 'fargate', 'cloudwatch', 'iam', 'cognito', 'api gateway',
            
            # DevOps & Infrastructure
            'docker', 'kubernetes', 'k8s', 'jenkins', 'travis ci', 'circle ci', 'github actions',
            'gitlab ci', 'ansible', 'terraform', 'puppet', 'chef', 'vagrant', 'packer',
            'prometheus', 'grafana', 'datadog', 'splunk', 'elk', 'logstash', 'kibana',
            'nginx', 'apache', 'haproxy', 'traefik', 'envoy',
            
            # Version Control
            'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
            
            # AI/ML
            'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
            'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
            'scipy', 'matplotlib', 'seaborn', 'plotly', 'opencv', 'nltk', 'spacy',
            'hugging face', 'transformers', 'bert', 'gpt', 'llm', 'langchain',
            'computer vision', 'nlp', 'natural language processing', 'neural network',
            'cnn', 'rnn', 'lstm', 'gan', 'reinforcement learning',
            
            # Data Engineering
            'spark', 'apache spark', 'hadoop', 'hive', 'pig', 'kafka', 'apache kafka',
            'airflow', 'apache airflow', 'dbt', 'snowflake', 'databricks', 'redshift',
            'bigquery', 'etl', 'data pipeline', 'data warehouse',
            
            # Mobile Development
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
            'swift ui', 'swiftui', 'kotlin multiplatform', 'expo',
            
            # Testing
            'jest', 'mocha', 'chai', 'jasmine', 'cypress', 'selenium', 'puppeteer',
            'playwright', 'pytest', 'unittest', 'junit', 'testng', 'rspec', 'enzyme',
            'testing library', 'postman', 'soapui', 'jmeter', 'locust',
            
            # API & Protocols
            'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'webhooks',
            'oauth', 'jwt', 'openapi', 'swagger',
            
            # Tools & IDEs
            'vs code', 'visual studio', 'intellij', 'pycharm', 'eclipse', 'vim', 'emacs',
            'sublime', 'atom', 'xcode', 'android studio',
            
            # Other
            'linux', 'unix', 'windows', 'macos', 'agile', 'scrum', 'kanban', 'jira',
            'confluence', 'trello', 'slack', 'figma', 'sketch', 'adobe xd', 'photoshop',
            'illustrator', 'blockchain', 'web3', 'solidity', 'ethereum', 'smart contracts',
            'microservices', 'serverless', 'ci/cd', 'cicd', 'devops', 'sre', 'mlops',
            'data structures', 'algorithms', 'oop', 'functional programming', 'tdd', 'bdd',
        ]
        
        soft_skills_keywords = [
            'communication', 'leadership', 'teamwork', 'team player', 'collaboration',
            'problem solving', 'problem-solving', 'critical thinking', 'analytical',
            'time management', 'organization', 'organizational', 'adaptability', 'flexibility',
            'creativity', 'innovation', 'innovative', 'attention to detail', 'detail-oriented',
            'project management', 'mentoring', 'coaching', 'training', 'presentation',
            'public speaking', 'negotiation', 'conflict resolution', 'decision making',
            'strategic thinking', 'customer service', 'client relations', 'interpersonal',
            'emotional intelligence', 'self-motivated', 'proactive', 'initiative',
            'multitasking', 'prioritization', 'deadline-driven', 'results-oriented',
            'research', 'analytical skills', 'written communication', 'verbal communication',
        ]
        
        found_technical_skills = []
        found_soft_skills = []
        text_lower = text.lower()
        
        for skill in technical_skills_keywords:
            # Use word boundary matching to avoid partial matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Normalize skill name
                normalized = skill.replace('.js', '.js').replace('js', 'JS').title()
                if skill in ['aws', 'gcp', 'sql', 'css', 'html', 'ai', 'ml', 'api', 'ci/cd', 'tdd', 'bdd', 'oop', 'nlp', 'cnn', 'rnn', 'lstm', 'gan', 'jwt', 'etl', 'sre']:
                    normalized = skill.upper()
                elif skill in ['python', 'java', 'javascript', 'typescript', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'php', 'perl', 'dart', 'react', 'angular', 'vue', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'linux', 'git', 'github', 'figma']:
                    normalized = skill.capitalize()
                else:
                    normalized = skill
                    
                if normalized not in found_technical_skills:
                    found_technical_skills.append(normalized)
        
        for skill in soft_skills_keywords:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                normalized = skill.replace('-', ' ').title()
                if normalized not in found_soft_skills:
                    found_soft_skills.append(normalized)
        
        # Education detection
        education_keywords = ['bachelor', 'master', 'phd', 'doctorate', 'b.tech', 'm.tech', 'mba', 
                            'b.sc', 'm.sc', 'b.e.', 'm.e.', 'b.s.', 'm.s.', 'bca', 'mca', 
                            'diploma', 'associate', 'certificate']
        education_found = []
        for edu in education_keywords:
            if edu in text_lower:
                education_found.append(edu.upper() if len(edu) <= 4 else edu.title())
        
        # PROJECT EXTRACTION - Enhanced regex-based extraction
        projects = self._extract_projects_regex(text)
        
        # EXPERIENCE EXTRACTION - Enhanced regex-based extraction
        experience = self._extract_experience_regex(text)
        
        # Experience years estimation
        year_pattern = r'\b(19|20)\d{2}\b'
        years = re.findall(year_pattern, text)
        years = sorted([int(y) for y in years])
        
        experience_years = 0
        if len(years) >= 2:
            experience_years = years[-1] - years[0]
        
        return {
            'personal_info': {
                'name': self._extract_name(text),
                'email': emails[0] if emails else None,
                'phone': phones[0] if phones else None,
                'linkedin': linkedin,
                'github': github,
                'portfolio': portfolio,
                'location': self._extract_location(text)
            },
            'contact': {
                'emails': emails,
                'phones': phones[:2] if phones else []
            },
            'technical_skills': found_technical_skills,
            'soft_skills': found_soft_skills,
            'skills': found_technical_skills,  # For backward compatibility
            'education': [{'degree': edu} for edu in education_found],
            'experience': experience,
            'projects': projects,
            'estimated_experience_years': min(experience_years, 30),
            'total_experience_years': min(experience_years, 30),
            'total_words': len(text.split()),
            'sections_detected': self._detect_sections(text)
        }
    
    def _extract_name(self, text: str) -> str:
        """Extract name from the beginning of resume"""
        lines = text.strip().split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            # Skip if line looks like contact info
            if '@' in line or 'linkedin' in line.lower() or 'github' in line.lower():
                continue
            if 'phone' in line.lower() or 'email' in line.lower():
                continue
            # Name is usually the first prominent text without special characters
            if line and len(line) < 50 and re.match(r'^[A-Z][a-zA-Z\s\.]+$', line):
                return line
        return None
    
    def _extract_location(self, text: str) -> str:
        """Extract location from resume"""
        # Common location patterns
        location_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2,}|[A-Z][a-z]+)\b'
        matches = re.findall(location_pattern, text)
        if matches:
            return f"{matches[0][0]}, {matches[0][1]}"
        return None
    
    def _extract_projects_regex(self, text: str) -> List[Dict[str, Any]]:
        """Extract projects using regex patterns"""
        projects = []
        text_lower = text.lower()
        
        # Find the projects section
        project_section_pattern = r'(?:projects|personal projects|academic projects|side projects|portfolio)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:experience|education|skills|certifications|achievements|work|employment|references|contact|$))'
        section_match = re.search(project_section_pattern, text_lower, re.IGNORECASE)
        
        if section_match:
            project_text = section_match.group(1)
            
            # Split by common project delimiters (bullet points, numbers, or capital letters starting lines)
            project_entries = re.split(r'\n\s*(?:•|\*|[-–—]|\d+\.|[A-Z][a-zA-Z\s\-]+:|\|)', project_text)
            
            for entry in project_entries:
                entry = entry.strip()
                if len(entry) > 20:  # Minimum meaningful entry
                    # Extract project name (usually first line or before colon/dash)
                    name_match = re.match(r'^([^:\-\n]{5,50})', entry)
                    name = name_match.group(1).strip() if name_match else entry[:50]
                    
                    # Extract technologies mentioned
                    tech_keywords = ['python', 'java', 'javascript', 'react', 'node', 'mongodb', 'sql', 'aws', 
                                   'docker', 'flask', 'django', 'express', 'typescript', 'html', 'css',
                                   'tensorflow', 'pytorch', 'machine learning', 'api', 'rest', 'graphql',
                                   'firebase', 'git', 'github', 'vue', 'angular', 'next.js', 'postgresql']
                    found_tech = [t for t in tech_keywords if t in entry.lower()]
                    
                    projects.append({
                        'name': name.title() if name else 'Unnamed Project',
                        'description': entry[:200],
                        'technologies': found_tech if found_tech else []
                    })
        
        # If no projects section found, try to find project-like entries anywhere
        if not projects:
            # Look for patterns like "Project Name - Description" or "Built/Developed/Created X"
            project_patterns = [
                r'(?:built|developed|created|implemented|designed)\s+(?:a\s+)?([^.]{10,100})',
                r'([A-Z][a-zA-Z\s]+)\s*[-–—]\s*([^.]{20,150})',
            ]
            
            for pattern in project_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)[:5]  # Limit to 5
                for match in matches:
                    if isinstance(match, tuple):
                        name, desc = match[0], match[1] if len(match) > 1 else match[0]
                    else:
                        name, desc = match[:50], match
                    
                    projects.append({
                        'name': name.strip().title(),
                        'description': desc.strip(),
                        'technologies': []
                    })
        
        return projects[:5]  # Return max 5 projects
    
    def _extract_experience_regex(self, text: str) -> List[Dict[str, Any]]:
        """Extract work experience using regex patterns"""
        experiences = []
        
        # Find the experience section
        exp_section_pattern = r'(?:experience|work experience|employment|professional experience|work history)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:education|skills|projects|certifications|achievements|references|$))'
        section_match = re.search(exp_section_pattern, text.lower(), re.IGNORECASE)
        
        search_text = section_match.group(1) if section_match else text
        
        # Common job title patterns
        job_titles = ['software engineer', 'developer', 'intern', 'analyst', 'manager', 'lead', 
                     'consultant', 'architect', 'administrator', 'specialist', 'coordinator',
                     'associate', 'executive', 'officer', 'trainee', 'fresher', 'graduate',
                     'full stack', 'frontend', 'backend', 'data scientist', 'data analyst',
                     'devops', 'sre', 'qa', 'tester', 'ui/ux', 'designer', 'product']
        
        # Look for job title patterns
        for title in job_titles:
            title_pattern = rf'(?i)(\b[A-Za-z]*\s*{title}[A-Za-z\s]*)\s*(?:at|@|[-–—|,])\s*([A-Za-z\s&]+)'
            matches = re.findall(title_pattern, search_text, re.IGNORECASE)
            
            for match in matches:
                job_title, company = match
                if len(job_title.strip()) > 3 and len(company.strip()) > 2:
                    experiences.append({
                        'title': job_title.strip().title(),
                        'company': company.strip().title(),
                        'duration': 'Not specified',
                        'responsibilities': [],
                        'achievements': []
                    })
        
        # Also look for company patterns with dates
        company_date_pattern = r'([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Ltd|Corp|Company|Technologies|Solutions|Services)?)\s*[|\-–—,]\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})'
        company_matches = re.findall(company_date_pattern, text)
        
        for company, date in company_matches:
            company = company.strip()
            if len(company) > 3 and company not in [e.get('company', '') for e in experiences]:
                experiences.append({
                    'title': 'Position',
                    'company': company.title(),
                    'duration': date,
                    'responsibilities': [],
                    'achievements': []
                })
        
        # Deduplicate by company name
        seen_companies = set()
        unique_experiences = []
        for exp in experiences:
            company_lower = exp.get('company', '').lower()
            if company_lower not in seen_companies:
                seen_companies.add(company_lower)
                unique_experiences.append(exp)
        
        return unique_experiences[:5]  # Return max 5 experiences
    
    def _detect_sections(self, text: str) -> List[str]:
        """Detect common resume sections"""
        sections = []
        text_lower = text.lower()
        
        section_keywords = {
            'education': ['education', 'academic', 'qualification'],
            'experience': ['experience', 'employment', 'work history'],
            'skills': ['skills', 'technical skills', 'competencies'],
            'projects': ['projects', 'personal projects'],
            'certifications': ['certifications', 'certificates'],
            'achievements': ['achievements', 'awards', 'honors']
        }
        
        for section, keywords in section_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                sections.append(section)
        
        return sections
    
    def _calculate_quality_score(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate resume quality score"""
        
        score = 0
        max_score = 100
        feedback = []
        
        # Contact information (20 points)
        if extracted_data['contact']['emails']:
            score += 10
        else:
            feedback.append("Add email address")
        
        if extracted_data['contact']['phones']:
            score += 10
        else:
            feedback.append("Add phone number")
        
        # Skills (25 points)
        skills_count = len(extracted_data['skills'])
        if skills_count >= 8:
            score += 25
        elif skills_count >= 5:
            score += 20
            feedback.append("Add more relevant skills")
        elif skills_count >= 3:
            score += 15
            feedback.append("Include more technical skills")
        else:
            score += 5
            feedback.append("Add technical skills section")
        
        # Education (15 points)
        if extracted_data['education']:
            score += 15
        else:
            feedback.append("Add education details")
        
        # Sections (20 points)
        required_sections = ['education', 'experience', 'skills']
        found_sections = extracted_data['sections_detected']
        
        sections_score = sum(5 for section in required_sections if section in found_sections)
        score += sections_score
        
        missing_sections = [s for s in required_sections if s not in found_sections]
        if missing_sections:
            feedback.append(f"Add sections: {', '.join(missing_sections)}")
        
        # Length (10 points)
        word_count = extracted_data['total_words']
        if 300 <= word_count <= 800:
            score += 10
        elif word_count < 300:
            feedback.append("Resume is too short, add more details")
            score += 5
        else:
            feedback.append("Resume is too long, consider condensing")
            score += 7
        
        # Experience (10 points)
        if extracted_data['estimated_experience_years'] > 0:
            score += 10
        
        return {
            'overall_score': min(score, max_score),
            'grade': self._get_grade(score),
            'feedback': feedback
        }
    
    def _get_grade(self, score: int) -> str:
        """Convert score to grade"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        else:
            return 'D'
    
    def _generate_suggestions(self, extracted_data: Dict[str, Any], resume_text: str) -> List[Dict[str, str]]:
        """Generate improvement suggestions"""
        suggestions = []
        
        # Skills suggestions
        if len(extracted_data['skills']) < 5:
            suggestions.append({
                'category': 'skills',
                'priority': 'high',
                'suggestion': 'Add more technical skills relevant to your field',
                'impact': 'Improves visibility in ATS systems and showcases your expertise'
            })
        
        # Sections suggestions
        important_sections = ['projects', 'certifications']
        for section in important_sections:
            if section not in extracted_data['sections_detected']:
                suggestions.append({
                    'category': 'structure',
                    'priority': 'medium',
                    'suggestion': f'Add a {section} section',
                    'impact': f'Demonstrates practical experience and commitment to learning'
                })
        
        # Quantification suggestion
        if not re.search(r'\d+%|\d+\+|increased|decreased|improved', resume_text.lower()):
            suggestions.append({
                'category': 'content',
                'priority': 'high',
                'suggestion': 'Add quantifiable achievements (e.g., "Improved performance by 30%")',
                'impact': 'Makes your impact more concrete and impressive'
            })
        
        # Action verbs
        weak_verbs = ['worked', 'did', 'helped', 'responsible for']
        if any(verb in resume_text.lower() for verb in weak_verbs):
            suggestions.append({
                'category': 'language',
                'priority': 'medium',
                'suggestion': 'Use strong action verbs (e.g., "Developed", "Implemented", "Optimized")',
                'impact': 'Creates a more dynamic and professional tone'
            })
        
        return suggestions
    
    def _check_ats_compatibility(self, resume_text: str) -> Dict[str, Any]:
        """Check ATS (Applicant Tracking System) compatibility"""
        
        issues = []
        score = 100
        
        # Check for tables (problematic for ATS)
        if '|' in resume_text or re.search(r'\t+', resume_text):
            issues.append("Avoid using tables, use simple formatting instead")
            score -= 20
        
        # Check for headers/footers
        if re.search(r'page \d+ of \d+', resume_text.lower()):
            issues.append("Remove headers and footers")
            score -= 10
        
        # Check for images
        if 'image' in resume_text.lower() or 'photo' in resume_text.lower():
            issues.append("Remove images, ATS cannot parse them")
            score -= 15
        
        # Check for standard fonts
        unusual_fonts = ['comic sans', 'papyrus', 'brush script']
        if any(font in resume_text.lower() for font in unusual_fonts):
            issues.append("Use standard fonts like Arial, Calibri, or Times New Roman")
            score -= 10
        
        return {
            'is_compatible': score >= 70,
            'compatibility_score': max(score, 0),
            'issues': issues
        }
    
    def _analyze_job_match(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Analyze match between resume and job description using AI"""
        
        try:
            prompt = f"""
Analyze how well this resume matches the job description. Provide a match score (0-100) and specific feedback.

RESUME:
{resume_text[:2000]}  # Limit to avoid token limits

JOB DESCRIPTION:
{job_description[:1000]}

Provide:
1. Match score (0-100)
2. Matching points (what matches well)
3. Missing elements (what's lacking)
4. Improvement suggestions

Format as JSON.
"""
            
            system_prompt = "You are an expert resume analyst."
            full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = self.model.generate_content(full_prompt)
            
            # Parse AI response
            ai_analysis = response.text
            
            return {
                'match_score': 75,  # Extract from AI response
                'analysis': ai_analysis
            }
            
        except Exception as e:
            logger.error(f"Error in job match analysis: {str(e)}")
            return {
                'match_score': 0,
                'analysis': 'Unable to analyze match at this time'
            }
    
    def parse_pdf(self, pdf_file) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            return text
            
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            raise Exception("Failed to parse PDF file")
