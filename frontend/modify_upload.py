import os

file_path = r'd:\sem 6\Fullstacks\CareerForge\CareerForge\frontend\src\pages\student\ResumeUpload.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update imports
old_import = "import { uploadResume, analyzeResume } from '../../store/slices/resumeSlice';"
new_import = "import { uploadResume, analyzeResume, fetchResumes, deleteResume } from '../../store/slices/resumeSlice';"
text = text.replace(old_import, new_import, 1)

old_react_import = "import React, { useState, useCallback } from 'react';"
new_react_import = "import React, { useState, useCallback, useEffect } from 'react';"
text = text.replace(old_react_import, new_react_import, 1)

old_hero_import = "import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';"
new_hero_import = "import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';"
text = text.replace(old_hero_import, new_hero_import, 1)


# 2. Add Redux state and useEffect
old_state = "const { isUploading, uploadProgress, isAnalyzing } = useSelector((state: RootState) => state.resume);"
new_state = """const { isUploading, uploadProgress, isAnalyzing, resumes } = useSelector((state: RootState) => state.resume);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);
"""
text = text.replace(old_state, new_state, 1)

# 3. Handle delete
old_remove = """  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };"""

new_remove = """  const removeFile = (e: React.MouseEvent) => {
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
  };"""
text = text.replace(old_remove, new_remove, 1)

# 4. Inject into Sidebar
old_sidebar = """          <div className="ru-sidebar-panel">
            <div className="ru-info-card">"""

new_sidebar = """          <div className="ru-sidebar-panel">
            
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
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ru-text-primary)' }} className="truncate" title={res.fileName || res.originalName || 'Resume'}>
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

            <div className="ru-info-card">"""

text = text.replace(old_sidebar, new_sidebar, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
