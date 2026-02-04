import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, CloudArrowUpIcon, XMarkIcon, BoltIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { uploadResume, analyzeResume } from '../../store/slices/resumeSlice';
import toast from 'react-hot-toast';

const ResumeUpload: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isUploading, uploadProgress, isAnalyzing } = useSelector((state: RootState) => state.resume);
  const [file, setFile] = useState<File | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');

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

  const handleUpload = async () => {
    if (!file) return;
    try {
      setAnalysisStatus('uploading');

      // Step 1: Upload the resume
      const uploadResult = await dispatch(uploadResume(file)).unwrap();
      toast.success('Resume uploaded successfully!');

      // Step 2: Automatically trigger analysis
      setAnalysisStatus('analyzing');
      const resumeId = uploadResult._id || uploadResult.id;

      if (resumeId) {
        try {
          await dispatch(analyzeResume(resumeId)).unwrap();
          toast.success('Resume analyzed successfully!');
          setAnalysisStatus('complete');
        } catch (analysisError) {
          console.log('Auto-analysis not available, proceeding to results page');
        }
      }

      // Navigate to analysis page
      setTimeout(() => {
        navigate('/student/resume/analysis');
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
      setAnalysisStatus('idle');
    }
  };

  const getStatusMessage = () => {
    switch (analysisStatus) {
      case 'uploading':
        return 'Uploading your resume...';
      case 'analyzing':
        return 'AI is analyzing your resume...';
      case 'complete':
        return 'Analysis complete! Redirecting...';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">Upload Resume</h1>
        <p className="text-text-muted mt-1">Get AI-powered insights on your resume</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                  ? 'border-secondary-500 bg-secondary-500/5'
                  : 'border-surface-400 hover:border-primary/50'
                }`}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDragActive ? 'bg-secondary-500/20' : 'bg-surface-200'
                }`}>
                <CloudArrowUpIcon className={`w-8 h-8 ${isDragActive ? 'text-secondary-500' : 'text-text-muted'}`} />
              </div>
              <div>
                <p className="text-lg font-medium text-text-primary mb-1">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-text-muted">
                  or <span className="text-secondary-500 font-medium">browse</span> to choose a file
                </p>
                <p className="text-xs text-text-light mt-2">Supports PDF, DOC, DOCX (Max 5MB)</p>
              </div>
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-100 border-2 border-surface-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{file.name}</p>
                    <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {analysisStatus === 'idle' && (
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 rounded-lg hover:bg-surface-200 text-text-muted hover:text-error transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {(isUploading || analysisStatus !== 'idle') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-muted">{getStatusMessage()}</span>
                      {analysisStatus === 'uploading' && (
                        <span className="text-sm text-secondary-500 font-medium">{uploadProgress}%</span>
                      )}
                    </div>
                    <div className="progress-bar bg-surface-300">
                      <motion.div
                        className="progress-fill bg-gradient-to-r from-primary to-secondary-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: analysisStatus === 'uploading'
                            ? `${uploadProgress}%`
                            : analysisStatus === 'analyzing'
                              ? '75%'
                              : '100%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted mt-3">
                      {analysisStatus === 'analyzing' ? (
                        <>
                          <SparklesIcon className="w-4 h-4 text-secondary-500 animate-pulse" />
                          <span>AI is extracting skills, experience & insights...</span>
                        </>
                      ) : analysisStatus === 'complete' ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 text-success" />
                          <span className="text-success">Analysis complete!</span>
                        </>
                      ) : (
                        <>
                          <BoltIcon className="w-4 h-4 text-secondary-500 animate-pulse" />
                          <span>Processing your resume...</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {analysisStatus === 'idle' && (
                  <motion.button
                    onClick={handleUpload}
                    disabled={!file}
                    className="btn-primary w-full mt-4"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Upload & Analyze Resume
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-secondary-500" />
              What we analyze
            </h3>
            <div className="space-y-3">
              <CheckItem text="Contact information & formatting" />
              <CheckItem text="Work experience & achievements" />
              <CheckItem text="Skills & technical proficiency" />
              <CheckItem text="Education & certifications" />
              <CheckItem text="ATS compatibility score" />
              <CheckItem text="Industry-specific keywords" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-secondary-500 mt-0.5">•</span>
                Use a clean, ATS-friendly format
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500 mt-0.5">•</span>
                Include relevant keywords from job descriptions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500 mt-0.5">•</span>
                Quantify achievements with numbers
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2">
    <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
    <span className="text-sm text-text-secondary">{text}</span>
  </div>
);

export default ResumeUpload;
