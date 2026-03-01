import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    MegaphoneIcon,
    EnvelopeIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

/* ═══════════════════ TYPES ═══════════════════ */
interface Campaign {
    _id?: string;
    campaignName: string;
    targetCompanyType: string;
    targetAlumniLevel: string;
    targetIndustry: string;
    maxEmailsPerWeek: number;
    priority: 'low' | 'medium' | 'high';
    consentGiven: boolean;
    isActive: boolean;
    notes: string;
}

interface EmailTemplate {
    _id?: string;
    templateName: string;
    subject: string;
    body: string;
    signature: string;
    portfolioLabel: string;
    portfolioUrl: string;
    tone: 'formal' | 'semi-formal' | 'casual';
    isDefault: boolean;
    category: 'outreach' | 'follow-up' | 'thank-you' | 'referral';
}

const emptyCampaign: Campaign = {
    campaignName: '', targetCompanyType: '', targetAlumniLevel: '', targetIndustry: '',
    maxEmailsPerWeek: 5, priority: 'medium', consentGiven: false, isActive: true, notes: '',
};

const emptyTemplate: EmailTemplate = {
    templateName: '', subject: '', body: '', signature: '', portfolioLabel: '', portfolioUrl: '',
    tone: 'formal', isDefault: false, category: 'outreach',
};

/* ═══════════════════ CONFIRM DIALOG ═══════════════════ */
const ConfirmDialog: React.FC<{
    open: boolean;
    title: string;
    message: string;
    onOk: () => void;
    onCancel: () => void;
    okLabel?: string;
    variant?: 'danger' | 'primary';
}> = ({ open, title, message, onOk, onCancel, okLabel = 'OK', variant = 'primary' }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-modal"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-error/10' : 'bg-primary/10'}`}>
                            <ExclamationTriangleIcon className={`w-5 h-5 ${variant === 'danger' ? 'text-error' : 'text-primary'}`} />
                        </div>
                        <h4 className="text-lg font-semibold text-text-primary">{title}</h4>
                    </div>
                    <p className="text-text-secondary text-sm mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button>
                        <button
                            onClick={onOk}
                            className={`flex-1 btn ${variant === 'danger' ? 'bg-error hover:bg-error/90 text-white' : 'btn-primary'}`}
                        >
                            {okLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ═══════════════════ MAIN PAGE ═══════════════════ */
const HeadhunterPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');

    /* campaigns state */
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [campSearch, setCampSearch] = useState('');
    const [campForm, setCampForm] = useState<Campaign>(emptyCampaign);
    const [editingCampId, setEditingCampId] = useState<string | null>(null);
    const [showCampForm, setShowCampForm] = useState(false);
    const [campLoading, setCampLoading] = useState(false);

    /* templates state */
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [tmplSearch, setTmplSearch] = useState('');
    const [tmplForm, setTmplForm] = useState<EmailTemplate>(emptyTemplate);
    const [editingTmplId, setEditingTmplId] = useState<string | null>(null);
    const [showTmplForm, setShowTmplForm] = useState(false);
    const [tmplLoading, setTmplLoading] = useState(false);

    /* confirm dialog */
    const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onOk: () => void; variant?: 'danger' | 'primary' }>({
        open: false, title: '', message: '', onOk: () => { }, variant: 'primary',
    });

    const closeConfirm = () => setConfirm(prev => ({ ...prev, open: false }));

    /* ─── CAMPAIGN CRUD ─── */
    const fetchCampaigns = useCallback(async (search = '') => {
        try {
            setCampLoading(true);
            const res = await api.get(`/headhunter/campaigns${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            setCampaigns(res.data.data || []);
        } catch { toast.error('Failed to load campaigns'); }
        finally { setCampLoading(false); }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const handleCampSearchChange = (val: string) => {
        setCampSearch(val);
        fetchCampaigns(val);
    };

    const openNewCampaign = () => { setCampForm(emptyCampaign); setEditingCampId(null); setShowCampForm(true); };

    const openEditCampaign = (c: Campaign) => {
        setCampForm({ ...c }); setEditingCampId(c._id || null); setShowCampForm(true);
    };

    const saveCampaign = () => {
        if (!campForm.campaignName || !campForm.targetCompanyType || !campForm.targetAlumniLevel || !campForm.targetIndustry) {
            toast.error('Please fill all required fields'); return;
        }
        setConfirm({
            open: true,
            title: editingCampId ? 'Update Campaign' : 'Create Campaign',
            message: editingCampId
                ? `Are you sure you want to update campaign "${campForm.campaignName}"?`
                : `Are you sure you want to create campaign "${campForm.campaignName}"?`,
            variant: 'primary',
            onOk: async () => {
                closeConfirm();
                try {
                    if (editingCampId) {
                        await api.put(`/headhunter/campaigns/${editingCampId}`, campForm);
                        toast.success('Campaign updated!');
                    } else {
                        await api.post('/headhunter/campaigns', campForm);
                        toast.success('Campaign created!');
                    }
                    setShowCampForm(false);
                    fetchCampaigns(campSearch);
                } catch { toast.error('Failed to save campaign'); }
            },
        });
    };

    const deleteCampaign = (c: Campaign) => {
        setConfirm({
            open: true, variant: 'danger',
            title: 'Delete Campaign',
            message: `Are you sure you want to delete campaign "${c.campaignName}"? This action cannot be undone.`,
            onOk: async () => {
                closeConfirm();
                try {
                    await api.delete(`/headhunter/campaigns/${c._id}`);
                    toast.success('Campaign deleted!');
                    fetchCampaigns(campSearch);
                } catch { toast.error('Failed to delete campaign'); }
            },
        });
    };

    /* ─── TEMPLATE CRUD ─── */
    const fetchTemplates = useCallback(async (search = '') => {
        try {
            setTmplLoading(true);
            const res = await api.get(`/headhunter/templates${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            setTemplates(res.data.data || []);
        } catch { toast.error('Failed to load templates'); }
        finally { setTmplLoading(false); }
    }, []);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleTmplSearchChange = (val: string) => {
        setTmplSearch(val);
        fetchTemplates(val);
    };

    const openNewTemplate = () => { setTmplForm(emptyTemplate); setEditingTmplId(null); setShowTmplForm(true); };

    const openEditTemplate = (t: EmailTemplate) => {
        setTmplForm({ ...t }); setEditingTmplId(t._id || null); setShowTmplForm(true);
    };

    const saveTemplate = () => {
        if (!tmplForm.templateName || !tmplForm.subject || !tmplForm.body) {
            toast.error('Please fill all required fields'); return;
        }
        setConfirm({
            open: true,
            title: editingTmplId ? 'Update Template' : 'Create Template',
            message: editingTmplId
                ? `Are you sure you want to update template "${tmplForm.templateName}"?`
                : `Are you sure you want to create template "${tmplForm.templateName}"?`,
            variant: 'primary',
            onOk: async () => {
                closeConfirm();
                try {
                    if (editingTmplId) {
                        await api.put(`/headhunter/templates/${editingTmplId}`, tmplForm);
                        toast.success('Template updated!');
                    } else {
                        await api.post('/headhunter/templates', tmplForm);
                        toast.success('Template created!');
                    }
                    setShowTmplForm(false);
                    fetchTemplates(tmplSearch);
                } catch { toast.error('Failed to save template'); }
            },
        });
    };

    const deleteTemplate = (t: EmailTemplate) => {
        setConfirm({
            open: true, variant: 'danger',
            title: 'Delete Template',
            message: `Are you sure you want to delete template "${t.templateName}"? This action cannot be undone.`,
            onOk: async () => {
                closeConfirm();
                try {
                    await api.delete(`/headhunter/templates/${t._id}`);
                    toast.success('Template deleted!');
                    fetchTemplates(tmplSearch);
                } catch { toast.error('Failed to delete template'); }
            },
        });
    };

    /* ─── PRIORITY BADGE ─── */
    const priorityColor = (p: string) => {
        switch (p) { case 'high': return 'bg-error/10 text-error'; case 'medium': return 'bg-warning/10 text-warning'; default: return 'bg-success/10 text-success'; }
    };

    const toneColor = (t: string) => {
        switch (t) { case 'formal': return 'bg-primary/10 text-primary'; case 'semi-formal': return 'bg-secondary/10 text-secondary'; default: return 'bg-warning/10 text-warning'; }
    };

    const categoryColor = (c: string) => {
        switch (c) { case 'outreach': return 'bg-primary/10 text-primary'; case 'follow-up': return 'bg-secondary/10 text-secondary'; case 'thank-you': return 'bg-success/10 text-success'; default: return 'bg-warning/10 text-warning'; }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <MegaphoneIcon className="w-7 h-7 text-primary" />
                    Autonomous Headhunter
                </h1>
                <p className="text-text-muted mt-1">Manage your outreach campaigns and email templates</p>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-card border-2 border-surface-300"
            >
                <button onClick={() => setActiveTab('campaigns')}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'campaigns' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-secondary hover:bg-surface-200'}`}
                >
                    <MegaphoneIcon className="w-5 h-5" /> Outreach Campaigns
                </button>
                <button onClick={() => setActiveTab('templates')}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'templates' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-secondary hover:bg-surface-200'}`}
                >
                    <EnvelopeIcon className="w-5 h-5" /> Email Templates
                </button>
            </motion.div>

            {/* ═══════════════════ CAMPAIGNS TAB ═══════════════════ */}
            {activeTab === 'campaigns' && (
                <motion.div key="camp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                    {/* Search + Add */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                id="campaign-search"
                                type="text" value={campSearch}
                                onChange={(e) => handleCampSearchChange(e.target.value)}
                                placeholder="Search campaigns by name..."
                                className="input w-full pl-12"
                            />
                        </div>
                        <motion.button onClick={openNewCampaign} className="btn btn-primary flex items-center gap-2"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            <PlusIcon className="w-5 h-5" /> New Campaign
                        </motion.button>
                    </div>

                    {/* Campaigns Grid */}
                    <div className="card p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-200 border-b-2 border-surface-300">
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Campaign Name</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Company Type</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Alumni Level</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Industry</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Emails/Wk</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Priority</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Status</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campLoading ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-text-muted">Loading...</td></tr>
                                    ) : campaigns.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-12">
                                            <MegaphoneIcon className="w-12 h-12 mx-auto text-surface-400 mb-3" />
                                            <p className="text-text-muted">No campaigns found. Create your first one!</p>
                                        </td></tr>
                                    ) : campaigns.map((c, i) => (
                                        <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="border-b border-surface-300 hover:bg-surface-100 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-text-primary">{c.campaignName}</td>
                                            <td className="px-4 py-3 text-text-secondary">{c.targetCompanyType}</td>
                                            <td className="px-4 py-3 text-text-secondary">{c.targetAlumniLevel}</td>
                                            <td className="px-4 py-3 text-text-secondary">{c.targetIndustry}</td>
                                            <td className="px-4 py-3 text-center font-medium">{c.maxEmailsPerWeek}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${priorityColor(c.priority)}`}>{c.priority}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.isActive && c.consentGiven ? 'bg-success/10 text-success' : 'bg-surface-300 text-text-muted'}`}>
                                                    {c.isActive && c.consentGiven ? 'Active' : 'Paused'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openEditCampaign(c)} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors" title="Edit">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteCampaign(c)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors" title="Delete">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {campaigns.length > 0 && (
                            <div className="px-4 py-3 bg-surface-100 border-t border-surface-300 text-xs text-text-muted">
                                Showing {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {/* Campaign Form Modal */}
                    <AnimatePresence>
                        {showCampForm && (
                            <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-modal max-h-[90vh] overflow-y-auto"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-lg font-semibold text-text-primary">
                                            {editingCampId ? 'Edit Campaign' : 'New Campaign'}
                                        </h4>
                                        <button onClick={() => setShowCampForm(false)} className="p-2 rounded-lg hover:bg-surface-200"><XMarkIcon className="w-5 h-5" /></button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 1. Campaign Name */}
                                        <div>
                                            <label className="label">Campaign Name *</label>
                                            <input type="text" value={campForm.campaignName} onChange={e => setCampForm(p => ({ ...p, campaignName: e.target.value }))} placeholder="e.g. FAANG Senior Outreach" className="input w-full" />
                                        </div>

                                        {/* 2. Target Company Type */}
                                        <div>
                                            <label className="label">Target Company Type *</label>
                                            <select value={campForm.targetCompanyType} onChange={e => setCampForm(p => ({ ...p, targetCompanyType: e.target.value }))} className="input w-full">
                                                <option value="">Select type</option>
                                                <option value="MNC">MNC</option>
                                                <option value="Startup">Startup</option>
                                                <option value="FAANG">FAANG</option>
                                                <option value="Product-Based">Product-Based</option>
                                                <option value="Service-Based">Service-Based</option>
                                                <option value="Any">Any Company</option>
                                            </select>
                                        </div>

                                        {/* 3. Target Alumni Level */}
                                        <div>
                                            <label className="label">Target Alumni Level *</label>
                                            <select value={campForm.targetAlumniLevel} onChange={e => setCampForm(p => ({ ...p, targetAlumniLevel: e.target.value }))} className="input w-full">
                                                <option value="">Select level</option>
                                                <option value="Junior Engineer">Junior Engineer</option>
                                                <option value="Senior Engineer">Senior Engineer</option>
                                                <option value="Tech Lead">Tech Lead</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Director">Director</option>
                                                <option value="VP/CTO">VP / CTO</option>
                                                <option value="Any">Any Level</option>
                                            </select>
                                        </div>

                                        {/* 4. Target Industry */}
                                        <div>
                                            <label className="label">Target Industry *</label>
                                            <select value={campForm.targetIndustry} onChange={e => setCampForm(p => ({ ...p, targetIndustry: e.target.value }))} className="input w-full">
                                                <option value="">Select industry</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="E-Commerce">E-Commerce</option>
                                                <option value="Consulting">Consulting</option>
                                                <option value="EdTech">EdTech</option>
                                                <option value="AI/ML">AI/ML</option>
                                                <option value="Cybersecurity">Cybersecurity</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* 5. Max Emails Per Week */}
                                            <div>
                                                <label className="label">Max Emails / Week</label>
                                                <input type="number" min={1} max={20} value={campForm.maxEmailsPerWeek} onChange={e => setCampForm(p => ({ ...p, maxEmailsPerWeek: Number(e.target.value) }))} className="input w-full" />
                                            </div>

                                            {/* 6. Priority */}
                                            <div>
                                                <label className="label">Priority</label>
                                                <select value={campForm.priority} onChange={e => setCampForm(p => ({ ...p, priority: e.target.value as any }))} className="input w-full">
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* 7. Consent */}
                                        <div className="flex items-center justify-between p-3 bg-surface-100 rounded-xl border border-surface-300">
                                            <span className="text-sm font-medium text-text-primary">Consent Given</span>
                                            <button onClick={() => setCampForm(p => ({ ...p, consentGiven: !p.consentGiven }))}
                                                className={`relative w-12 h-6 rounded-full transition-all ${campForm.consentGiven ? 'bg-primary' : 'bg-surface-400'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${campForm.consentGiven ? 'left-6' : 'left-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* 8. Active */}
                                        <div className="flex items-center justify-between p-3 bg-surface-100 rounded-xl border border-surface-300">
                                            <span className="text-sm font-medium text-text-primary">Active</span>
                                            <button onClick={() => setCampForm(p => ({ ...p, isActive: !p.isActive }))}
                                                className={`relative w-12 h-6 rounded-full transition-all ${campForm.isActive ? 'bg-success' : 'bg-surface-400'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${campForm.isActive ? 'left-6' : 'left-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* 9. Notes */}
                                        <div>
                                            <label className="label">Notes</label>
                                            <textarea value={campForm.notes} onChange={e => setCampForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." className="input w-full resize-none" rows={3} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowCampForm(false)} className="btn btn-secondary flex-1">Cancel</button>
                                        <button onClick={saveCampaign} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" /> {editingCampId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ═══════════════════ TEMPLATES TAB ═══════════════════ */}
            {activeTab === 'templates' && (
                <motion.div key="tmpl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                    {/* Search + Add */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                id="template-search"
                                type="text" value={tmplSearch}
                                onChange={(e) => handleTmplSearchChange(e.target.value)}
                                placeholder="Search templates by name..."
                                className="input w-full pl-12"
                            />
                        </div>
                        <motion.button onClick={openNewTemplate} className="btn btn-primary flex items-center gap-2"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            <PlusIcon className="w-5 h-5" /> New Template
                        </motion.button>
                    </div>

                    {/* Templates Grid */}
                    <div className="card p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-200 border-b-2 border-surface-300">
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Template Name</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Subject</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Category</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Tone</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Portfolio</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Default</th>
                                        <th className="text-center px-4 py-3 font-semibold text-text-secondary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tmplLoading ? (
                                        <tr><td colSpan={7} className="text-center py-12 text-text-muted">Loading...</td></tr>
                                    ) : templates.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-12">
                                            <EnvelopeIcon className="w-12 h-12 mx-auto text-surface-400 mb-3" />
                                            <p className="text-text-muted">No templates found. Create your first one!</p>
                                        </td></tr>
                                    ) : templates.map((t, i) => (
                                        <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="border-b border-surface-300 hover:bg-surface-100 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-text-primary">{t.templateName}</td>
                                            <td className="px-4 py-3 text-text-secondary truncate max-w-[200px]">{t.subject}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${categoryColor(t.category)}`}>{t.category}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${toneColor(t.tone)}`}>{t.tone}</span>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary truncate max-w-[150px]">{t.portfolioLabel || '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                {t.isDefault ? <CheckCircleIcon className="w-5 h-5 text-success mx-auto" /> : <span className="text-text-muted">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openEditTemplate(t)} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors" title="Edit">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteTemplate(t)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors" title="Delete">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {templates.length > 0 && (
                            <div className="px-4 py-3 bg-surface-100 border-t border-surface-300 text-xs text-text-muted">
                                Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {/* Template Form Modal */}
                    <AnimatePresence>
                        {showTmplForm && (
                            <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-modal max-h-[90vh] overflow-y-auto"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-lg font-semibold text-text-primary">
                                            {editingTmplId ? 'Edit Template' : 'New Email Template'}
                                        </h4>
                                        <button onClick={() => setShowTmplForm(false)} className="p-2 rounded-lg hover:bg-surface-200"><XMarkIcon className="w-5 h-5" /></button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 1. Template Name */}
                                        <div>
                                            <label className="label">Template Name *</label>
                                            <input type="text" value={tmplForm.templateName} onChange={e => setTmplForm(p => ({ ...p, templateName: e.target.value }))} placeholder="e.g. Standard Outreach" className="input w-full" />
                                        </div>

                                        {/* 2. Subject */}
                                        <div>
                                            <label className="label">Subject Line *</label>
                                            <input type="text" value={tmplForm.subject} onChange={e => setTmplForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Connection Request from a Fellow Student" className="input w-full" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* 3. Category */}
                                            <div>
                                                <label className="label">Category</label>
                                                <select value={tmplForm.category} onChange={e => setTmplForm(p => ({ ...p, category: e.target.value as any }))} className="input w-full">
                                                    <option value="outreach">Outreach</option>
                                                    <option value="follow-up">Follow-up</option>
                                                    <option value="thank-you">Thank You</option>
                                                    <option value="referral">Referral</option>
                                                </select>
                                            </div>

                                            {/* 4. Tone */}
                                            <div>
                                                <label className="label">Tone</label>
                                                <select value={tmplForm.tone} onChange={e => setTmplForm(p => ({ ...p, tone: e.target.value as any }))} className="input w-full">
                                                    <option value="formal">Formal</option>
                                                    <option value="semi-formal">Semi-formal</option>
                                                    <option value="casual">Casual</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* 5. Body */}
                                        <div>
                                            <label className="label">Email Body *</label>
                                            <textarea value={tmplForm.body} onChange={e => setTmplForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your email body..." className="input w-full resize-none text-sm" rows={6} />
                                        </div>

                                        {/* 6. Signature */}
                                        <div>
                                            <label className="label">Signature</label>
                                            <textarea value={tmplForm.signature} onChange={e => setTmplForm(p => ({ ...p, signature: e.target.value }))} placeholder="Your closing signature..." className="input w-full resize-none" rows={3} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* 7. Portfolio Label */}
                                            <div>
                                                <label className="label">Portfolio Label</label>
                                                <input type="text" value={tmplForm.portfolioLabel} onChange={e => setTmplForm(p => ({ ...p, portfolioLabel: e.target.value }))} placeholder="e.g. GitHub" className="input w-full" />
                                            </div>

                                            {/* 8. Portfolio URL */}
                                            <div>
                                                <label className="label">Portfolio URL</label>
                                                <input type="url" value={tmplForm.portfolioUrl} onChange={e => setTmplForm(p => ({ ...p, portfolioUrl: e.target.value }))} placeholder="https://..." className="input w-full" />
                                            </div>
                                        </div>

                                        {/* 9. Is Default */}
                                        <div className="flex items-center justify-between p-3 bg-surface-100 rounded-xl border border-surface-300">
                                            <span className="text-sm font-medium text-text-primary">Set as Default Template</span>
                                            <button onClick={() => setTmplForm(p => ({ ...p, isDefault: !p.isDefault }))}
                                                className={`relative w-12 h-6 rounded-full transition-all ${tmplForm.isDefault ? 'bg-primary' : 'bg-surface-400'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${tmplForm.isDefault ? 'left-6' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowTmplForm(false)} className="btn btn-secondary flex-1">Cancel</button>
                                        <button onClick={saveTemplate} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" /> {editingTmplId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Confirm Dialog (shared) */}
            <ConfirmDialog
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                onOk={confirm.onOk}
                onCancel={closeConfirm}
                okLabel={confirm.variant === 'danger' ? 'Delete' : 'Confirm'}
                variant={confirm.variant}
            />
        </div>
    );
};

export default HeadhunterPage;
