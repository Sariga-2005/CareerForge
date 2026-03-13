import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { RootState, AppDispatch } from '../../store';
import { uploadResume, analyzeResume, fetchResumes, deleteResume } from '../../store/slices/resumeSlice';
import { resumeService } from '../../services/api/resumeService';
import { ArrowPathIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import './ResumeUpload.css';

const ResumeUpload: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isUploading, uploadProgress, resumes } = useSelector((state: RootState) => state.resume);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  const [file, setFile] = useState<File | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [showModal, setShowModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false); // quick-parse loading state

  // Form State — now fully controlled for auto-fill
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formDepartment, setFormDepartment] = useState('Computer Science & Engineering');
  const [formCgpa, setFormCgpa] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formJobType, setFormJobType] = useState('Full-time');
  const [formExpLevel, setFormExpLevel] = useState('Fresher (0 yrs)');
  const [formCtc, setFormCtc] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Software Development', 'Full Stack Web']);

  const allTags = [
    'Software Development', 'Data Science & ML', 'Cloud & DevOps',
    'Full Stack Web', 'Cybersecurity', 'Product Management',
    'UI/UX Design', 'Mobile Development', 'Embedded Systems',
    'Blockchain', 'AR/VR'
  ];

  // Auto-fill form from parsed resume data
  const autoFillFromParsed = async (selectedFile: File) => {
    setIsParsing(true);
    try {
      const parsed = await resumeService.quickParseResume(selectedFile);
      if (parsed.success && parsed.personal_info) {
        const info = parsed.personal_info;
        if (info.name) setFormName(info.name);
        if (info.email) setFormEmail(info.email);
        if (info.phone) setFormPhone(info.phone);
        if (info.linkedin) setFormLinkedin(info.linkedin);
        if (info.location) setFormLocation(info.location);

        // Auto-select relevant domains based on skills
        const skills = (parsed.technical_skills || []).map((s: string) => s.toLowerCase());
        const autoTags: string[] = [];
        if (skills.some(s => ['react', 'node', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'].includes(s))) {
          autoTags.push('Full Stack Web', 'Software Development');
        }
        if (skills.some(s => ['python', 'tensorflow', 'pytorch', 'ml', 'machine learning', 'data', 'pandas'].includes(s))) {
          autoTags.push('Data Science & ML');
        }
        if (skills.some(s => ['aws', 'docker', 'kubernetes', 'devops', 'ci/cd', 'terraform'].includes(s))) {
          autoTags.push('Cloud & DevOps');
        }
        if (skills.some(s => ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'].includes(s))) {
          autoTags.push('Mobile Development');
        }
        if (skills.some(s => ['figma', 'ui', 'ux', 'sketch', 'design'].includes(s))) {
          autoTags.push('UI/UX Design');
        }
        if (autoTags.length > 0) {
          setSelectedTags(prev => Array.from(new Set([...autoTags])));
        }

        // Infer experience level from education
        const education = parsed.education || [];
        const hasExperience = education.length > 0;
        if (!hasExperience) {
          setFormExpLevel('Fresher (0 yrs)');
        }
        
        // Auto-fill CGPA (2 decimal places)
        if (parsed.cgpa) {
          setFormCgpa(parseFloat(parsed.cgpa.toString()).toFixed(2));
        } else if (education.length > 0 && education[0].gpa) {
          setFormCgpa(parseFloat(education[0].gpa.toString()).toFixed(2));
        }

        toast.success('Form auto-filled from your resume!', { icon: '✨' });
      }
    } catch (err) {
      // Silent fail — user can fill manually
      console.warn('Quick parse failed silently:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      autoFillFromParsed(selectedFile);
    }
  };

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
    // Optionally reset form fields when file is removed
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormLinkedin('');
    setFormLocation('');
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

      const resumeId = uploadResult._id || uploadResult.id;
      if (resumeId) {
          setAnalysisStatus('analyzing');
          // Increase initial delay to ensure file is fully processed by storage/db
          await new Promise(r => setTimeout(r, 3000));

          let analysisSucceeded = false;
          let attempt = 0;
          const maxAttempts = 3; // Increased to 3 attempts

          while (!analysisSucceeded && attempt < maxAttempts) {
            try {
              if (attempt > 0) {
                // Exponential-ish backoff
                await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
              }
              await dispatch(analyzeResume(resumeId)).unwrap();
              analysisSucceeded = true;
            } catch (error) {
              attempt++;
              console.warn(`Analysis attempt ${attempt} failed, retrying...`, error);
            }
          }

          if (!analysisSucceeded) {
            toast.error('Analysis took longer than expected. You can click "Re-analyze" in the History tab if results are missing.', { duration: 5000 });
          }
          
          setAnalysisStatus('complete');
        } else {
        console.error('No resume ID returned from upload:', uploadResult);
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
                <span className="ru-card-icon">📄</span>
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

            {/* Personal Info — auto-filled after file drop */}
            <div className="ru-card">
              <div className="ru-card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ru-card-icon">👤</span>
                  Personal Information
                </div>
                {isParsing && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ru-accent)', fontWeight: 500 }}>
                    <ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                    Reading resume…
                  </span>
                )}
                {!isParsing && file && (formName || formEmail) && (
                  <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>
                    ✨ Auto-filled
                  </span>
                )}
              </div>
              <div className="ru-form-grid">
                <div className="ru-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                  />
                </div>
                <div className="ru-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="ru-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="ru-field">
                  <label>LinkedIn Profile</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formLinkedin}
                    onChange={e => setFormLinkedin(e.target.value)}
                  />
                </div>
                <div className="ru-field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore, Mumbai, Remote..."
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                  />
                </div>
                <div className="ru-field">
                  <label>Department</label>
                  <select value={formDepartment} onChange={e => setFormDepartment(e.target.value)}>
                    <option value="">Select department</option>
                    <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="MBA / Management">MBA / Management</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.50"
                    value={formCgpa}
                    onChange={e => setFormCgpa(e.target.value)}
                  />
                </div>
                <div className="ru-field ru-form-full">
                  <label>Brief Summary (optional)</label>
                  <textarea
                    placeholder="A short bio about yourself, your goals, and areas of interest..."
                    value={formSummary}
                    onChange={e => setFormSummary(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Target Domains */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span className="ru-card-icon">🎯</span>
                Target Domains
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ru-text-secondary)', marginBottom: '14px', marginTop: 0 }}>
                Select all domains you're interested in — this helps us match you to relevant job opportunities.
                {file && !isParsing && selectedTags.length > 0 && (
                  <span style={{ color: '#22c55e', marginLeft: 6 }}>✨ Suggested based on your skills</span>
                )}
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
                <span className="ru-card-icon">💼</span>
                Role Preference
              </div>
              <div className="ru-form-grid">
                <div className="ru-field">
                  <label>Job Type</label>
                  <select value={formJobType} onChange={e => setFormJobType(e.target.value)}>
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>Experience Level</label>
                  <select value={formExpLevel} onChange={e => setFormExpLevel(e.target.value)}>
                    <option>Fresher (0 yrs)</option>
                    <option>0–1 Year</option>
                    <option>1–3 Years</option>
                    <option>3+ Years</option>
                  </select>
                </div>
                <div className="ru-field">
                  <label>Preferred Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore, Mumbai, Remote..."
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                  />
                </div>
                <div className="ru-field">
                  <label>Expected CTC (LPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10–15"
                    value={formCtc}
                    onChange={e => setFormCtc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Analysis Options */}
            <div className="ru-card">
              <div className="ru-card-title">
                <span className="ru-card-icon">⚙️</span>
                Analysis Options
              </div>
              <div className="ru-checkbox-group">
                <label className="ru-checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="ru-checkbox-text">
                    <div className="ru-label">Semantic Parsing &amp; Keyword Extraction</div>
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
                disabled={analysisStatus !== 'idle' || isParsing}
              >
                {isParsing ? (
                  <>
                    <ArrowPathIcon style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    Reading Resume…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {analysisStatus === 'idle' ? 'Analyze My Resume' : 'Processing...'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <aside className="ru-sidebar-panel">
          {/* Uploaded Resumes CRUD List */}
          <div className="ru-card" style={{ padding: '20px' }}>
            <div className="ru-card-title" style={{ marginBottom: '14px' }}>
              <span className="ru-card-icon">📁</span>
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
                  <div className="ru-step-title">Form Auto-Fill</div>
                  <div className="ru-step-desc">Your info is extracted instantly and fills the form for you.</div>
                </div>
              </div>
              <div className="ru-step">
                <div className="ru-step-num">3</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">Score &amp; Match</div>
                  <div className="ru-step-desc">Receive an ATS score and get matched to relevant drives.</div>
                </div>
              </div>
              <div className="ru-step">
                <div className="ru-step-num">4</div>
                <div className="ru-step-body">
                  <div className="ru-step-title">Practice &amp; Apply</div>
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
