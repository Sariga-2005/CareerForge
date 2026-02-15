import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Resume {
  _id: string;
  originalName: string;
  createdAt: string;
  analysisScore?: number;
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  parsedData?: {
    extracted_data?: {
      technical_skills?: string[];
      soft_skills?: string[];
      personal_info?: any;
      education?: any[];
      experience?: any[];
      projects?: any[];
      achievements?: string[];
      certifications?: string[];
    };
    quality_score?: {
      overall_score?: number;
      percentage?: number;
      grade?: string;
      breakdown?: Record<string, {
        score: number;
        max: number;
        details: string[];
        explanation: string;
      }>;
      summary?: string;
    };
    suggestions?: any[];
    ats_friendly?: {
      compatibility_score?: number;
      is_compatible?: boolean;
      issues?: string[];
    };
  };
}

const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resume');
      const resumes = response.data.data?.resumes || response.data.resumes || [];
      if (resumes.length > 0) {
        setResume(resumes[0]);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!resume) return;
    try {
      setReanalyzing(true);
      await api.post(`/resume/${resume._id}/reanalyze`);
      // Wait a few seconds for analysis to complete
      setTimeout(async () => {
        await fetchLatestResume();
        setReanalyzing(false);
      }, 5000);
    } catch (error) {
      console.error('Error re-analyzing resume:', error);
      setReanalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-light">Resume Analysis</h1>
          <p className="text-light-400 mt-1">AI-powered resume insights</p>
        </motion.div>
        <div className="card-dark text-center py-12">
          <ArrowPathIcon className="w-16 h-16 mx-auto text-accent mb-4 animate-spin" />
          <p className="text-light">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-light">Resume Analysis</h1>
          <p className="text-light-400 mt-1">AI-powered resume insights</p>
        </motion.div>
        <div className="card-dark text-center py-12">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-light-400 mb-4" />
          <p className="text-light-400 mb-4">No resume uploaded yet</p>
          <button onClick={() => navigate('/student/resume/upload')} className="btn-primary">
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  // Extract data
  const parsedData = resume.parsedData || {};
  const qualityScore = parsedData.quality_score || {};
  const extractedData = parsedData.extracted_data || {};
  const atsData = parsedData.ats_friendly || {};
  const suggestions = parsedData.suggestions || [];

  const overallScore = qualityScore.percentage || qualityScore.overall_score || resume.analysisScore || 0;
  const scoreBreakdown = qualityScore.breakdown || {};
  const scoreSummary = qualityScore.summary || '';

  // Get skills - from both places
  const techSkills = resume.skills?.technical || extractedData.technical_skills || [];
  const softSkills = resume.skills?.soft || extractedData.soft_skills || [];

  const atsScore = atsData.compatibility_score || 70;
  const atsIssues = atsData.issues || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contact_info': return <InformationCircleIcon className="w-5 h-5" />;
      case 'technical_skills': return <WrenchScrewdriverIcon className="w-5 h-5" />;
      case 'education': return <AcademicCapIcon className="w-5 h-5" />;
      case 'experience': return <BriefcaseIcon className="w-5 h-5" />;
      case 'projects': return <SparklesIcon className="w-5 h-5" />;
      case 'formatting': return <DocumentTextIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const formatCategoryName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light">Resume Analysis</h1>
            <p className="text-light-400 mt-1">AI-powered resume insights</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReanalyze} 
              disabled={reanalyzing || !resume}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
              {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
            <button onClick={() => navigate('/student/resume/upload')} className="btn-secondary flex items-center gap-2">
              <ArrowUpIcon className="w-4 h-4" />
              Upload New
            </button>
          </div>
        </div>
      </motion.div>

      {/* Score Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Overall Score */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-light-400 text-sm">Overall Score</span>
            <DocumentTextIcon className="w-5 h-5 text-light-400" />
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}<span className="text-lg text-light-400">/100</span>
          </div>
          <div className="mt-2 h-2 bg-charcoal-300 rounded-full overflow-hidden">
            <div className={`h-full ${getScoreBarColor(overallScore)} transition-all duration-500`}
              style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        {/* ATS Compatibility */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-light-400 text-sm">ATS Compatibility</span>
            <CheckCircleIcon className="w-5 h-5 text-light-400" />
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
            {atsScore}<span className="text-lg text-light-400"> %</span>
          </div>
          <p className="text-light-400 text-sm mt-2">
            {atsScore >= 80 ? 'Excellent compatibility' : atsScore >= 60 ? 'Room for improvement' : 'Needs work'}
          </p>
        </div>

        {/* File Info */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-light-400 text-sm">File Info</span>
            <DocumentTextIcon className="w-5 h-5 text-light-400" />
          </div>
          <p className="text-light font-medium truncate">{resume.originalName}</p>
          <p className="text-light-400 text-sm mt-1">
            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Skills Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Technical Skills */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-accent" />
              <h3 className="text-light font-semibold">Technical Skills</h3>
            </div>
            <span className="text-light-400 text-sm">{techSkills.length} detected</span>
          </div>
          {techSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {techSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-light-400 text-sm">No technical skills detected - try re-uploading your resume</p>
          )}
        </div>

        {/* Soft Skills */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-success" />
              <h3 className="text-light font-semibold">Soft Skills</h3>
            </div>
            <span className="text-light-400 text-sm">{softSkills.length} detected</span>
          </div>
          {softSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-light-400 text-sm">No soft skills detected</p>
          )}
        </div>
      </motion.div>

      {/* Score Breakdown */}
      {Object.keys(scoreBreakdown).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-accent" />
            Detailed Score Breakdown
          </h3>
          {scoreSummary && (
            <p className="text-light-400 mb-4 p-3 bg-charcoal-300/50 rounded-lg">{scoreSummary}</p>
          )}
          <div className="space-y-3">
            {Object.entries(scoreBreakdown).map(([category, data]) => (
              <div key={category} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-accent">{getCategoryIcon(category)}</span>
                    <span className="text-light font-medium">{formatCategoryName(category)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${data.score >= data.max * 0.8 ? 'text-success' : data.score >= data.max * 0.5 ? 'text-warning' : 'text-error'}`}>
                      {data.score}/{data.max}
                    </span>
                    {expandedSections[category] ? 
                      <ChevronUpIcon className="w-4 h-4 text-light-400" /> : 
                      <ChevronDownIcon className="w-4 h-4 text-light-400" />}
                  </div>
                </button>
                {expandedSections[category] && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    <p className="text-light-400 text-sm mt-3 mb-2">{data.explanation}</p>
                    {data.details && data.details.length > 0 && (
                      <ul className="space-y-1">
                        {data.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-light-300 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ATS Issues */}
      {atsIssues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-warning" />
            ATS Compatibility Issues
          </h3>
          <ul className="space-y-2">
            {atsIssues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2 text-light-400">
                <ExclamationCircleIcon className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Education, Experience, Achievements Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Education */}
        <div className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-accent" />
            Education
          </h3>
          {extractedData.education && extractedData.education.length > 0 ? (
            <div className="space-y-3">
              {extractedData.education.map((edu: any, index: number) => (
                <div key={index} className="p-3 bg-charcoal-300/30 rounded-lg">
                  <p className="text-light font-medium">{edu.degree || 'Degree'}</p>
                  <p className="text-light-400 text-sm">{edu.institution || edu.field}</p>
                  {edu.year && <p className="text-light-400 text-xs mt-1">{edu.year}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light-400 text-sm">No education found</p>
          )}
        </div>

        {/* Work Experience */}
        <div className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-success" />
            Work Experience
          </h3>
          {extractedData.experience && extractedData.experience.length > 0 ? (
            <div className="space-y-3">
              {extractedData.experience.map((exp: any, index: number) => (
                <div key={index} className="p-3 bg-charcoal-300/30 rounded-lg">
                  <p className="text-light font-medium">{exp.title}</p>
                  <p className="text-success text-sm">{exp.company}</p>
                  {exp.duration && <p className="text-light-400 text-xs mt-1">{exp.duration}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light-400 text-sm">No work experience found (projects and achievements are listed separately)</p>
          )}
        </div>

        {/* Achievements */}
        <div className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-warning" />
            Achievements
          </h3>
          {extractedData.achievements && extractedData.achievements.length > 0 ? (
            <ul className="space-y-2">
              {extractedData.achievements.map((achievement: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-light-400 text-sm">
                  <span className="text-warning">★</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-400 text-sm">No achievements found</p>
          )}
        </div>
      </motion.div>

      {/* Projects */}
      {extractedData.projects && extractedData.projects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.47 }}
          className="card-dark">
          <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-accent" />
            Projects ({extractedData.projects.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {extractedData.projects.map((project: any, index: number) => (
              <div key={index} className="p-3 bg-charcoal-300/30 rounded-lg">
                <p className="text-light font-medium">{project.name}</p>
                {project.description && (
                  <p className="text-light-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.slice(0, 4).map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="card-dark">
        <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-accent" />
          Improvement Suggestions
        </h3>
        {suggestions.length > 0 ? (
          <ul className="space-y-3">
            {suggestions.map((suggestion: any, index: number) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-charcoal-300/30 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-light">{suggestion.suggestion || suggestion}</p>
                  {suggestion.impact && (
                    <p className="text-light-400 text-sm mt-1">{suggestion.impact}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-success">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Your resume looks great! No major improvements needed.</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResumeAnalysis;
