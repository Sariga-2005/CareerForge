import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '../../store';
import api from '../../services/api';

interface Resume {
  _id: string;
  originalName: string;
  analysisScore?: number;
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  parsedData?: any;
}

interface Interview {
  _id: string;
  type: string;
  status: string;
  completedAt?: string;
  createdAt: string;
  metrics?: {
    overallScore?: number;
  };
}

interface PlacementDrive {
  _id: string;
  companyName: string;
  role: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  eligibility?: {
    minCGPA?: number;
    departments?: string[];
  };
  package?: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [resume, setResume] = useState<Resume | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock placement drives data (in real app, fetch from API)
  const placementDrives: PlacementDrive[] = [
    {
      _id: '1',
      companyName: 'Google',
      role: 'Software Engineer',
      date: '2026-02-15',
      status: 'upcoming',
      eligibility: { minCGPA: 8.0, departments: ['CSE', 'IT', 'ECE'] },
      package: '₹25-40 LPA'
    },
    {
      _id: '2',
      companyName: 'Microsoft',
      role: 'Full Stack Developer',
      date: '2026-02-20',
      status: 'upcoming',
      eligibility: { minCGPA: 7.5, departments: ['CSE', 'IT'] },
      package: '₹20-35 LPA'
    },
    {
      _id: '3',
      companyName: 'Amazon',
      role: 'SDE Intern',
      date: '2026-02-25',
      status: 'upcoming',
      eligibility: { minCGPA: 7.0, departments: ['CSE', 'IT', 'ECE', 'EEE'] },
      package: '₹1.2L/month (Intern)'
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch resumes
      const resumeResponse = await api.get('/resume');
      const resumes = resumeResponse.data.data?.resumes || resumeResponse.data.resumes || [];
      if (resumes.length > 0) {
        setResume(resumes[0]);
      }

      // Fetch interviews
      try {
        const interviewResponse = await api.get('/interview');
        const interviewData = interviewResponse.data.data?.interviews || interviewResponse.data.interviews || [];
        setInterviews(interviewData);
      } catch (e) {
        console.log('No interviews found');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const resumeScore = resume?.analysisScore || resume?.parsedData?.quality_score?.percentage || 0;
  const completedInterviews = interviews.filter((i) => i.status === 'completed').length;
  const averageInterviewScore = completedInterviews > 0
    ? interviews.filter(i => i.status === 'completed')
      .reduce((acc, i) => acc + (i.metrics?.overallScore || 0), 0) / completedInterviews
    : 0;
  const technicalSkillsCount = resume?.skills?.technical?.length || 0;
  const placementReadiness = Math.min(100, Math.round(
    (resumeScore * 0.4) +
    (Math.min(completedInterviews, 5) * 6) +
    (technicalSkillsCount > 10 ? 30 : technicalSkillsCount * 3)
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary via-primary-600 to-secondary rounded-2xl p-8 shadow-card-lg"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-6 h-6 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">Welcome back!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Hello, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-white/80 mt-2">
              Your placement journey continues. Let's make today count!
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/student/resume/upload')}
            className="btn bg-white text-primary font-semibold hover:bg-white/90 shadow-lg flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentTextIcon className="w-5 h-5" />
            Upload Resume
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DocumentTextIcon}
          label="Resume Score"
          value={resumeScore || '--'}
          suffix="/100"
          change={resume ? 'Based on AI analysis' : 'Upload to see score'}
          color="text-secondary"
          bgColor="bg-secondary/10"
          onClick={() => navigate('/student/resume/analysis')}
        />
        <StatCard
          icon={VideoCameraIcon}
          label="Mock Interviews"
          value={completedInterviews}
          change={completedInterviews > 0 ? `Avg: ${averageInterviewScore.toFixed(0)}%` : 'Start practicing'}
          color="text-primary"
          bgColor="bg-primary/10"
          onClick={() => navigate('/student/interview')}
        />
        <StatCard
          icon={BriefcaseIcon}
          label="Skills Detected"
          value={technicalSkillsCount}
          change={technicalSkillsCount > 0 ? 'Technical skills' : 'Upload resume'}
          color="text-success"
          bgColor="bg-success/10"
          onClick={() => navigate('/student/resume/analysis')}
        />
        <StatCard
          icon={ArrowTrendingUpIcon}
          label="Placement Ready"
          value={placementReadiness}
          suffix="%"
          change="Overall readiness"
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <ActionCard
                icon={DocumentTextIcon}
                title="Analyze Resume"
                description="Get AI-powered insights"
                onClick={() => navigate('/student/resume/analysis')}
                gradient="from-secondary to-primary"
              />
              <ActionCard
                icon={VideoCameraIcon}
                title="Mock Interview"
                description="Practice with AI"
                onClick={() => navigate('/student/interview')}
                gradient="from-purple-500 to-pink-500"
              />
              <ActionCard
                icon={BriefcaseIcon}
                title="Job Matches"
                description="Find opportunities"
                onClick={() => navigate('/student/jobs')}
                gradient="from-orange-500 to-red-500"
              />
            </div>
          </motion.div>

          {/* Upcoming Placement Drives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-primary" />
                Upcoming Placement Drives
              </h2>
              <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-medium">
                {placementDrives.length} upcoming
              </span>
            </div>
            <div className="space-y-3">
              {placementDrives.map((drive, index) => (
                <PlacementDriveCard key={drive._id} drive={drive} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Recent Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Interviews</h2>
              <button
                onClick={() => navigate('/student/interview/history')}
                className="text-secondary text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((interview, index) => (
                  <InterviewItem key={interview._id} interview={interview} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <VideoCameraIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-text-muted mb-4">No interviews yet. Start practicing!</p>
                <button
                  onClick={() => navigate('/student/interview')}
                  className="btn-primary"
                >
                  Start Mock Interview
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Placement Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Placement Readiness</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E9EDF2"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#readinessGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${placementReadiness * 3.52} 352`}
                />
                <defs>
                  <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2B5797" />
                    <stop offset="100%" stopColor="#3498DB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{placementReadiness}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <ReadinessItem label="Resume Uploaded" status={!!resume} />
              <ReadinessItem label="Resume Score > 60" status={resumeScore >= 60} />
              <ReadinessItem label="3+ Mock Interviews" status={completedInterviews >= 3} />
              <ReadinessItem label="10+ Skills" status={technicalSkillsCount >= 10} />
              <ReadinessItem label="Profile Complete" status={!!user?.department} />
            </div>
          </motion.div>

          {/* Your Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Your Skills</h2>
              <button
                onClick={() => navigate('/student/resume/analysis')}
                className="text-secondary text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            {resume?.skills?.technical && resume.skills.technical.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resume.skills.technical.slice(0, 8).map((skill, index) => (
                  <motion.span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    {skill}
                  </motion.span>
                ))}
                {resume.skills.technical.length > 8 && (
                  <span className="px-3 py-1.5 bg-surface-300 text-text-muted rounded-lg text-sm">
                    +{resume.skills.technical.length - 8} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center py-4">
                Upload your resume to see detected skills
              </p>
            )}
          </motion.div>

          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.firstName?.charAt(0) || 'S'}{user?.lastName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-text-primary font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-text-muted text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Department</span>
                <span className="text-text-primary font-medium">{user?.department || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Role</span>
                <span className="text-text-primary font-medium capitalize">{user?.role || 'Student'}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/profile')}
              className="w-full mt-4 btn-secondary text-sm"
            >
              Edit Profile
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  suffix?: string;
  change: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, suffix, change, color, bgColor, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`card hover:shadow-card-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-primary/30' : ''}`}
    whileHover={onClick ? { scale: 1.02 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm text-text-muted">{label}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {suffix && <span className="text-sm text-text-muted mb-0.5">{suffix}</span>}
    </div>
    <p className="text-xs text-text-muted mt-1">{change}</p>
  </motion.div>
);

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, description, onClick, gradient }) => (
  <motion.button
    onClick={onClick}
    className="p-5 rounded-xl bg-surface-100 border border-surface-300 hover:border-primary/30 hover:shadow-card-lg transition-all duration-300 text-left group"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
    <p className="text-sm text-text-muted">{description}</p>
    <div className="flex items-center gap-1 mt-4 text-secondary text-sm font-medium">
      <span>Get started</span>
      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.button>
);

const PlacementDriveCard: React.FC<{ drive: PlacementDrive; index: number }> = ({ drive, index }) => {
  const daysUntil = Math.ceil((new Date(drive.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      className="p-4 rounded-xl bg-surface-100 border border-surface-300 hover:border-primary/30 hover:shadow-soft transition-all"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
            {drive.companyName.charAt(0)}
          </div>
          <div>
            <h3 className="text-text-primary font-semibold">{drive.companyName}</h3>
            <p className="text-text-muted text-sm">{drive.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                {drive.package}
              </span>
              {drive.eligibility?.minCGPA && (
                <span className="text-xs bg-surface-300 text-text-muted px-2 py-0.5 rounded-full">
                  Min CGPA: {drive.eligibility.minCGPA}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${daysUntil <= 3 ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
            }`}>
            {daysUntil > 0 ? `${daysUntil} days` : 'Today'}
          </span>
          <p className="text-text-muted text-xs mt-2">
            {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const InterviewItem: React.FC<{ interview: Interview; index: number }> = ({ interview, index }) => (
  <motion.div
    className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-surface-300"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.05 * index }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${interview.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
        }`}>
        <VideoCameraIcon className={`w-5 h-5 ${interview.status === 'completed' ? 'text-success' : 'text-primary'
          }`} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary capitalize">{interview.type} Interview</p>
        <p className="text-xs text-text-muted">
          {new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="text-right">
      {interview.status === 'completed' ? (
        <>
          <p className={`text-lg font-semibold ${(interview.metrics?.overallScore || 0) >= 70 ? 'text-success' : 'text-warning'
            }`}>
            {interview.metrics?.overallScore || 0}%
          </p>
          <p className="text-xs text-text-muted">Score</p>
        </>
      ) : (
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize font-medium">
          {interview.status}
        </span>
      )}
    </div>
  </motion.div>
);

const ReadinessItem: React.FC<{ label: string; status: boolean }> = ({ label, status }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-text-muted">{label}</span>
    {status ? (
      <CheckCircleIcon className="w-5 h-5 text-success" />
    ) : (
      <ExclamationCircleIcon className="w-5 h-5 text-warning" />
    )}
  </div>
);

export default StudentDashboard;
