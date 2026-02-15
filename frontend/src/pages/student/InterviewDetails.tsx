import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ChartBarIcon,
  MicrophoneIcon,
  PlayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  duration?: number;
}

interface InterviewDetails {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  questions: InterviewQuestion[];
  metrics?: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    confidenceScore: number;
  };
  feedback?: string;
  passed?: boolean;
}

const InterviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInterviewDetails();
    }
  }, [id]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/interview/${id}`);
      if (response.data.success) {
        setInterview(response.data.interview);
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      toast.error('Failed to load interview details');
      navigate('/student/interview/history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-muted">Interview not found</p>
        <button
          onClick={() => navigate('/student/interview/history')}
          className="btn-primary mt-4"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/student/interview/history')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Interview History
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              interview.passed ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              {interview.passed ? (
                <CheckCircleIcon className="w-8 h-8 text-success" />
              ) : (
                <XCircleIcon className="w-8 h-8 text-warning" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary capitalize">
                {interview.type} Interview
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {formatDate(interview.completedAt || interview.startedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {formatDuration(interview.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  {interview.questions.length} Questions
                </span>
              </div>
            </div>
          </div>
          <div className={`badge ${interview.passed ? 'badge-success' : 'badge-warning'} text-lg px-4 py-2`}>
            {interview.passed ? 'Passed' : 'Needs Improvement'}
          </div>
        </div>
      </motion.div>

      {/* Scores Overview */}
      {interview.metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <div className="card text-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <p className={`text-4xl font-bold ${getScoreColor(interview.metrics.overallScore)}`}>
              {interview.metrics.overallScore}%
            </p>
            <p className="text-sm text-text-muted mt-1">Overall Score</p>
          </div>
          <div className="card text-center">
            <p className={`text-2xl font-bold ${getScoreColor(interview.metrics.technicalScore)}`}>
              {interview.metrics.technicalScore}%
            </p>
            <p className="text-xs text-text-muted mt-1">Technical</p>
          </div>
          <div className="card text-center">
            <p className={`text-2xl font-bold ${getScoreColor(interview.metrics.communicationScore)}`}>
              {interview.metrics.communicationScore}%
            </p>
            <p className="text-xs text-text-muted mt-1">Communication</p>
          </div>
          <div className="card text-center">
            <p className={`text-2xl font-bold ${getScoreColor(interview.metrics.problemSolvingScore || 0)}`}>
              {interview.metrics.problemSolvingScore || 0}%
            </p>
            <p className="text-xs text-text-muted mt-1">Problem Solving</p>
          </div>
          <div className="card text-center">
            <p className={`text-2xl font-bold ${getScoreColor(interview.metrics.confidenceScore || 0)}`}>
              {interview.metrics.confidenceScore || 0}%
            </p>
            <p className="text-xs text-text-muted mt-1">Confidence</p>
          </div>
        </motion.div>
      )}

      {/* Overall Feedback */}
      {interview.feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">AI Feedback Summary</h3>
              <p className="text-text-secondary">{interview.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions & Answers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
          Questions & Answers
        </h2>

        <div className="space-y-4">
          {interview.questions.map((q, index) => (
            <motion.div
              key={q.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`border rounded-xl overflow-hidden transition-all ${
                expandedQuestion === q.id ? 'border-primary' : 'border-surface-300'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="font-medium text-text-primary text-left">{q.question}</p>
                </div>
                <div className="flex items-center gap-3">
                  {q.feedback?.score !== undefined && (
                    <span className={`text-lg font-bold ${getScoreColor(q.feedback.score)}`}>
                      {q.feedback.score}%
                    </span>
                  )}
                  <ChartBarIcon className={`w-5 h-5 transition-transform ${
                    expandedQuestion === q.id ? 'rotate-180 text-primary' : 'text-text-light'
                  }`} />
                </div>
              </button>

              {/* Expanded Content */}
              {expandedQuestion === q.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-surface-300"
                >
                  <div className="p-4 space-y-4">
                    {/* User's Answer */}
                    <div className="p-4 bg-surface-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MicrophoneIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-text-secondary">Your Answer</span>
                      </div>
                      <p className="text-text-primary">
                        {q.answer || 'No answer recorded'}
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {q.feedback && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        {q.feedback.strengths?.length > 0 && (
                          <div className="p-4 bg-success/5 rounded-xl border border-success/20">
                            <h4 className="flex items-center gap-2 font-medium text-success mb-3">
                              <CheckCircleIcon className="w-5 h-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2">
                              {q.feedback.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {q.feedback.improvements?.length > 0 && (
                          <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
                            <h4 className="flex items-center gap-2 font-medium text-warning mb-3">
                              <LightBulbIcon className="w-5 h-5" />
                              Areas to Improve
                            </h4>
                            <ul className="space-y-2">
                              {q.feedback.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggestions */}
                    {q.feedback?.suggestions && q.feedback.suggestions.length > 0 && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <h4 className="flex items-center gap-2 font-medium text-primary mb-3">
                          <SparklesIcon className="w-5 h-5" />
                          AI Suggestions
                        </h4>
                        <ul className="space-y-2">
                          {q.feedback.suggestions.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-4"
      >
        <button
          onClick={() => navigate('/student/interview')}
          className="btn-primary"
        >
          <PlayIcon className="w-5 h-5" />
          Practice Again
        </button>
        <button
          onClick={() => navigate('/student/interview/history')}
          className="btn-secondary"
        >
          View All Interviews
        </button>
      </motion.div>
    </div>
  );
};

export default InterviewDetailsPage;
