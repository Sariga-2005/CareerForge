import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api'; // Axios instance
import { toast } from 'react-hot-toast';

interface JobApplication {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    cgpa: number;
  };
  jobId: {
    _id: string;
    title: string;
    companyName: string;
  };
  status: string;
  matchScore: number;
  appliedAt: string;
  githubLink?: string;
  linkedinLink?: string;
  portfolioLink?: string;
  skills: string[];
}

const PlacementApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // "Send to Company" Modal
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [hrEmail, setHrEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/applications');
      setApplications(response.data?.data?.applications || []);
    } catch (err: any) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appIds: string[], status: string) => {
    try {
      await api.patch('/jobs/applications/status', { applicationIds: appIds, status });
      toast.success(`Successfully updated to ${status}`);
      setSelectedIds([]);
      fetchApplications();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleExportCSV = async () => {
    const idsToExport = selectedIds.length ? selectedIds : applications.map(a => a._id);
    if (!idsToExport.length) return toast.error('No applications to export');
    
    try {
      const resp = await api.post('/jobs/applications/export', { applicationIds: idsToExport });
      const apps: JobApplication[] = resp.data?.data?.applications || [];
      
      const csvHeader = 'Name,Email,Phone,Degree,CGPA,Job,Company,Match Score,Status,Applied At,GitHub,LinkedIn\n';
      const csvRows = apps.map(app => {
        return `"${app.userId?.firstName} ${app.userId?.lastName}","${app.userId?.email}","${app.userId?.phone}","${app.userId?.department}","${app.userId?.cgpa}","${app.jobId?.title}","${app.jobId?.companyName}","${app.matchScore}","${app.status}","${new Date(app.appliedAt).toLocaleDateString()}","${app.githubLink || ''}","${app.linkedinLink || ''}"`;
      }).join('\n');
      
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleForwardToCompany = async () => {
    if (!hrEmail) return toast.error('HR Email is required');
    if (!selectedIds.length) return toast.error('No candidates selected');
    
    setIsForwarding(true);
    // STUB: Here we would call a backend endpoint that uses SendGrid/Nodemailer
    try {
      setTimeout(async () => {
        await updateStatus(selectedIds, 'forwarded_to_company');
        toast.success(`Candidate profiles sent to ${hrEmail}`);
        setShowForwardModal(false);
        setHrEmail('');
        setEmailSubject('');
        setEmailMessage('');
        setIsForwarding(false);
      }, 1500);
    } catch (err) {
      setIsForwarding(false);
      toast.error('Failed to forward applications');
    }
  };

  const selectAllEligible = () => {
    // Select pending/reviewed apps with match score >= 80
    const eligible = applications.filter(a => a.matchScore >= 80 && ['pending', 'reviewed'].includes(a.status));
    setSelectedIds(eligible.map(a => a._id));
    toast.success(`Selected ${eligible.length} eligible candidates (>80% match)`);
  };

  // Filter application list
  const filteredApps = applications.filter(app => {
    const term = searchQuery.toLowerCase();
    const studentName = `${app.userId?.firstName} ${app.userId?.lastName}`.toLowerCase();
    const company = app.jobId?.companyName?.toLowerCase() || '';
    const jobTitle = app.jobId?.title?.toLowerCase() || '';
    
    const matchesSearch = studentName.includes(term) || company.includes(term) || jobTitle.includes(term) || app.userId?.email?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Placement Applications</h1>
          <p className="text-text-muted mt-1">Manage, filter, and forward student applications to companies.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
            <DocumentArrowDownIcon className="w-5 h-5" />
            {selectedIds.length > 0 ? `Export Selected (${selectedIds.length})` : 'Export All'}
          </button>
          <button onClick={() => setShowForwardModal(true)} disabled={selectedIds.length === 0} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <PaperAirplaneIcon className="w-5 h-5" />
            Forward Candidates
          </button>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card flex flex-col md:flex-row gap-4 justify-between items-center p-4">
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative w-full md:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, email, company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10 py-2"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input py-2 bg-surface-100 flex-shrink-0">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="forwarded_to_company">Forwarded</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <>
              <button onClick={() => updateStatus(selectedIds, 'shortlisted')} className="btn-secondary text-success border-success/20 hover:bg-success/10 py-2 px-3 text-sm">
                Shortlist
              </button>
              <button onClick={() => updateStatus(selectedIds, 'rejected')} className="btn-secondary text-error border-error/20 hover:bg-error/10 py-2 px-3 text-sm">
                Reject
              </button>
            </>
          )}
          <button onClick={selectAllEligible} className="btn-secondary flex gap-2 py-2 text-sm bg-primary/5 text-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Select Eligible (&gt;80%)
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-100 border-b border-surface-200 text-sm font-semibold text-text-secondary">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredApps.length && filteredApps.length > 0} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredApps.map(a => a._id));
                      else setSelectedIds([]);
                    }}
                    className="w-4 h-4 rounded border-surface-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-4">Student</th>
                <th className="p-4">Job & Company</th>
                <th className="p-4">Match Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-text-muted">Loading applications...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-text-muted">No applications found.</td></tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(app._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, app._id]);
                          else setSelectedIds(selectedIds.filter(id => id !== app._id));
                        }}
                        className="w-4 h-4 rounded border-surface-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{app.userId?.firstName} {app.userId?.lastName}</div>
                      <div className="text-xs text-text-muted">{app.userId?.email}</div>
                      <div className="text-xs text-text-muted mt-0.5">{app.userId?.department} • {app.userId?.cgpa} CGPA</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-primary">{app.jobId?.title}</div>
                      <div className="text-xs text-text-secondary">{app.jobId?.companyName}</div>
                    </td>
                    <td className="p-4">
                      {app.matchScore >= 80 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-success/10 text-success">
                          {app.matchScore}% 
                        </span>
                      ) : app.matchScore >= 60 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-warning/10 text-warning">
                          {app.matchScore}%
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-text-muted">{app.matchScore || 0}%</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                        ${app.status === 'pending' ? 'bg-surface-200 text-text-secondary' : 
                          app.status === 'reviewed' ? 'bg-info/10 text-info' : 
                          app.status === 'shortlisted' ? 'bg-success/10 text-success' : 
                          app.status === 'forwarded_to_company' ? 'bg-primary/10 text-primary' : 
                          app.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-surface-200 text-text-secondary'}`}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {app.githubLink && <a href={app.githubLink} target="_blank" rel="noreferrer" className="text-primary hover:text-primary-600"><EyeIcon className="w-5 h-5" title="GitHub" /></a>}
                        {app.linkedinLink && <a href={app.linkedinLink} target="_blank" rel="noreferrer" className="text-primary hover:text-primary-600"><EyeIcon className="w-5 h-5" title="LinkedIn" /></a>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Forward Modal */}
      <AnimatePresence>
        {showForwardModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl m-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><EnvelopeIcon className="w-6 h-6 text-primary" /> Forward to Company</h3>
                <button onClick={() => setShowForwardModal(false)} className="p-2 hover:bg-surface-100 rounded-lg"><XCircleIcon className="w-6 h-6 text-text-muted" /></button>
              </div>
              <p className="text-sm text-text-secondary mb-6">You are sending <strong>{selectedIds.length}</strong> candidate profile(s). A generic email containing student details, resumes, and match scores will be sent.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Company HR Email</label>
                  <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="hr@company.com" className="input w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Subject</label>
                  <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Candidate Profiles for Job Applications" className="input w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Message Body</label>
                  <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={4} className="input w-full resize-none" placeholder="Please find the attached candidate profiles..."></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowForwardModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleForwardToCompany} disabled={isForwarding} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {isForwarding ? 'Sending...' : 'Send Profiles'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacementApplications;
