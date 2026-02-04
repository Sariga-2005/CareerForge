from flask import Blueprint, request, jsonify
import logging
from typing import List, Dict
import random

logger = logging.getLogger('cognitive-screener')
cognitive_assessment_bp = Blueprint('cognitive_assessment', __name__)

# Mock question bank - in production, fetch from database
QUESTION_BANK = {
    'technical': [
        {
            'id': 'tech_1',
            'question': 'Explain the difference between Stack and Queue data structures.',
            'difficulty': 'medium',
            'category': 'data-structures'
        },
        {
            'id': 'tech_2',
            'question': 'What is time complexity? Explain with an example.',
            'difficulty': 'medium',
            'category': 'algorithms'
        },
        {
            'id': 'tech_3',
            'question': 'Describe the SOLID principles in software engineering.',
            'difficulty': 'hard',
            'category': 'design-patterns'
        },
        {
            'id': 'tech_4',
            'question': 'What is the difference between SQL and NoSQL databases?',
            'difficulty': 'easy',
            'category': 'databases'
        },
        {
            'id': 'tech_5',
            'question': 'Explain RESTful API design principles.',
            'difficulty': 'medium',
            'category': 'web-development'
        }
    ],
    'behavioral': [
        {
            'id': 'behav_1',
            'question': 'Tell me about a time you worked on a challenging team project.',
            'difficulty': 'medium',
            'category': 'teamwork'
        },
        {
            'id': 'behav_2',
            'question': 'Describe a situation where you had to learn something new quickly.',
            'difficulty': 'easy',
            'category': 'learning-agility'
        },
        {
            'id': 'behav_3',
            'question': 'How do you handle conflicting priorities?',
            'difficulty': 'medium',
            'category': 'time-management'
        }
    ],
    'aptitude': [
        {
            'id': 'apt_1',
            'question': 'If a train travels 120 km in 2 hours, what is its speed?',
            'difficulty': 'easy',
            'category': 'mathematics',
            'options': ['40 km/h', '60 km/h', '80 km/h', '100 km/h'],
            'correct_answer': '60 km/h'
        },
        {
            'id': 'apt_2',
            'question': 'Complete the series: 2, 6, 12, 20, ?',
            'difficulty': 'medium',
            'category': 'logical-reasoning',
            'options': ['28', '30', '32', '34'],
            'correct_answer': '30'
        }
    ]
}

@cognitive_assessment_bp.route('/generate-questions', methods=['POST'])
def generate_questions():
    """
    Generate assessment questions based on criteria
    """
    try:
        data = request.get_json()
        
        assessment_type = data.get('type', 'technical')
        difficulty = data.get('difficulty', 'medium')
        count = data.get('count', 5)
        categories = data.get('categories', [])
        
        # Get questions from bank
        available_questions = QUESTION_BANK.get(assessment_type, [])
        
        # Filter by difficulty if specified
        if difficulty != 'all':
            available_questions = [
                q for q in available_questions 
                if q['difficulty'] == difficulty
            ]
        
        # Filter by categories if specified
        if categories:
            available_questions = [
                q for q in available_questions 
                if q['category'] in categories
            ]
        
        # Randomly select questions
        if len(available_questions) > count:
            selected_questions = random.sample(available_questions, count)
        else:
            selected_questions = available_questions
        
        return jsonify({
            'success': True,
            'assessment_type': assessment_type,
            'questions': selected_questions,
            'total_questions': len(selected_questions),
            'time_limit': len(selected_questions) * 300  # 5 minutes per question
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@cognitive_assessment_bp.route('/evaluate-aptitude', methods=['POST'])
def evaluate_aptitude_test():
    """
    Evaluate aptitude test with multiple choice answers
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({'error': 'Answers are required'}), 400
        
        # Evaluate answers
        results = []
        correct_count = 0
        
        for answer_data in answers:
            question_id = answer_data.get('question_id')
            user_answer = answer_data.get('answer')
            
            # Find correct answer from question bank
            correct_answer = None
            for question in QUESTION_BANK.get('aptitude', []):
                if question['id'] == question_id:
                    correct_answer = question.get('correct_answer')
                    break
            
            is_correct = user_answer == correct_answer
            if is_correct:
                correct_count += 1
            
            results.append({
                'question_id': question_id,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct
            })
        
        # Calculate score
        total_questions = len(answers)
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        return jsonify({
            'success': True,
            'results': results,
            'score': round(score, 2),
            'correct_answers': correct_count,
            'total_questions': total_questions,
            'grade': _get_grade(score),
            'passed': score >= 60
        }), 200
        
    except Exception as e:
        logger.error(f"Error evaluating aptitude test: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@cognitive_assessment_bp.route('/categories', methods=['GET'])
def get_assessment_categories():
    """
    Get available assessment categories
    """
    try:
        assessment_type = request.args.get('type', 'technical')
        
        questions = QUESTION_BANK.get(assessment_type, [])
        categories = list(set(q['category'] for q in questions))
        
        return jsonify({
            'success': True,
            'assessment_type': assessment_type,
            'categories': categories,
            'total_questions': len(questions)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@cognitive_assessment_bp.route('/difficulty-levels', methods=['GET'])
def get_difficulty_levels():
    """
    Get available difficulty levels
    """
    try:
        return jsonify({
            'success': True,
            'difficulty_levels': ['easy', 'medium', 'hard'],
            'recommended': 'medium'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting difficulty levels: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _get_grade(score: float) -> str:
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
