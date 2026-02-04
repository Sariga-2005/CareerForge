from flask import Blueprint, request, jsonify
import logging
from models.interview_evaluator import InterviewEvaluator

logger = logging.getLogger('cognitive-screener')
interview_evaluation_bp = Blueprint('interview_evaluation', __name__)

evaluator = InterviewEvaluator()

@interview_evaluation_bp.route('/evaluate', methods=['POST'])
def evaluate_interview():
    """
    Evaluate complete interview performance
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'questions' not in data or 'answers' not in data:
            return jsonify({'error': 'Both questions and answers are required'}), 400
        
        # Perform evaluation
        result = evaluator.evaluate_interview(data)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"Error evaluating interview: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_evaluation_bp.route('/evaluate-answer', methods=['POST'])
def evaluate_single_answer():
    """
    Evaluate a single interview answer
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        question = data.get('question')
        answer = data.get('answer')
        interview_type = data.get('interview_type', 'technical')
        
        if not question or not answer:
            return jsonify({'error': 'Both question and answer are required'}), 400
        
        # Evaluate answer
        evaluation = evaluator._evaluate_answer(question, answer, interview_type)
        
        return jsonify({
            'success': True,
            'question': question,
            'answer': answer,
            'evaluation': evaluation
        }), 200
        
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_evaluation_bp.route('/feedback', methods=['POST'])
def get_interview_feedback():
    """
    Get detailed feedback for interview performance
    """
    try:
        data = request.get_json()
        
        if not data or 'interview_id' not in data:
            return jsonify({'error': 'Interview ID is required'}), 400
        
        # In a real implementation, fetch interview data from database
        # For now, accept the full interview data
        if 'questions' not in data or 'answers' not in data:
            return jsonify({'error': 'Interview data (questions and answers) is required'}), 400
        
        # Evaluate interview
        result = evaluator.evaluate_interview(data)
        
        if result['success']:
            # Return only feedback portion
            return jsonify({
                'success': True,
                'interview_id': result['interview_id'],
                'overall_scores': result['overall_scores'],
                'feedback': result['feedback'],
                'recommendation': result['recommendation']
            }), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"Error getting feedback: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_evaluation_bp.route('/scores', methods=['POST'])
def get_interview_scores():
    """
    Get only the scores for an interview
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        questions = data.get('questions', [])
        answers = data.get('answers', [])
        
        if not questions or not answers:
            return jsonify({'error': 'Questions and answers are required'}), 400
        
        if len(questions) != len(answers):
            return jsonify({'error': 'Questions and answers count mismatch'}), 400
        
        # Evaluate each answer
        qa_evaluations = []
        for question, answer in zip(questions, answers):
            evaluation = evaluator._evaluate_answer(question, answer, data.get('type', 'technical'))
            qa_evaluations.append({
                'question': question,
                'evaluation': evaluation
            })
        
        # Calculate overall scores
        overall_scores = evaluator._calculate_overall_scores(qa_evaluations)
        
        return jsonify({
            'success': True,
            'overall_scores': overall_scores,
            'individual_scores': [
                {
                    'question': qa['question'],
                    'scores': qa['evaluation']['scores']
                }
                for qa in qa_evaluations
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting scores: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
