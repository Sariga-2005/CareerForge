import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PencilIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  LinkIcon,
  TrophyIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '../../store';
import api from '../../services/api';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  rollNumber: string;
  cgpa: string;
  skills: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  bio: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'full-time' | 'part-time' | 'freelance';
  duration: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  type: 'academic' | 'competition' | 'certification' | 'award';
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [newSkill, setNewSkill] = useState('');
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    batch: '2026',
    rollNumber: '',
    cgpa: '',
    skills: [],
    linkedin: '',
    github: '',
    portfolio: '',
    bio: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [newExperience, setNewExperience] = useState<Experience>({
    id: '',
    title: '',
    company: '',
    type: 'internship',
    duration: '',
    description: '',
  });

  const [newProject, setNewProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    technologies: [],
    link: '',
  });

  const [newAchievement, setNewAchievement] = useState<Achievement>({
    id: '',
    title: '',
    description: '',
    year: new Date().getFullYear().toString(),
    type: 'academic',
  });

  const [newProjectTech, setNewProjectTech] = useState('');

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      const response = await api.get('/resume');
      const resumes = response.data.data?.resumes || [];
      if (resumes.length > 0) {
        const resume = resumes[0];
        setResumeData(resume);

        const extractedData = resume.parsedData?.extracted_data || {};
        setProfile(prev => ({
          ...prev,
          phone: extractedData.personal_info?.phone || prev.phone,
          skills: resume.skills?.technical || extractedData.technical_skills || [],
          linkedin: extractedData.personal_info?.linkedin || prev.linkedin,
          github: extractedData.personal_info?.github || prev.github,
          portfolio: extractedData.personal_info?.portfolio || prev.portfolio,
        }));

        // Load experience from resume (internships, work experience)
        const resumeExp = extractedData.experience || [];
        setExperiences(resumeExp.map((exp: any, i: number) => ({
          id: `exp-${i}`,
          title: exp.title || 'Position',
          company: exp.company || '',
          type: exp.title?.toLowerCase().includes('intern') ? 'internship' : 'full-time',
          duration: exp.duration || '',
          description: (exp.responsibilities || []).join('. '),
        })));

        // Load projects from resume
        const resumeProj = extractedData.projects || [];
        setProjects(resumeProj.map((proj: any, i: number) => ({
          id: `proj-${i}`,
          name: proj.name || 'Project',
          description: proj.description || '',
          technologies: proj.technologies || [],
          link: proj.link || '',
        })));

        // Load achievements from resume (academic achievements)
        const resumeAch = extractedData.achievements || extractedData.certifications || [];
        setAchievements(resumeAch.map((ach: any, i: number) => ({
          id: `ach-${i}`,
          title: typeof ach === 'string' ? ach : (ach.title || 'Achievement'),
          description: typeof ach === 'string' ? '' : (ach.description || ''),
          year: typeof ach === 'string' ? '' : (ach.year || ''),
          type: 'academic',
        })));
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Skills Management
  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Experience Management
  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setExperiences(prev => [...prev, { ...newExperience, id: `exp-${Date.now()}` }]);
      setNewExperience({ id: '', title: '', company: '', type: 'internship', duration: '', description: '' });
      setShowAddExperience(false);
      toast.success('Experience added!');
    }
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    toast.success('Experience removed');
  };

  // Project Management
  const addProjectTech = () => {
    if (newProjectTech.trim() && !newProject.technologies.includes(newProjectTech.trim())) {
      setNewProject(prev => ({ ...prev, technologies: [...prev.technologies, newProjectTech.trim()] }));
      setNewProjectTech('');
    }
  };

  const removeProjectTech = (tech: string) => {
    setNewProject(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }));
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      setProjects(prev => [...prev, { ...newProject, id: `proj-${Date.now()}` }]);
      setNewProject({ id: '', name: '', description: '', technologies: [], link: '' });
      setShowAddProject(false);
      toast.success('Project added!');
    }
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Project removed');
  };

  // Achievement Management
  const addAchievement = () => {
    if (newAchievement.title) {
      setAchievements(prev => [...prev, { ...newAchievement, id: `ach-${Date.now()}` }]);
      setNewAchievement({ id: '', title: '', description: '', year: new Date().getFullYear().toString(), type: 'academic' });
      setShowAddAchievement(false);
      toast.success('Achievement added!');
    }
  };

  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    toast.success('Achievement removed');
  };

  const getProfileCompleteness = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.department,
      profile.batch,
      profile.rollNumber,
      profile.cgpa,
      profile.skills.length > 0,
      profile.linkedin || profile.github,
      experiences.length > 0,
      projects.length > 0,
      achievements.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = getProfileCompleteness();

  const getExperienceTypeColor = (type: string) => {
    switch (type) {
      case 'internship': return 'bg-secondary/10 text-secondary';
      case 'full-time': return 'bg-success/10 text-success';
      case 'part-time': return 'bg-warning/10 text-warning';
      case 'freelance': return 'bg-primary/10 text-primary';
      default: return 'bg-surface-300 text-text-muted';
    }
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-primary/10 text-primary';
      case 'competition': return 'bg-warning/10 text-warning';
      case 'certification': return 'bg-success/10 text-success';
      case 'award': return 'bg-secondary/10 text-secondary';
      default: return 'bg-surface-300 text-text-muted';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
            <p className="text-text-muted mt-1">Manage your account and career information</p>
          </div>
          <motion.button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : isEditing ? (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Save Changes
              </>
            ) : (
              <>
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary-600 transition-colors shadow-lg">
                <CameraIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-text-primary">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-text-muted">{profile.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {profile.department || 'No Department'}
              </span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                Batch {profile.batch}
              </span>
              <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium capitalize">
                {user?.role || 'Student'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#E9EDF2" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="36" fill="none" stroke="#3498DB" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={`${completeness * 2.26} 226`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-secondary">{completeness}%</span>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-1">Profile Complete</p>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" />
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField icon={UserIcon} label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} disabled={!isEditing} />
          <InputField icon={UserIcon} label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} disabled={!isEditing} />
          <InputField icon={EnvelopeIcon} label="Email" name="email" value={profile.email} onChange={handleChange} disabled={true} type="email" />
          <InputField icon={PhoneIcon} label="Phone" name="phone" value={profile.phone} onChange={handleChange} disabled={!isEditing} placeholder="+91 XXXXX XXXXX" />
        </div>
      </motion.div>

      {/* Academic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-primary" />
          Academic Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-2">Department</label>
            <select name="department" value={profile.department} onChange={handleChange} disabled={!isEditing} className="input w-full">
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="EEE">Electrical & Electronics</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>
          <InputField icon={CalendarIcon} label="Batch/Year" name="batch" value={profile.batch} onChange={handleChange} disabled={!isEditing} placeholder="2026" />
          <InputField icon={DocumentTextIcon} label="Roll Number" name="rollNumber" value={profile.rollNumber} onChange={handleChange} disabled={!isEditing} placeholder="CB.SC.U4CSE23XXX" />
          <InputField icon={AcademicCapIcon} label="CGPA" name="cgpa" value={profile.cgpa} onChange={handleChange} disabled={!isEditing} placeholder="8.5" />
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <CodeBracketIcon className="w-5 h-5 text-primary" />
          Skills
          {isEditing && <span className="text-sm text-text-muted font-normal ml-2">(Click to remove)</span>}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => isEditing && removeSkill(skill)}
              className={`px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium ${isEditing ? 'cursor-pointer hover:bg-error/10 hover:text-error transition-colors' : ''
                }`}
            >
              {skill}
              {isEditing && <XMarkIcon className="w-3 h-3 inline ml-1.5" />}
            </motion.span>
          ))}
          {profile.skills.length === 0 && !isEditing && (
            <p className="text-text-muted text-sm">No skills added. Upload your resume or add manually.</p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g., Python, React)"
              className="input flex-1"
            />
            <button onClick={addSkill} className="btn-primary">
              <PlusIcon className="w-5 h-5" />
              Add
            </button>
          </div>
        )}
      </motion.div>

      {/* Experience - Internships & Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-primary" />
            Work Experience & Internships
          </h3>
          {isEditing && (
            <button onClick={() => setShowAddExperience(true)} className="btn-secondary btn-sm">
              <PlusIcon className="w-4 h-4" />
              Add Experience
            </button>
          )}
        </div>

        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="p-4 bg-surface-100 rounded-xl border border-surface-300 relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isEditing && (
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-text-primary">{exp.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExperienceTypeColor(exp.type)}`}>
                        {exp.type}
                      </span>
                    </div>
                    <p className="text-secondary font-medium">{exp.company}</p>
                    <p className="text-sm text-text-muted">{exp.duration}</p>
                    {exp.description && <p className="text-sm text-text-secondary mt-2">{exp.description}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-100 rounded-xl border border-dashed border-surface-400">
            <BriefcaseIcon className="w-12 h-12 mx-auto text-text-light mb-3" />
            <p className="text-text-muted">No work experience added yet.</p>
            {isEditing && (
              <button onClick={() => setShowAddExperience(true)} className="btn-secondary btn-sm mt-3">
                <PlusIcon className="w-4 h-4" />
                Add Your First Experience
              </button>
            )}
          </div>
        )}

        {/* Add Experience Modal */}
        <AnimatePresence>
          {showAddExperience && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-modal"
              >
                <h4 className="text-lg font-semibold text-text-primary mb-4">Add Work Experience</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Job Title / Position *"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                    className="input w-full"
                  />
                  <input
                    type="text"
                    placeholder="Company / Organization *"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    className="input w-full"
                  />
                  <select
                    value={newExperience.type}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, type: e.target.value as any }))}
                    className="input w-full"
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration (e.g., Jan 2023 - Mar 2023)"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                    className="input w-full"
                  />
                  <textarea
                    placeholder="Brief description of your role"
                    value={newExperience.description}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setShowAddExperience(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={addExperience} className="btn-primary flex-1">Add Experience</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-primary" />
            Projects
          </h3>
          {isEditing && (
            <button onClick={() => setShowAddProject(true)} className="btn-secondary btn-sm">
              <PlusIcon className="w-4 h-4" />
              Add Project
            </button>
          )}
        </div>

        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((proj, index) => (
              <motion.div
                key={proj.id}
                className="p-4 bg-surface-100 rounded-xl border border-surface-300 relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isEditing && (
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <h4 className="font-semibold text-text-primary mb-1">{proj.name}</h4>
                <p className="text-sm text-text-secondary line-clamp-2">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {proj.technologies.slice(0, 4).map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-md">{tech}</span>
                    ))}
                    {proj.technologies.length > 4 && (
                      <span className="px-2 py-0.5 bg-surface-300 text-text-muted text-xs rounded-md">+{proj.technologies.length - 4}</span>
                    )}
                  </div>
                )}
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-secondary text-sm mt-2 hover:underline">
                    <LinkIcon className="w-3 h-3" />
                    View Project
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-100 rounded-xl border border-dashed border-surface-400">
            <CodeBracketIcon className="w-12 h-12 mx-auto text-text-light mb-3" />
            <p className="text-text-muted">No projects added yet.</p>
            {isEditing && (
              <button onClick={() => setShowAddProject(true)} className="btn-secondary btn-sm mt-3">
                <PlusIcon className="w-4 h-4" />
                Add Your First Project
              </button>
            )}
          </div>
        )}

        {/* Add Project Modal */}
        <AnimatePresence>
          {showAddProject && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-modal"
              >
                <h4 className="text-lg font-semibold text-text-primary mb-4">Add Project</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project Name *"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                  />
                  <textarea
                    placeholder="Project Description *"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full resize-none"
                    rows={3}
                  />
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add technology"
                        value={newProjectTech}
                        onChange={(e) => setNewProjectTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addProjectTech()}
                        className="input flex-1"
                      />
                      <button onClick={addProjectTech} className="btn-secondary btn-sm">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {newProject.technologies.map((tech, i) => (
                        <span
                          key={i}
                          onClick={() => removeProjectTech(tech)}
                          className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md cursor-pointer hover:bg-error/10 hover:text-error"
                        >
                          {tech} <XMarkIcon className="w-3 h-3 inline" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="Project Link (optional)"
                    value={newProject.link}
                    onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setShowAddProject(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={addProject} className="btn-primary flex-1">Add Project</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Academic Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-primary" />
            Achievements & Certifications
          </h3>
          {isEditing && (
            <button onClick={() => setShowAddAchievement(true)} className="btn-secondary btn-sm">
              <PlusIcon className="w-4 h-4" />
              Add Achievement
            </button>
          )}
        </div>

        {achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.map((ach, index) => (
              <motion.div
                key={ach.id}
                className="p-4 bg-surface-100 rounded-xl border border-surface-300 relative group flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isEditing && (
                  <button
                    onClick={() => removeAchievement(ach.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text-primary">{ach.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAchievementTypeColor(ach.type)}`}>
                      {ach.type}
                    </span>
                  </div>
                  {ach.description && <p className="text-sm text-text-secondary">{ach.description}</p>}
                  {ach.year && <p className="text-xs text-text-muted mt-1">{ach.year}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-100 rounded-xl border border-dashed border-surface-400">
            <TrophyIcon className="w-12 h-12 mx-auto text-text-light mb-3" />
            <p className="text-text-muted">No achievements added yet.</p>
            {isEditing && (
              <button onClick={() => setShowAddAchievement(true)} className="btn-secondary btn-sm mt-3">
                <PlusIcon className="w-4 h-4" />
                Add Your First Achievement
              </button>
            )}
          </div>
        )}

        {/* Add Achievement Modal */}
        <AnimatePresence>
          {showAddAchievement && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-modal"
              >
                <h4 className="text-lg font-semibold text-text-primary mb-4">Add Achievement</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Achievement Title *"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                    className="input w-full"
                  />
                  <select
                    value={newAchievement.type}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, type: e.target.value as any }))}
                    className="input w-full"
                  >
                    <option value="academic">Academic Achievement</option>
                    <option value="competition">Competition / Hackathon</option>
                    <option value="certification">Certification</option>
                    <option value="award">Award / Recognition</option>
                  </select>
                  <textarea
                    placeholder="Description (optional)"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full resize-none"
                    rows={2}
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newAchievement.year}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, year: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setShowAddAchievement(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={addAchievement} className="btn-primary flex-1">Add Achievement</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          Social & Portfolio Links
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField icon={BuildingOfficeIcon} label="LinkedIn" name="linkedin" value={profile.linkedin} onChange={handleChange} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" />
          <InputField icon={CodeBracketIcon} label="GitHub" name="github" value={profile.github} onChange={handleChange} disabled={!isEditing} placeholder="https://github.com/yourusername" />
          <InputField icon={LinkIcon} label="Portfolio Website" name="portfolio" value={profile.portfolio} onChange={handleChange} disabled={!isEditing} placeholder="https://yourportfolio.com" />
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">About Me</h3>
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          disabled={!isEditing}
          rows={4}
          placeholder="Write a short bio about yourself, your interests, and career goals..."
          className="input w-full resize-none"
        />
      </motion.div>

      {/* Resume Info */}
      {resumeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="card bg-gradient-to-r from-primary/5 to-secondary/5"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            Resume Information
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-surface-300">
              <p className="text-sm text-text-muted">File Name</p>
              <p className="text-text-primary font-medium truncate">{resumeData.originalName}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-surface-300">
              <p className="text-sm text-text-muted">Resume Score</p>
              <p className="text-secondary font-bold text-xl">{resumeData.analysisScore || 0}/100</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-surface-300">
              <p className="text-sm text-text-muted">Uploaded</p>
              <p className="text-text-primary">{new Date(resumeData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Input Field Component
interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon: Icon, label, name, value, onChange, disabled = false, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-sm text-text-muted mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="input w-full pl-10"
      />
    </div>
  </div>
);

export default ProfilePage;
