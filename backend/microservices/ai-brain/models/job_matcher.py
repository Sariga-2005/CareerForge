import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
import logging
import json
import uuid
from groq import Groq
from config.settings import Config
from config.qdrant_client import qdrant
from qdrant_client.models import PointStruct

logger = logging.getLogger('ai-brain')

class JobMatcher:
    """
    Advanced job matching using NLP, ML techniques, and Groq AI
    """
    
    def __init__(self):
        # Initialize Groq AI
        self.client = Groq(api_key=Config.GROQ_API_KEY)
        self.model = Config.GROQ_MODEL
        
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.skill_weights = {
            'exact_match': 2.0,
            'partial_match': 1.0,
            'experience': 1.5,
            'education': 1.2,
            'location': 0.8
        }
    
    def calculate_match_score(self, student_profile: Dict[str, Any], job: Dict[str, Any]) -> float:
        """
        Calculate comprehensive match score between student and job
        """
        try:
            # Skills matching
            skills_score = self._calculate_skills_match(
                student_profile.get('skills', []),
                job.get('required_skills', [])
            )
            
            # Experience matching
            experience_score = self._calculate_experience_match(
                student_profile.get('experience', 0),
                job.get('min_experience', 0),
                job.get('max_experience', 10)
            )
            
            # Education matching
            education_score = self._calculate_education_match(
                student_profile.get('education', ''),
                job.get('required_education', '')
            )
            
            # Text similarity (resume vs job description)
            text_similarity = self._calculate_text_similarity(
                student_profile.get('resume_text', ''),
                job.get('description', '')
            )
            
            # Weighted combination
            total_score = (
                skills_score * 0.4 +
                experience_score * 0.25 +
                education_score * 0.15 +
                text_similarity * 0.2
            )
            
            return min(total_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating match score: {str(e)}")
            return 0.0
    
    def _calculate_skills_match(self, student_skills: List[str], required_skills: List[str]) -> float:
        """Calculate skills match score"""
        if not student_skills or not required_skills:
            return 0.0
        
        student_skills_lower = [s.lower() for s in student_skills]
        required_skills_lower = [s.lower() for s in required_skills]
        
        matched_skills = set(student_skills_lower) & set(required_skills_lower)
        
        if len(required_skills) == 0:
            return 0.0
        
        return len(matched_skills) / len(required_skills)
    
    def _calculate_experience_match(self, student_exp: float, min_exp: float, max_exp: float) -> float:
        """Calculate experience match score"""
        if student_exp < min_exp:
            # Penalize below minimum
            return max(0.0, 1.0 - (min_exp - student_exp) * 0.2)
        elif student_exp > max_exp:
            # Slight penalty for overqualification
            return max(0.7, 1.0 - (student_exp - max_exp) * 0.1)
        else:
            return 1.0
    
    def _calculate_education_match(self, student_edu: str, required_edu: str) -> float:
        """Calculate education match score"""
        education_hierarchy = {
            'phd': 5,
            'doctorate': 5,
            'masters': 4,
            'mba': 4,
            'bachelors': 3,
            'diploma': 2,
            'high school': 1
        }
        
        student_level = 0
        required_level = 0
        
        student_edu_lower = student_edu.lower()
        required_edu_lower = required_edu.lower()
        
        for edu, level in education_hierarchy.items():
            if edu in student_edu_lower:
                student_level = max(student_level, level)
            if edu in required_edu_lower:
                required_level = max(required_level, level)
        
        if student_level >= required_level:
            return 1.0
        else:
            return max(0.0, student_level / required_level if required_level > 0 else 0.5)
    
    def _calculate_text_similarity(self, student_text: str, job_text: str) -> float:
        """Calculate text similarity using TF-IDF and cosine similarity"""
        if not student_text or not job_text:
            return 0.0
        
        try:
            vectors = self.embedding_model.encode([student_text, job_text])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating text similarity: {str(e)}")
            return 0.0
            
    def index_job(self, job: Dict[str, Any]) -> bool:
        """Index a job into Qdrant Vector DB"""
        if not qdrant:
            logger.warning("Qdrant client not initialized, skipping job indexing")
            return False
            
        try:
            job_id = job.get('id') or job.get('_id') or str(uuid.uuid4())
            if isinstance(job_id, dict):
                job_id = str(job_id.get('$oid', uuid.uuid4()))
                
            # Create a rich text representation of the job for embedding
            title = job.get('title', '')
            company = job.get('company', '')
            description = job.get('description', '')
            skills = ', '.join(job.get('required_skills', []))
            
            job_text = f"{title} at {company}. {description}. Required skills: {skills}"
            vector = self.embedding_model.encode(job_text).tolist()
            
            # Ensure job_id is a valid UUID for Qdrant
            try:
                point_id = str(uuid.UUID(str(job_id)))
            except ValueError:
                import hashlib
                hash_id = hashlib.md5(str(job_id).encode()).hexdigest()
                point_id = str(uuid.UUID(hash_id))
            
            payload = {
                'original_id': str(job_id),
                'title': title,
                'company': company,
                'required_skills': job.get('required_skills', []),
                'min_experience': job.get('min_experience', 0),
                'max_experience': job.get('max_experience', 10),
                'required_education': job.get('required_education', '')
            }
            
            qdrant.upsert(
                collection_name="jobs",
                points=[PointStruct(id=point_id, vector=vector, payload=payload)]
            )
            logger.info(f"Successfully indexed job {title} to Qdrant")
            return True
            
        except Exception as e:
            logger.error(f"Error indexing job to Qdrant: {str(e)}")
            return False

    def rank_jobs(self, student_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank jobs based on match scores
        """
        scored_jobs = []
        
        for job in jobs:
            score = self.calculate_match_score(student_profile, job)
            scored_jobs.append({
                **job,
                'match_score': score,
                'match_percentage': round(score * 100, 2)
            })
        
        # Sort by match score (descending)
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return scored_jobs

    def ai_analyze_job_fit(self, student_profile: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use AI to provide detailed analysis of job fit with recommendations
        """
        try:
            skills = ', '.join(student_profile.get('skills', []))
            education = student_profile.get('education', 'Not specified')
            experience = student_profile.get('experience', 0)
            
            job_title = job.get('title', 'Unknown Position')
            job_company = job.get('company', 'Unknown Company')
            job_description = job.get('description', '')
            required_skills = ', '.join(job.get('required_skills', []))
            
            prompt = f"""
Analyze this job match and provide detailed insights:

CANDIDATE PROFILE:
- Skills: {skills}
- Education: {education}
- Years of Experience: {experience}

JOB DETAILS:
- Title: {job_title}
- Company: {job_company}
- Description: {job_description[:1000]}
- Required Skills: {required_skills}

Provide analysis in JSON format:
{{
    "overall_fit_percentage": 0-100,
    "strengths": ["why the candidate is a good fit"],
    "gaps": ["skills or experience gaps"],
    "recommendations": ["what the candidate should do to improve their chances"],
    "interview_tips": ["specific tips for this role"],
    "salary_expectation": "estimated salary range if applicable",
    "growth_potential": "career growth opportunities in this role"
}}
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            response_text = response.choices[0].message.content.strip()
            
            # Clean up response
            if response_text.startswith('```'):
                import re
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            analysis = json.loads(response_text)
            
            return {
                'success': True,
                'analysis': analysis
            }
            
        except Exception as e:
            logger.error(f"AI job fit analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'analysis': {
                    'overall_fit_percentage': self.calculate_match_score(student_profile, job) * 100,
                    'strengths': ['Unable to generate AI analysis'],
                    'gaps': [],
                    'recommendations': ['Complete your profile for better analysis']
                }
            }

    def ai_recommend_jobs(self, student_profile: Dict[str, Any], limit: int = 5) -> Dict[str, Any]:
        """
        Use AI to recommend ideal job types and roles for the student
        """
        try:
            skills = ', '.join(student_profile.get('skills', []))
            education = student_profile.get('education', 'Not specified')
            experience = student_profile.get('experience', 0)
            interests = ', '.join(student_profile.get('interests', []))
            
            prompt = f"""
Based on this candidate's profile, recommend the top {limit} job roles they should pursue:

CANDIDATE PROFILE:
- Skills: {skills}
- Education: {education}
- Years of Experience: {experience}
- Interests: {interests}

For each recommended role, provide in JSON format:
{{
    "recommendations": [
        {{
            "job_title": "specific job title",
            "industry": "target industry",
            "company_types": ["types of companies to target"],
            "why_suitable": "why this role matches their profile",
            "skills_to_highlight": ["skills they should emphasize"],
            "skills_to_develop": ["skills they should learn"],
            "expected_salary_range": "salary range in INR",
            "job_search_keywords": ["keywords to use when job hunting"]
        }}
    ]
}}
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            response_text = response.choices[0].message.content.strip()
            
            # Clean up response
            if response_text.startswith('```'):
                import re
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            recommendations = json.loads(response_text)
            
            return {
                'success': True,
                'recommendations': recommendations.get('recommendations', [])
            }
            
        except Exception as e:
            logger.error(f"AI job recommendations failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'recommendations': []
            }

    # =========================================================================
    # RAG (Retrieval-Augmented Generation) Pipeline
    # =========================================================================

    def semantic_search_jobs(self, query_text: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        RETRIEVAL STEP: Convert query text into a vector embedding and search
        Qdrant for the most semantically similar jobs.
        
        This is the 'R' in RAG — instead of passing ALL jobs to the LLM,
        we retrieve only the most relevant ones from the Vector DB.
        """
        if not qdrant:
            logger.warning("Qdrant client not available, cannot perform semantic search")
            return []

        try:
            # Encode the query (student profile / resume text) into a vector
            query_vector = self.embedding_model.encode(query_text).tolist()

            # Search Qdrant for the closest job vectors
            search_results = qdrant.query_points(
                collection_name="jobs",
                query=query_vector,
                limit=limit,
                with_payload=True
            )

            retrieved_jobs = []
            for result in search_results.points:
                job_data = result.payload or {}
                job_data['vector_score'] = round(result.score, 4)
                retrieved_jobs.append(job_data)

            logger.info(
                f"Semantic search retrieved {len(retrieved_jobs)} jobs "
                f"(top score: {retrieved_jobs[0]['vector_score'] if retrieved_jobs else 'N/A'})"
            )
            return retrieved_jobs

        except Exception as e:
            logger.error(f"Semantic search failed: {str(e)}")
            return []

    def rag_analyze_match(self, student_profile: Dict[str, Any], limit: int = 5) -> Dict[str, Any]:
        """
        FULL RAG PIPELINE:
          1. RETRIEVE  — Query Qdrant with the student's profile to find the
                         most semantically relevant jobs.
          2. AUGMENT   — Inject those retrieved jobs into a structured prompt.
          3. GENERATE  — Send the augmented prompt to the Groq LLM to produce
                         a rich, personalized career analysis.

        This is fundamentally different from the old approach which either:
          - Dumped the entire resume + job text into the LLM (no retrieval), or
          - Used keyword TF-IDF matching (no generation).
        """
        try:
            # --- Step 1: BUILD QUERY from student profile ---
            skills = ', '.join(student_profile.get('skills', []))
            education = student_profile.get('education', 'Not specified')
            experience = student_profile.get('experience', 0)
            resume_text = student_profile.get('resume_text', '')

            query_text = (
                f"Looking for jobs matching: {skills}. "
                f"Education: {education}. "
                f"Experience: {experience} years. "
                f"{resume_text[:2000]}"
            )

            # --- Step 2: RETRIEVE from Qdrant Vector DB ---
            retrieved_jobs = self.semantic_search_jobs(query_text, limit=limit)

            if not retrieved_jobs:
                logger.warning("RAG retrieval returned no jobs, falling back to AI-only recommendations")
                return self.ai_recommend_jobs(student_profile, limit)

            # --- Step 3: AUGMENT the LLM prompt with retrieved context ---
            retrieved_context = ""
            for i, job in enumerate(retrieved_jobs, 1):
                retrieved_context += (
                    f"\n{i}. {job.get('title', 'Unknown')} at {job.get('company', 'Unknown')}\n"
                    f"   Required Skills: {', '.join(job.get('required_skills', []))}\n"
                    f"   Experience: {job.get('min_experience', 0)}-{job.get('max_experience', 'N/A')} years\n"
                    f"   Education: {job.get('required_education', 'Not specified')}\n"
                    f"   Semantic Match Score: {job.get('vector_score', 0)}\n"
                )

            prompt = f"""You are an expert career advisor. I have used a vector database to 
semantically retrieve the most relevant job openings for a candidate. Analyze the match 
between the candidate and EACH retrieved job.

CANDIDATE PROFILE:
- Skills: {skills}
- Education: {education}
- Years of Experience: {experience}
- Resume Summary: {resume_text[:1500]}

RETRIEVED JOBS (ranked by semantic similarity from our Vector DB):
{retrieved_context}

Based on this retrieved data, provide a detailed analysis in JSON format:
{{
    "rag_analysis": {{
        "retrieval_summary": "Brief explanation of what the vector search found",
        "top_matches": [
            {{
                "job_title": "title from retrieved jobs",
                "company": "company name",
                "fit_score": 0-100,
                "semantic_similarity": "the vector_score from retrieval",
                "why_good_fit": "detailed explanation using candidate's actual skills",
                "skill_gaps": ["specific missing skills for THIS job"],
                "preparation_tips": ["actionable steps to prepare for this role"]
            }}
        ],
        "overall_career_advice": "personalized advice based on the pattern of retrieved jobs",
        "skills_in_demand": ["skills that appear across multiple retrieved jobs"],
        "recommended_learning_path": ["ordered list of skills to learn next"]
    }}
}}
"""

            # --- Step 4: GENERATE with LLM ---
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a career analysis AI. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4096
            )
            response_text = response.choices[0].message.content.strip()

            # Clean markdown code fences if present
            if response_text.startswith('```'):
                import re
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)

            analysis = json.loads(response_text)

            return {
                'success': True,
                'method': 'RAG (Retrieval-Augmented Generation)',
                'jobs_retrieved_from_vectordb': len(retrieved_jobs),
                'analysis': analysis.get('rag_analysis', analysis),
                'retrieved_jobs': retrieved_jobs
            }

        except Exception as e:
            logger.error(f"RAG analysis failed: {str(e)}")
            return {
                'success': False,
                'method': 'RAG (failed, see error)',
                'error': str(e),
                'analysis': {}
            }

    def batch_index_jobs(self, jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Index multiple jobs into Qdrant in one call"""
        indexed = 0
        failed = 0
        for job in jobs:
            if self.index_job(job):
                indexed += 1
            else:
                failed += 1
        return {
            'total': len(jobs),
            'indexed': indexed,
            'failed': failed
        }
