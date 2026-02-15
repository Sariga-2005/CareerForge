from groq import Groq
from typing import Dict, Any, List
import logging
from datetime import datetime
from config.settings import Config

logger = logging.getLogger('cognitive-screener')

class InterviewEvaluator:
    """
    AI-powered interview evaluation and feedback using Groq AI
    """
    
    def __init__(self):
        self.client = Groq(api_key=Config.GROQ_API_KEY)
        self.model_name = Config.GROQ_MODEL
        self.evaluation_criteria = Config.INTERVIEW_EVALUATION_CRITERIA
    
    def evaluate_interview(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive interview evaluation
        """
        try:
            questions = interview_data.get('questions', [])
            answers = interview_data.get('answers', [])
            interview_type = interview_data.get('type', 'technical')
            
            if len(questions) != len(answers):
                return {
                    'success': False,
                    'error': 'Questions and answers count mismatch'
                }
            
            # Evaluate each Q&A pair
            qa_evaluations = []
            for i, (question, answer) in enumerate(zip(questions, answers)):
                evaluation = self._evaluate_answer(question, answer, interview_type)
                qa_evaluations.append({
                    'question_number': i + 1,
                    'question': question,
                    'answer': answer,
                    'evaluation': evaluation
                })
            
            # Calculate overall scores
            overall_scores = self._calculate_overall_scores(qa_evaluations)
            
            # Generate comprehensive feedback
            feedback = self._generate_feedback(qa_evaluations, overall_scores)
            
            return {
                'success': True,
                'interview_id': interview_data.get('interview_id'),
                'timestamp': datetime.now().isoformat(),
                'qa_evaluations': qa_evaluations,
                'overall_scores': overall_scores,
                'feedback': feedback,
                'recommendation': self._get_recommendation(overall_scores['total_score'])
            }
            
        except Exception as e:
            logger.error(f"Error evaluating interview: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _evaluate_answer(self, question: str, answer: str, interview_type: str) -> Dict[str, Any]:
        """Evaluate a single answer using AI"""
        
        try:
            prompt = f"""
Evaluate this interview answer based on the following criteria:

QUESTION: {question}

ANSWER: {answer}

INTERVIEW TYPE: {interview_type}

Rate each criterion on a scale of 1-10 and provide brief feedback:
1. Technical Accuracy (if applicable)
2. Communication Clarity
3. Problem-Solving Approach
4. Depth of Knowledge
5. Confidence and Professionalism

Provide scores and 1-2 sentence feedback for each criterion.
"""
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer and evaluator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4096
            )
            
            ai_feedback = response.choices[0].message.content
            
            # For now, use heuristic scoring as fallback
            scores = self._heuristic_scoring(answer)
            
            return {
                'scores': scores,
                'ai_feedback': ai_feedback,
                'answer_length': len(answer.split()),
                'answer_quality': self._assess_answer_quality(answer)
            }
            
        except Exception as e:
            logger.error(f"Error in AI evaluation: {str(e)}")
            # Fallback to heuristic evaluation
            return {
                'scores': self._heuristic_scoring(answer),
                'ai_feedback': 'AI evaluation temporarily unavailable',
                'answer_length': len(answer.split()),
                'answer_quality': self._assess_answer_quality(answer)
            }
    
    def _heuristic_scoring(self, answer: str) -> Dict[str, float]:
        """Heuristic-based scoring when AI is unavailable"""
        
        word_count = len(answer.split())
        
        # Base score on answer length and structure
        base_score = 5.0
        
        # Length bonus
        if 50 <= word_count <= 200:
            length_bonus = 2.0
        elif 30 <= word_count < 50 or 200 < word_count <= 300:
            length_bonus = 1.0
        else:
            length_bonus = 0.0
        
        # Technical terms bonus
        technical_terms = ['algorithm', 'architecture', 'design pattern', 'optimize', 
                          'performance', 'scalability', 'database', 'api', 'framework']
        tech_bonus = sum(1 for term in technical_terms if term in answer.lower()) * 0.5
        
        # Structure bonus (has examples, explanations)
        structure_bonus = 0
        if 'for example' in answer.lower() or 'such as' in answer.lower():
            structure_bonus += 1.0
        if 'because' in answer.lower() or 'since' in answer.lower():
            structure_bonus += 0.5
        
        final_score = min(base_score + length_bonus + tech_bonus + structure_bonus, 10.0)
        
        return {
            'technical_accuracy': final_score,
            'communication_clarity': final_score - 0.5,
            'problem_solving': final_score - 1.0,
            'depth_of_knowledge': final_score - 0.5,
            'confidence': final_score
        }
    
    def _assess_answer_quality(self, answer: str) -> str:
        """Assess overall answer quality"""
        
        word_count = len(answer.split())
        
        if word_count < 20:
            return 'too_brief'
        elif word_count > 300:
            return 'too_long'
        elif word_count >= 50:
            return 'good'
        else:
            return 'adequate'
    
    def _calculate_overall_scores(self, qa_evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate overall scores across all answers"""
        
        if not qa_evaluations:
            return {
                'total_score': 0,
                'average_score': 0,
                'criteria_scores': {}
            }
        
        # Aggregate scores by criteria
        criteria_totals = {}
        count = len(qa_evaluations)
        
        for qa in qa_evaluations:
            scores = qa['evaluation']['scores']
            for criterion, score in scores.items():
                if criterion not in criteria_totals:
                    criteria_totals[criterion] = 0
                criteria_totals[criterion] += score
        
        # Calculate averages
        criteria_averages = {
            criterion: round(total / count, 2)
            for criterion, total in criteria_totals.items()
        }
        
        average_score = sum(criteria_averages.values()) / len(criteria_averages)
        total_score = round(average_score * 10, 2)  # Scale to 100
        
        return {
            'total_score': total_score,
            'average_score': round(average_score, 2),
            'criteria_scores': criteria_averages,
            'grade': self._get_grade(total_score)
        }
    
    def _get_grade(self, score: float) -> str:
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
    
    def _generate_feedback(self, qa_evaluations: List[Dict[str, Any]], 
                          overall_scores: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive feedback"""
        
        strengths = []
        areas_for_improvement = []
        
        # Analyze criteria scores
        criteria_scores = overall_scores['criteria_scores']
        
        for criterion, score in criteria_scores.items():
            if score >= 8.0:
                strengths.append(f"Strong {criterion.replace('_', ' ')}")
            elif score < 6.0:
                areas_for_improvement.append(f"Improve {criterion.replace('_', ' ')}")
        
        # Analyze answer patterns
        brief_answers = sum(1 for qa in qa_evaluations 
                          if qa['evaluation']['answer_quality'] == 'too_brief')
        
        if brief_answers > len(qa_evaluations) / 2:
            areas_for_improvement.append("Provide more detailed answers with examples")
        
        long_answers = sum(1 for qa in qa_evaluations 
                         if qa['evaluation']['answer_quality'] == 'too_long')
        
        if long_answers > len(qa_evaluations) / 2:
            areas_for_improvement.append("Be more concise and focus on key points")
        
        return {
            'strengths': strengths if strengths else ["Show consistent performance across answers"],
            'areas_for_improvement': areas_for_improvement if areas_for_improvement else ["Continue practicing to refine your skills"],
            'key_takeaways': self._generate_key_takeaways(overall_scores),
            'next_steps': self._suggest_next_steps(overall_scores)
        }
    
    def _generate_key_takeaways(self, overall_scores: Dict[str, Any]) -> List[str]:
        """Generate key takeaways from the interview"""
        
        score = overall_scores['total_score']
        
        if score >= 80:
            return [
                "Excellent performance overall",
                "Demonstrated strong technical knowledge",
                "Clear and effective communication"
            ]
        elif score >= 60:
            return [
                "Good foundational knowledge",
                "Some areas need strengthening",
                "Practice explaining complex concepts"
            ]
        else:
            return [
                "Need more preparation and practice",
                "Focus on fundamental concepts",
                "Work on communication skills"
            ]
    
    def _suggest_next_steps(self, overall_scores: Dict[str, Any]) -> List[str]:
        """Suggest next steps for improvement"""
        
        score = overall_scores['total_score']
        
        if score >= 80:
            return [
                "Apply to senior positions",
                "Prepare for system design interviews",
                "Focus on leadership and soft skills"
            ]
        elif score >= 60:
            return [
                "Practice more coding problems",
                "Review fundamental concepts",
                "Conduct mock interviews"
            ]
        else:
            return [
                "Take online courses to strengthen fundamentals",
                "Practice explaining technical concepts clearly",
                "Schedule regular mock interviews",
                "Build more projects to gain practical experience"
            ]
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        
        if score >= 85:
            return "Strong Hire - Excellent performance across all criteria"
        elif score >= 70:
            return "Hire - Good candidate with solid potential"
        elif score >= 55:
            return "Maybe - Needs improvement in some areas"
        else:
            return "No Hire - Significant gaps in knowledge or communication"
