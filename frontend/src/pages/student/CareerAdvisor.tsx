import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  BookOpenIcon,
  LightBulbIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface CareerPath {
  current_position: string;
  milestones: {
    year: number;
    role: string;
    skills_to_acquire: string[];
    expected_salary: string;
    key_activities: string[];
  }[];
  industry_recommendations: string[];
  skill_gaps: string[];
  immediate_actions: string[];
}

interface SkillRoadmap {
  roadmap: {
    month: number;
    focus_area: string;
    skills_to_learn: string[];
    projects: string[];
    milestones: string[];
  }[];
  key_resources: {
    resource_type: string;
    name: string;
    for_skills: string[];
  }[];
  estimated_time_per_week: string;
  success_metrics: string[];
}

const CareerAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [skillRoadmap, setSkillRoadmap] = useState<SkillRoadmap | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [timeframe, setTimeframe] = useState(6);
  const [activeTab, setActiveTab] = useState<'career' | 'roadmap'>('career');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/resume');
      const resumes = response.data.data?.resumes || response.data.resumes || [];
      if (resumes.length > 0) {
        const resume = resumes[0];
        const skills = [
          ...(resume.skills?.technical || []),
          ...(resume.parsedData?.extracted_data?.technical_skills || [])
        ];
        setUserProfile({
          skills: [...new Set(skills)],
          education: resume.parsedData?.extracted_data?.education?.[0]?.degree || 'Bachelor\'s in Computer Science',
          experience: resume.parsedData?.extracted_data?.total_experience_years || 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateCareerPath = async () => {
    if (!userProfile?.skills?.length) {
      toast.error('Please upload your resume first to get personalized career advice');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/career/path', {
        student_profile: {
          skills: userProfile.skills,
          education: userProfile.education,
          experience: userProfile.experience,
          career_goals: [targetRole]
        }
      });

      if (response.data.success) {
        setCareerPath(response.data.career_path);
        toast.success('Career path generated!');
      } else {
        toast.error(response.data.error || 'Failed to generate career path');
      }
    } catch (error: any) {
      console.error('Error generating career path:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate career path';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateSkillRoadmap = async () => {
    if (!userProfile?.skills?.length) {
      toast.error('Please upload your resume first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/skills/ai-roadmap', {
        current_skills: userProfile.skills,
        target_role: targetRole,
        timeframe_months: timeframe
      });

      if (response.data.success) {
        setSkillRoadmap(response.data.roadmap);
        toast.success('Learning roadmap generated!');
      } else {
        toast.error(response.data.error || 'Failed to generate roadmap');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate roadmap';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const popularRoles = [
    'Software Engineer',
    'Data Scientist',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Product Manager',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">AI Career Advisor</h1>
            <p className="text-text-muted">Get personalized career guidance powered by AI</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Status */}
      {!userProfile?.skills?.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-warning/10 border-warning/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <LightBulbIcon className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Upload Your Resume First</h3>
              <p className="text-sm text-text-muted">
                To get personalized career advice, please upload your resume. The AI will analyze your skills and experience.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">Set Your Career Goals</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input w-full"
            >
              {popularRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Learning Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="input w-full"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>

        {userProfile?.skills?.length > 0 && (
          <div className="mt-4 p-4 bg-surface-100 rounded-xl">
            <p className="text-sm text-text-muted mb-2">Your detected skills:</p>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.slice(0, 10).map((skill: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-lg">
                  {skill}
                </span>
              ))}
              {userProfile.skills.length > 10 && (
                <span className="px-2 py-1 bg-surface-200 text-text-muted text-sm rounded-lg">
                  +{userProfile.skills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4">
        <motion.button
          onClick={() => setActiveTab('career')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'career'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RocketLaunchIcon className="w-5 h-5 inline mr-2" />
          5-Year Career Path
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('roadmap')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'roadmap'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <BookOpenIcon className="w-5 h-5 inline mr-2" />
          Learning Roadmap
        </motion.button>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={activeTab === 'career' ? generateCareerPath : generateSkillRoadmap}
        disabled={loading || !userProfile?.skills?.length}
        className="w-full btn-primary py-4 text-lg disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? (
          <>
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Generate {activeTab === 'career' ? 'Career Path' : 'Learning Roadmap'}
          </>
        )}
      </motion.button>

      {/* Career Path Results */}
      <AnimatePresence mode="wait">
        {activeTab === 'career' && careerPath && (
          <motion.div
            key="career"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Milestones Timeline */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-primary" />
                Your 5-Year Career Journey
              </h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-success" />
                
                {careerPath.milestones?.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-16 pb-8 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-3 w-6 h-6 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{milestone.year}</span>
                    </div>
                    
                    <div className="card bg-surface-100 border-none">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-text-primary text-lg">{milestone.role}</h4>
                          <p className="text-success font-medium">{milestone.expected_salary}</p>
                        </div>
                        <span className="badge badge-primary">Year {milestone.year}</span>
                      </div>
                      
                      {milestone.skills_to_acquire?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-text-muted mb-2">Skills to acquire:</p>
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills_to_acquire.map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {milestone.key_activities?.length > 0 && (
                        <div>
                          <p className="text-sm text-text-muted mb-2">Key activities:</p>
                          <ul className="space-y-1">
                            {milestone.key_activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Immediate Actions */}
            {careerPath.immediate_actions?.length > 0 && (
              <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-warning" />
                  Immediate Actions
                </h3>
                <ul className="space-y-3">
                  {careerPath.immediate_actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-text-secondary">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gaps */}
            {careerPath.skill_gaps?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-secondary" />
                  Skills to Develop
                </h3>
                <div className="flex flex-wrap gap-2">
                  {careerPath.skill_gaps.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-warning/10 text-warning rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'roadmap' && skillRoadmap && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Roadmap Timeline */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-primary" />
                  Your {timeframe}-Month Learning Roadmap
                </h3>
                <span className="badge badge-secondary">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {skillRoadmap.estimated_time_per_week}
                </span>
              </div>
              
              <div className="grid gap-4">
                {skillRoadmap.roadmap?.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-surface-100 rounded-xl border border-surface-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center">
                        {phase.month}
                      </span>
                      <div>
                        <h4 className="font-semibold text-text-primary">Month {phase.month}</h4>
                        <p className="text-sm text-text-muted">{phase.focus_area}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-muted mb-2">Skills to Learn:</p>
                        <div className="flex flex-wrap gap-1">
                          {phase.skills_to_learn?.map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-2">Projects:</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          {phase.projects?.map((project, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <ArrowRightIcon className="w-3 h-3 mt-0.5" />
                              {project}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Resources */}
            {skillRoadmap.key_resources?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-secondary" />
                  Recommended Resources
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {skillRoadmap.key_resources.map((resource, i) => (
                    <div key={i} className="p-3 bg-surface-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-primary text-xs">{resource.resource_type}</span>
                        <span className="font-medium text-text-primary text-sm">{resource.name}</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        For: {resource.for_skills?.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Metrics */}
            {skillRoadmap.success_metrics?.length > 0 && (
              <div className="card bg-success/5 border-success/20">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success" />
                  Success Metrics
                </h3>
                <ul className="space-y-2">
                  {skillRoadmap.success_metrics.map((metric, i) => (
                    <li key={i} className="flex items-center gap-2 text-text-secondary">
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!careerPath && !skillRoadmap && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <SparklesIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Ready to Plan Your Career?
          </h3>
          <p className="text-text-muted max-w-md mx-auto">
            Select your target role and click generate to get AI-powered career guidance 
            tailored to your skills and experience.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CareerAdvisor;
