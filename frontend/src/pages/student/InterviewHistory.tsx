import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../../store';
import { fetchInterviewHistory } from '../../store/slices/interviewSlice';

const InterviewHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { interviews, isLoading } = useSelector((state: RootState) => state.interview);

  useEffect(() => {
    dispatch(fetchInterviewHistory());
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Interview History</h1>
            <p className="text-text-muted mt-1">Review your past mock interviews and track progress</p>
          </div>
          <motion.button
            onClick={() => navigate('/student/interview')}
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayIcon className="w-5 h-5" />
            New Interview
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {interviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary">{interviews.length}</p>
            <p className="text-sm text-text-muted">Total Interviews</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-success">
              {interviews.filter(i => i.passed).length}
            </p>
            <p className="text-sm text-text-muted">Passed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-secondary">
              {interviews.length > 0
                ? Math.round(interviews.reduce((acc, i) => acc + (i.metrics?.overallScore || 0), 0) / interviews.length)
                : 0}%
            </p>
            <p className="text-sm text-text-muted">Avg Score</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-warning">
              {interviews.filter(i => i.type === 'technical').length}
            </p>
            <p className="text-sm text-text-muted">Technical</p>
          </div>
        </motion.div>
      )}

      {/* Interview List */}
      {interviews.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {interviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card hover:shadow-card-lg hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/student/interview/${interview.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${interview.passed ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                    {interview.passed ? (
                      <CheckCircleIcon className="w-6 h-6 text-success" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-warning" />
                    )}
                  </div>

                  {/* Interview Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary capitalize">
                        {interview.type} Interview
                      </h3>
                      <span className={`badge ${interview.type === 'technical' ? 'badge-warning' : 'badge-primary'
                        }`}>
                        {interview.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatDuration(interview.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(interview.completedAt || interview.startedAt || '')}
                      </span>
                      <span>{interview.questions.length} questions</span>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${(interview.metrics?.overallScore || 0) >= 70 ? 'text-success' :
                        (interview.metrics?.overallScore || 0) >= 50 ? 'text-warning' : 'text-error'
                      }`}>
                      {interview.metrics?.overallScore || 0}%
                    </p>
                    <p className="text-xs text-text-muted">Overall</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary">
                        {interview.metrics?.technicalScore || 0}%
                      </p>
                      <p className="text-xs text-text-muted">Technical</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-secondary">
                        {interview.metrics?.communicationScore || 0}%
                      </p>
                      <p className="text-xs text-text-muted">Communication</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-text-light group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Feedback Preview */}
              {interview.feedback && (
                <div className="mt-4 pt-4 border-t border-surface-300">
                  <p className="text-sm text-text-muted line-clamp-2">{interview.feedback}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <VideoCameraIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Interviews Yet</h3>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Start practicing with AI mock interviews to improve your skills and get detailed feedback
          </p>
          <motion.button
            onClick={() => navigate('/student/interview')}
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayIcon className="w-5 h-5" />
            Start Your First Interview
          </motion.button>
        </motion.div>
      )}

      {/* Tips Section */}
      {interviews.length > 0 && interviews.length < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Keep Practicing!</h4>
              <p className="text-sm text-text-muted">
                Complete at least 5 mock interviews to see detailed analytics and improvement trends.
                You've completed {interviews.length} so far.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InterviewHistory;
