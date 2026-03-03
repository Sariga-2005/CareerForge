import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { RootState, AppDispatch } from '../../store';
import { uploadResume, analyzeResume, fetchResumes, deleteResume } from '../../store/slices/resumeSlice';
import { resumeService } from '../../services/api/resumeService';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import './ResumeUpload.css';

interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

const ResumeUpload: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isUploading, uploadProgress, isAnalyzing, resumes } = useSelector((state: RootState) => state.resume);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  const [file, setFile] = useState<File | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedTags, setSelectedTags] = useState<string[]>(['Software Development', 'Full Stack Web']);



  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleDeleteResume = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await dispatch(deleteResume(id)).unwrap();
        toast.success('Resume deleted successfully');
      } catch (err) {
        toast.error('Failed to delete resume');
      }
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a resume file first');
      return;
    }

    try {
      setAnalysisStatus('uploading');
      setShowModal(true);

      const uploadResult = await dispatch(uploadResume(file)).unwrap();

      setAnalysisStatus('analyzing');
      const resumeId = uploadResult._id || uploadResult.id;

      if (resumeId) {
        try {
          await dispatch(analyzeResume(resumeId)).unwrap();
          setAnalysisStatus('complete');
        } catch (error) {
          console.error(error);
          setAnalysisStatus('complete'); // proceed anyway
        }
      } else {
        setAnalysisStatus('complete');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
      setAnalysisStatus('idle');
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/student/resume/analysis');
  };

  const allTags = [
    'Software Development', 'Data Science & ML', 'Cloud & DevOps',
    'Full Stack Web', 'Cybersecurity', 'Product Management',
    'UI/UX Design', 'Mobile Development', 'Embedded Systems',
    'Blockchain', 'AR/VR'
  ];

  const uploadProgressVal = analysisStatus === 'uploading' ? uploadProgress : (analysisStatus === 'analyzing' ? 80 : (analysisStatus === 'complete' ? 100 : (file ? 20 : 0)));

  return (
    <div className="ru-container">
      <div className="ru-content-flex">
        <div className="ru-form-area">
          <div className="ru-page-header">
            <h1>Resume Upload</h1>
            <p>Upload your resume for AI-powered semantic parsing, keyword extraction, and job matching.</p>
          </div>

          <form id="resumeForm" onSubmit={handleSubmit}>
            {/* File Upload */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span>📄</span>
                Resume File
              </div>

              <div
                {...getRootProps()}
                className={`ru-drop-zone ${isDragActive ? 'ru-drag-over' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="ru-drop-icon">📎</div>
                <div className="ru-drop-title">
                  {isDragActive ? 'Drop your resume here' : 'Drop your resume here'}
                </div>
                <div className="ru-drop-sub">or click to browse your files</div>
                <button type="button" className="ru-browse-btn" onClick={(e) => {
                  e.stopPropagation();
                  document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'));
                }}>Choose File</button>
                <div className="ru-file-types">
                  <span className="ru-file-tag">PDF</span>
                  <span className="ru-file-sep">·</span>
                  <span className="ru-file-tag">DOC</span>
                  <span className="ru-file-sep">·</span>
                  <span className="ru-file-tag">DOCX</span>
                  <span className="ru-file-sep">·</span>
                  <span style={{ fontSize: '12px', color: 'var(--ru-text-muted)' }}>Max 5MB</span>
                </div>
              </div>

              {file && (
                <div className="ru-file-preview ru-visible">
                  <div className="ru-file-icon-wrap">📄</div>
                  <div className="ru-file-details">
                    <div className="ru-file-name">{file.name}</div>
                    <div className="ru-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button type="button" className="ru-file-remove" onClick={removeFile} title="Remove file">✕</button>
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span>👤</span>
                Personal Information
              </div>
              <div className="ru-form-grid">
                <div className="ru-field">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="ru-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
                <div className="ru-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" required />
                </div>
                <div className="ru-field">
                  <label>LinkedIn Profile</label>
                  <input type="url" placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="ru-field">
                  <label>Department</label>
                  <select defaultValue="Computer Science & Engineering">
                    <option value="">Select department</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="MBA / Management">MBA / Management</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>CGPA</label>
                  <input type="number" step="0.1" min="0" max="10" placeholder="8.5" />
                </div>
                <div className="ru-field ru-form-full">
                  <label>Brief Summary (optional)</label>
                  <textarea placeholder="A short bio about yourself, your goals, and areas of interest..."></textarea>
                </div>
              </div>
            </div>

            {/* Target Domains */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span>🎯</span>
                Target Domains
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ru-text-secondary)', marginBottom: '14px', marginTop: 0 }}>
                Select all domains you're interested in — this helps us match you to relevant job opportunities.
              </p>
              <div className="ru-tags-wrap">
                {allTags.map(tag => (
                  <span
                    key={tag}
                    className={`ru-skill-tag ${selectedTags.includes(tag) ? 'ru-selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="ru-divider"></div>

              <div className="ru-card-title" style={{ marginBottom: '14px' }}>
                <span>💼</span>
                Role Preference
              </div>
              <div className="ru-form-grid">
                <div className="ru-field">
                  <label>Job Type</label>
                  <select>
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>Experience Level</label>
                  <select>
                    <option>Fresher (0 yrs)</option>
                    <option>0–1 Year</option>
                    <option>1–3 Years</option>
                    <option>3+ Years</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>Preferred Location</label>
                  <input type="text" placeholder="Bangalore, Mumbai, Remote..." />
                </div>
                <div className="ru-field">
                  <label>Expected CTC (LPA)</label>
                  <input type="text" placeholder="e.g. 10–15" />
                </div>
              </div>
            </div>

            {/* Analysis Options */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span>⚙️</span>
                Analysis Options
              </div>
              <div className="ru-checkbox-group">
                <label className="ru-checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="ru-checkbox-text">
                    <div className="ru-label">Semantic Parsing & Keyword Extraction</div>
                    <div className="ru-sub">Extract technical skills, soft skills, and key experiences automatically</div>
                  </div>
                </label>
                <label className="ru-checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="ru-checkbox-text">
                    <div className="ru-label">ATS Compatibility Score</div>
                    <div className="ru-sub">Check how well your resume performs against applicant tracking systems</div>
                  </div>
                </label>
                <label className="ru-checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="ru-checkbox-text">
                    <div className="ru-label">Job Match Recommendations</div>
                    <div className="ru-sub">Get matched to placement drives and openings based on your profile</div>
                  </div>
                </label>
                <label className="ru-checkbox-item">
                  <input type="checkbox" />
                  <div className="ru-checkbox-text">
                    <div className="ru-label">Interview Prep Suggestions</div>
                    <div className="ru-sub">Receive personalized interview questions based on your resume content</div>
                  </div>
                </label>
              </div>
            </div>



            <div className="ru-submit-row">
              <button type="button" className="ru-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button
                type="submit"
                className="ru-submit-btn"
                onClick={(e) => {
                  if (!file) {
                    e.preventDefault();
                    toast.error('Please select a resume file first');
                  }
                }}
                disabled={analysisStatus !== 'idle'}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {analysisStatus === 'idle' ? 'Analyze My Resume' : 'Processing...'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <aside className="ru-sidebar-panel">
          {/* Uploaded Resumes CRUD List */}
          <div className="ru-card" style={{ padding: '20px' }}>
            <div className="ru-card-title" style={{ marginBottom: '14px' }}>
              <span>📁</span>
              My Uploaded Resumes
            </div>
            {resumes && resumes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {resumes.map((res: any) => (
                  <div key={res._id || res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--ru-card-hover)', border: '1px solid var(--ru-border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '6px', background: 'var(--ru-accent-dim)', color: 'var(--ru-accent)', borderRadius: '6px' }}>
                        <DocumentTextIcon style={{ width: 16, height: 16 }} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ru-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={res.fileName || res.originalName || 'Resume'}>
                          {res.fileName || res.originalName || 'Resume.pdf'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ru-text-secondary)' }}>
                          {new Date(res.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(res._id || res.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', display: 'flex' }}
                      title="Delete resume"
                    >
                      <TrashIcon style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ru-text-muted)', fontSize: '13px' }}>
                No resumes uploaded yet
              </div>
            )}
          </div>

          <div className="ru-info-card">
            <h3>Profile Completion</h3>
            <div className="ru-progress-labels">
              <span>Overall Progress</span>
              <span>{Math.max(60, uploadProgressVal)}%</span>
            </div>
            <div className="ru-progress-bar-wrap">
              <div className="ru-progress-bar" style={{ width: `${Math.max(60, uploadProgressVal)}%` }}></div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ru-text-secondary)', marginTop: '10px', marginBottom: 0, lineHeight: 1.5 }}>
              Upload your resume and complete preferences to unlock all features.
            </p>
          </div>

          <div className="ru-info-card">
            <h3>How It Works</h3>
            <div className="ru-process-steps">
              <div className="ru-step">
                <div className="ru-step-num">1</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">Upload PDF</div>
                  <div className="ru-step-desc">We accept PDF, DOC, and DOCX formats up to 5MB.</div>
                </div>
              </div>
              <div className="ru-step">
                <div className="ru-step-num">2</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">AI Parsing</div>
                  <div className="ru-step-desc">Our engine extracts skills, experience, and keywords using NLP.</div>
                </div>
              </div>
              <div className="ru-step">
                <div className="ru-step-num">3</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">Score & Match</div>
                  <div className="ru-step-desc">Receive an ATS score and get matched to relevant drives.</div>
                </div>
              </div>
              <div className="ru-step">
                <div className="ru-step-num">4</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">Practice & Apply</div>
                  <div className="ru-step-desc">Use mock interviews to prepare and apply with confidence.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ru-info-card">
            <h3>💡 Tips for Best Results</h3>
            <div className="ru-tips-list">
              <div className="ru-tip">
                <span className="ru-tip-icon">✓</span>
                Use a clean, single-column layout with clear section headings.
              </div>
              <div className="ru-tip">
                <span className="ru-tip-icon">✓</span>
                Quantify achievements — "Reduced load time by 40%" beats vague claims.
              </div>
              <div className="ru-tip">
                <span className="ru-tip-icon">✓</span>
                Include relevant tech skills with proficiency levels.
              </div>
              <div className="ru-tip">
                <span className="ru-tip-icon">✓</span>
                Avoid tables, images, and fancy fonts that confuse ATS scanners.
              </div>
              <div className="ru-tip">
                <span className="ru-tip-icon">✓</span>
                Keep it to 1 page for freshers, 2 pages max for experienced.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Success Modal */}
      <div className={`ru-success-overlay ${showModal ? 'ru-show' : ''}`}>
        <div className="ru-success-modal">
          {analysisStatus === 'complete' ? (
            <>
              <div className="ru-success-icon">✅</div>
              <h2>Resume Analyzed!</h2>
              <p>Your resume has been successfully parsed and analyzed. Discover AI-powered insights and job matches tailored for you.</p>
              <button type="button" className="ru-modal-close" onClick={closeModal}>View Analysis →</button>
            </>
          ) : (
            <>
              <div className="ru-success-icon" style={{ animation: 'pulse 2s infinite' }}>⏳</div>
              <h2>Analyzing Resume...</h2>
              <p>Please wait while our AI engine analyzes your resume for skills, experience, and matches.</p>
              <div className="ru-progress-bar-wrap" style={{ marginTop: '20px' }}>
                <div className="ru-progress-bar" style={{ width: `${uploadProgressVal}%` }}></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
