import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { RootState, AppDispatch } from '../../store';
import { fetchRecommendedJobs, fetchSavedJobs, fetchAppliedJobs, saveJob, unsaveJob, applyForJob } from '../../store/slices/jobSlice';
import { jobService } from '../../services/api/jobService';
import { toast } from 'react-hot-toast';

interface JobDisplay {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salary: string;
  postedAt: string;
  description: string;
  requirements: string[];
  skills: string[];
  matchScore?: number;
  logo?: string;
}

// Mock job data with Indian companies
const mockJobs: JobDisplay[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Google',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹18-25 LPA',
    postedAt: '2 days ago',
    description: 'Join our team to build scalable systems that impact billions of users worldwide. Work with cutting-edge technologies and collaborate with world-class engineers.',
    requirements: ["Bachelor's in CS or related field", '2+ years experience', 'Strong problem-solving skills'],
    skills: ['Python', 'Java', 'Distributed Systems', 'Cloud Computing'],
    matchScore: 92,
    logo: 'G',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Microsoft',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹15-22 LPA',
    postedAt: '1 week ago',
    description: 'Build next-generation web applications using modern technologies. Join a collaborative team focused on innovation and quality.',
    requirements: ["Bachelor's degree", '1+ years experience', 'Portfolio of projects'],
    skills: ['React', 'Node.js', 'TypeScript', 'Azure'],
    matchScore: 88,
    logo: 'M',
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'Amazon',
    location: 'Chennai, India',
    type: 'Internship',
    salary: '₹50,000/month',
    postedAt: '3 days ago',
    description: 'Work on ML models that power Amazon recommendations. Learn from industry experts and contribute to real-world projects.',
    requirements: ['Currently pursuing degree', 'Strong in Python', 'ML fundamentals'],
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    matchScore: 85,
    logo: 'A',
  },
  {
    id: '4',
    title: 'Frontend Developer',
    company: 'Flipkart',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹12-18 LPA',
    postedAt: '5 days ago',
    description: 'Create beautiful and responsive user interfaces for millions of users. Focus on performance and accessibility.',
    requirements: ["Bachelor's in CS", 'Experience with React', 'UI/UX sensibility'],
    skills: ['React', 'JavaScript', 'CSS', 'Redux'],
    matchScore: 78,
    logo: 'F',
  },
  {
    id: '5',
    title: 'Backend Engineer',
    company: 'Razorpay',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹14-20 LPA',
    postedAt: '1 day ago',
    description: 'Build robust payment infrastructure handling millions of transactions daily. Work at the intersection of technology and finance.',
    requirements: ['2+ years experience', 'Strong in databases', 'System design knowledge'],
    skills: ['Go', 'PostgreSQL', 'Redis', 'Microservices'],
    matchScore: 72,
    logo: 'R',
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Swiggy',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹16-24 LPA',
    postedAt: '4 days ago',
    description: 'Manage and optimize cloud infrastructure for food delivery platform. Ensure 99.99% uptime for millions of users.',
    requirements: ['Experience with AWS/GCP', 'CI/CD expertise', 'Container orchestration'],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
    matchScore: 65,
    logo: 'S',
  },
];

const JobMatches: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentResume } = useSelector((state: RootState) => state.resume);
  const { recommendedJobs, savedJobIds, appliedJobIds } = useSelector((state: RootState) => state.jobs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDisplay | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'insights'>('all');

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // RAG Analysis state
  const [ragData, setRagData] = useState<any>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);

  const fetchRagInsights = async () => {
    setRagLoading(true);
    setRagError(null);
    try {
      const result = await jobService.getRagAnalysis();
      setRagData(result);
      toast.success('AI career insights generated!');
    } catch (err: any) {
      const msg = err?.message || err?.error || 'Failed to generate AI insights';
      setRagError(msg);
      toast.error(msg);
    } finally {
      setRagLoading(false);
    }
  };

  // Fetch recommended jobs, saved, and applied on mount
  useEffect(() => {
    dispatch(fetchRecommendedJobs());
    dispatch(fetchSavedJobs());
    dispatch(fetchAppliedJobs());
  }, [dispatch]);

  const userSkills: string[] = (user as any)?.skills?.length > 0 ? (user as any).skills : currentResume?.skills?.technical || [];

  // Transform API jobs to display format
  const mapApiJobs = (): JobDisplay[] => {
    return recommendedJobs.map((j: any) => ({
      id: j._id,
      title: j.title,
      company: j.companyName,
      location: j.location,
      type: j.type === 'full-time' ? 'Full-time' : j.type === 'part-time' ? 'Part-time' : j.type === 'internship' ? 'Internship' : 'Contract',
      salary: j.salary ? `₹${j.salary.min / 100000}-${j.salary.max / 100000} LPA` : 'Not disclosed',
      postedAt: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Recently',
      description: j.description,
      requirements: j.requirements || [],
      skills: j.requiredSkills || [],
      matchScore: j.matchScore,
      logo: j.companyLogo || j.companyName?.[0] || '?',
    }));
  };

  const allJobs = mapApiJobs();

  // Filter jobs
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = selectedLocation === 'all' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesType = selectedType === 'all' || job.type === selectedType;

    return matchesSearch && matchesLocation && matchesType;
  });

  // Get saved jobs list
  const savedJobsList = allJobs.filter(job => savedJobIds.includes(job.id));

  // Current display jobs based on active tab
  const displayJobs = activeTab === 'saved' ? savedJobsList : filteredJobs;

  const toggleSaveJob = async (jobId: string) => {
    const wasSaved = savedJobIds.includes(jobId);
    try {
      if (wasSaved) {
        await dispatch(unsaveJob(jobId)).unwrap();
        toast.success('Job removed from saved');
      } else {
        await dispatch(saveJob(jobId)).unwrap();
        toast.success('Job saved!');
      }
    } catch {
      toast.error('Failed to update saved jobs');
    }
  };

  const handleApplyClick = (jobId: string) => {
    if (appliedJobIds.includes(jobId)) {
      toast.error('You have already applied for this job');
      return;
    }
    setApplyJobId(jobId);
    setCoverLetter('');
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!applyJobId) return;

    if (appliedJobIds.includes(applyJobId)) {
      toast.error('You have already applied for this job');
      setShowApplyModal(false);
      return;
    }

    setIsApplying(true);
    try {
      await dispatch(applyForJob({ 
        jobId: applyJobId, 
        data: { 
          coverLetter, 
          githubLink, 
          linkedinLink, 
          portfolioLink,
          university: (user as any)?.education?.[0]?.institution || (user as any)?.department || '',
          degree: (user as any)?.department || '',
          cgpa: (user as any)?.cgpa || 0,
          phone: (user as any)?.phone || '',
          skills: userSkills,
          matchScore: selectedJob?.matchScore || 0
        } 
      })).unwrap();
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
    } catch (err: any) {
      toast.error(err || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-text-muted';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-text-muted';
  };

  const getMatchBgColor = (score?: number) => {
    if (!score) return 'bg-surface-300';
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-surface-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">Placement Drive Portal</h1>
        <p className="text-text-muted mt-1">Find jobs that match your skills and career goals</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 p-1 bg-surface-100 rounded-xl w-fit"
      >
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'all'
            ? 'bg-white text-primary shadow-md'
            : 'text-text-muted hover:text-text-secondary'
            }`}
        >
          <BriefcaseIcon className="w-4 h-4 inline mr-2" />
          All Jobs ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'saved'
            ? 'bg-white text-primary shadow-md'
            : 'text-text-muted hover:text-text-secondary'
            }`}
        >
          <BookmarkSolidIcon className="w-4 h-4 inline mr-2" />
          Saved Jobs ({savedJobsList.length})
        </button>
        <button
          onClick={() => { setActiveTab('insights'); if (!ragData && !ragLoading) fetchRagInsights(); }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'insights'
            ? 'bg-white text-primary shadow-md'
            : 'text-text-muted hover:text-text-secondary'
            }`}
        >
          <SparklesIcon className="w-4 h-4 inline mr-2" />
          AI Insights
        </button>

      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-12"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Filters
            {(selectedLocation !== 'all' || selectedType !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            )}
          </motion.button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-surface-300 grid md:grid-cols-3 gap-4"
            >
              <div>
                <label className="text-sm text-text-muted mb-2 block">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">All Locations</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="chennai">Chennai</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-2 block">Job Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setSearchQuery(''); setSelectedLocation('all'); setSelectedType('all'); }}
                  className="btn-ghost w-full"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* RAG Insights Panel */}
      {activeTab === 'insights' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">AI Career Insights</h2>
                <p className="text-sm text-text-muted">Powered by RAG — Semantic Search + AI Analysis</p>
              </div>
            </div>
            <motion.button
              onClick={fetchRagInsights}
              disabled={ragLoading}
              className="btn-secondary flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowPathIcon className={`w-4 h-4 ${ragLoading ? 'animate-spin' : ''}`} />
              {ragLoading ? 'Analyzing...' : 'Refresh'}
            </motion.button>
          </div>

          {/* Loading State */}
          {ragLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-surface-300 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-surface-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-surface-200 rounded w-1/2"></div>
                </div>
              ))}
              <p className="text-center text-text-muted text-sm mt-4">
                🔍 Searching Vector DB for semantic matches, then generating AI analysis...
              </p>
            </div>
          )}

          {/* Error State */}
          {ragError && !ragLoading && (
            <div className="card border-red-200 bg-red-50 text-center py-8">
              <p className="text-red-600 font-medium mb-2">Analysis Failed</p>
              <p className="text-red-400 text-sm mb-4">{ragError}</p>
              <button onClick={fetchRagInsights} className="btn-primary text-sm">Try Again</button>
            </div>
          )}

          {/* RAG Results */}
          {ragData && !ragLoading && (
            <div className="space-y-6">
              {/* Method Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                  {ragData.method || 'RAG Pipeline'}
                </span>
                <span className="text-xs text-text-muted">
                  {ragData.jobs_retrieved_from_vectordb || 0} jobs retrieved from Vector DB
                </span>
              </div>

              {/* Overall Career Advice */}
              {ragData.analysis?.overall_career_advice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200"
                >
                  <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">Career Advice</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {ragData.analysis.overall_career_advice}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Top Matches */}
              {ragData.analysis?.top_matches?.map((match: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card hover:shadow-card-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary text-lg">{match.job_title}</h3>
                      <p className="text-sm text-text-secondary">{match.company}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${
                        match.fit_score >= 80 ? 'text-success' :
                        match.fit_score >= 60 ? 'text-warning' : 'text-text-muted'
                      }`}>
                        {match.fit_score}%
                      </span>
                      <p className="text-xs text-text-muted">Fit Score</p>
                    </div>
                  </div>

                  {/* Why Good Fit */}
                  <p className="text-sm text-text-secondary mb-3 leading-relaxed">{match.why_good_fit}</p>

                  {/* Skill Gaps */}
                  {match.skill_gaps?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Skill Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.skill_gaps.map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preparation Tips */}
                  {match.preparation_tips?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">How to Prepare</p>
                      <ul className="space-y-1">
                        {match.preparation_tips.map((tip: string, i: number) => (
                          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Skills in Demand + Learning Path */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Skills in Demand */}
                {ragData.analysis?.skills_in_demand?.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <ChartBarIcon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-text-primary">Skills in Demand</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ragData.analysis.skills_in_demand.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-lg font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Path */}
                {ragData.analysis?.recommended_learning_path?.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <AcademicCapIcon className="w-5 h-5 text-secondary" />
                      <h3 className="font-semibold text-text-primary">Recommended Learning Path</h3>
                    </div>
                    <ol className="space-y-2">
                      {ragData.analysis.recommended_learning_path.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Retrieval Summary */}
              {ragData.analysis?.retrieval_summary && (
                <div className="text-center text-xs text-text-muted py-2 border-t border-surface-200">
                  <SparklesIcon className="w-3 h-3 inline mr-1" />
                  {ragData.analysis.retrieval_summary}
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
      <>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          Showing <span className="text-text-primary font-medium">{displayJobs.length}</span> {activeTab === 'saved' ? 'saved' : ''} jobs
        </p>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <ChartBarIcon className="w-4 h-4" />
          Sorted by match score
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Job Cards */}
        <div className="space-y-4">
          {displayJobs.length > 0 ? (
            displayJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => setSelectedJob(job)}
                className={`card cursor-pointer transition-all hover:shadow-card-lg ${selectedJob?.id === job.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{job.title}</h3>
                      <p className="text-sm text-text-secondary">{job.company}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                    className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {savedJobIds.includes(job.id) ? (
                      <BookmarkSolidIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-text-light" />
                    )}
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-3 mb-3 text-sm">
                  <span className="flex items-center gap-1 text-text-muted">
                    <MapPinIcon className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-text-muted">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1 text-text-muted">
                    <ClockIcon className="w-4 h-4" />
                    {job.postedAt}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-1 text-xs rounded-lg font-medium ${userSkills.includes(skill) ? 'bg-success/10 text-success' : 'bg-surface-200 text-text-muted'
                        }`}
                    >
                      {skill}
                      {userSkills.includes(skill) && <CheckBadgeIcon className="w-3 h-3 inline ml-1" />}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-300">
                  <span className={`badge ${job.type === 'Internship' ? 'badge-warning' : 'badge-primary'}`}>
                    {job.type}
                  </span>
                  <div className="flex items-center gap-3">
                    {job.matchScore && (
                      <div className="flex items-center gap-2 mr-2">
                        <span className={`text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                          {job.matchScore}% Match
                        </span>
                      </div>
                    )}
                    {appliedJobIds.includes(job.id) ? (
                      <span className="px-3 py-1.5 bg-success/10 text-success text-sm font-medium rounded-lg flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Already Applied
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedJob(job); handleApplyClick(job.id); }}
                        className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BriefcaseIcon className="w-8 h-8 text-primary" />
              </div>
              <p className="text-text-muted">No jobs found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Job Detail Panel */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card sticky top-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedJob.logo}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{selectedJob.title}</h2>
                      <p className="text-secondary font-medium">{selectedJob.company}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
                    <XMarkIcon className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 rounded-lg text-sm text-text-secondary">
                    <MapPinIcon className="w-4 h-4" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 rounded-lg text-sm text-text-secondary">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    {selectedJob.salary}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 rounded-lg text-sm text-text-secondary">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    {selectedJob.type}
                  </span>
                </div>

                {selectedJob.matchScore && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-muted">Your Match Score</span>
                      <span className={`text-xl font-bold ${getMatchColor(selectedJob.matchScore)}`}>
                        {selectedJob.matchScore}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getMatchBgColor(selectedJob.matchScore)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedJob.matchScore}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-text-primary mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-text-primary mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${userSkills.includes(skill) ? 'bg-success/10 text-success' : 'bg-surface-200 text-text-muted'
                          }`}
                      >
                        {skill} {userSkills.includes(skill) && '✓'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => toggleSaveJob(selectedJob.id)}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {savedJobIds.includes(selectedJob.id) ? (
                      <>
                        <BookmarkSolidIcon className="w-5 h-5" />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkIcon className="w-5 h-5" />
                        Save Job
                      </>
                    )}
                  </motion.button>
                  {appliedJobIds.includes(selectedJob.id) ? (
                    <div className="btn-secondary flex-1 flex items-center justify-center gap-2 bg-success/10 text-success border-success/20 cursor-default pointer-events-none">
                      <CheckCircleIcon className="w-5 h-5" />
                      Already Applied
                    </div>
                  ) : (
                    <motion.button
                      className="btn-primary flex-1"
                      onClick={() => handleApplyClick(selectedJob.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      Apply Now
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-16 sticky top-4"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BriefcaseIcon className="w-10 h-10 text-primary" />
                </div>
                <p className="text-text-muted">Select a job to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </>
      )}
      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-text-primary">Apply for this Job</h4>
                <button onClick={() => setShowApplyModal(false)} className="p-2 rounded-lg hover:bg-surface-200">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Name</label>
                    <input type="text" className="input w-full bg-surface-100 text-text-secondary" value={`${user?.firstName} ${user?.lastName}`} disabled />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Email</label>
                    <input type="email" className="input w-full bg-surface-100 text-text-secondary" value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Phone</label>
                    <input type="text" className="input w-full bg-surface-100 text-text-secondary" value={(user as any)?.phone || 'Not provided'} disabled />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">CGPA</label>
                    <input type="text" className="input w-full bg-surface-100 text-text-secondary" value={(user as any)?.cgpa ? Number((user as any).cgpa).toFixed(2) : 'N/A'} disabled />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-text-muted block mb-1">Degree / Branch</label>
                    <input type="text" className="input w-full bg-surface-100 text-text-secondary" value={(user as any)?.department || 'N/A'} disabled />
                  </div>
                </div>

                <div className="border-t border-surface-200 pt-4">
                  <label className="text-sm font-medium text-text-primary mb-3 block">Additional Information (Editable)</label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">GitHub Profile Link</label>
                      <input 
                        type="url" 
                        value={githubLink} 
                        onChange={e => setGithubLink(e.target.value)} 
                        placeholder="https://github.com/username" 
                        className="input w-full" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">LinkedIn Profile Link</label>
                      <input 
                        type="url" 
                        value={linkedinLink} 
                        onChange={e => setLinkedinLink(e.target.value)} 
                        placeholder="https://linkedin.com/in/username" 
                        className="input w-full" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Portfolio Link</label>
                      <input 
                        type="url" 
                        value={portfolioLink} 
                        onChange={e => setPortfolioLink(e.target.value)} 
                        placeholder="https://yourportfolio.com" 
                        className="input w-full" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface-200 pt-3">
                  <label className="text-xs text-text-muted block mb-2">Your Skills (Auto-fetched from profile)</label>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.length > 0 ? userSkills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-surface-200 text-xs font-medium text-text-secondary rounded-md">
                        {skill}
                      </span>
                    )) : <span className="text-xs text-text-light italic">No skills added to profile yet.</span>}
                  </div>
                </div>

                <div className="border-t border-surface-200 pt-3">
                  <label className="text-sm text-text-primary font-medium block mb-2">Cover Letter (optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're a great fit for this specific role..."
                    className="input w-full resize-none"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1">Cancel</button>
                <motion.button
                  onClick={handleSubmitApplication}
                  disabled={isApplying}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatches;
