import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { RootState } from '../../store';
import { toast } from 'react-hot-toast';

interface Job {
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
const mockJobs: Job[] = [
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
  const { currentResume } = useSelector((state: RootState) => state.resume);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const userSkills = currentResume?.skills?.technical || [];

  // Filter jobs
  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = selectedLocation === 'all' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesType = selectedType === 'all' || job.type === selectedType;

    return matchesSearch && matchesLocation && matchesType;
  });

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
      toast.success('Job removed from saved');
    } else {
      setSavedJobs(prev => [...prev, jobId]);
      toast.success('Job saved!');
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
        <h1 className="text-2xl font-bold text-text-primary">Job Search</h1>
        <p className="text-text-muted mt-1">Find jobs that match your skills and career goals</p>
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          Showing <span className="text-text-primary font-medium">{filteredJobs.length}</span> jobs
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
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
                    {savedJobs.includes(job.id) ? (
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
                  {job.matchScore && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-300 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getMatchBgColor(job.matchScore)}`}
                          style={{ width: `${job.matchScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}%
                      </span>
                    </div>
                  )}
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
                    {savedJobs.includes(selectedJob.id) ? (
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
                  <motion.button
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    Apply Now
                  </motion.button>
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
    </div>
  );
};

export default JobMatches;
