import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../../store';
import {
  fetchAllReports,
  searchReports,
  createReport,
  updateReport,
  deleteReport,
  PlacementReportRecord,
} from '../../store/slices/placementReportSlice';
import toast from 'react-hot-toast';

// ---------- Types ----------
interface ReportFormData {
  reportTitle: string;
  batch: string;
  department: string;
  reportType: string;
  minScore: number;
  maxScore: number;
  format: string;
  description: string;
  status: string;
  generatedBy: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onOk: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ALL'];
const REPORT_TYPES = ['Batch', 'Department', 'Overall', 'Custom'];
const FORMATS = ['PDF', 'Excel', 'CSV'];
const STATUSES = ['Pending', 'Generated', 'Failed'];

const emptyForm: ReportFormData = {
  reportTitle: '',
  batch: '',
  department: 'CSE',
  reportType: 'Batch',
  minScore: 0,
  maxScore: 100,
  format: 'PDF',
  description: '',
  status: 'Pending',
  generatedBy: '',
};

// ---------- Confirmation Dialog ----------
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onOk,
  onCancel,
  variant = 'primary',
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
                }`}
            >
              {variant === 'danger' ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onOk}
              className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors ${variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500'
                }`}
            >
              OK
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ---------- Main Page ----------
const PlacementReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reportList, isLoading } = useSelector(
    (state: RootState) => state.placementReport
  );

  const [form, setForm] = useState<ReportFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onOk: () => void;
    variant: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onOk: () => { },
    variant: 'primary',
  });

  // Load all reports on mount
  useEffect(() => {
    dispatch(fetchAllReports());
  }, [dispatch]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchReports(searchQuery.trim()));
      } else {
        dispatch(fetchAllReports());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const closeDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  // CREATE
  const handleAdd = () => {
    if (!form.reportTitle || !form.batch || !form.generatedBy) {
      toast.error('Report Title, Batch, and Generated By are required');
      return;
    }
    if (form.minScore > form.maxScore) {
      toast.error('Minimum score cannot be greater than maximum score');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Add Placement Report',
      message: `Are you sure you want to add the report "${form.reportTitle}" for batch ${form.batch}?`,
      variant: 'primary',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(createReport(form)).unwrap();
          toast.success('Report created successfully');
          resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to create report');
        }
      },
    });
  };

  // EDIT — populate form
  const handleEditClick = (record: PlacementReportRecord) => {
    setForm({
      reportTitle: record.reportTitle,
      batch: record.batch,
      department: record.department,
      reportType: record.reportType,
      minScore: record.minScore,
      maxScore: record.maxScore,
      format: record.format,
      description: record.description || '',
      status: record.status,
      generatedBy: record.generatedBy,
    });
    setEditingId(record._id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UPDATE
  const handleUpdate = () => {
    if (!editingId) return;
    if (!form.reportTitle || !form.batch || !form.generatedBy) {
      toast.error('Report Title, Batch, and Generated By are required');
      return;
    }
    if (form.minScore > form.maxScore) {
      toast.error('Minimum score cannot be greater than maximum score');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Update Placement Report',
      message: `Are you sure you want to update the report "${form.reportTitle}"?`,
      variant: 'primary',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(updateReport({ id: editingId, data: form })).unwrap();
          toast.success('Report updated successfully');
          resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to update report');
        }
      },
    });
  };

  // DELETE
  const handleDelete = (record: PlacementReportRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Placement Report',
      message: `Are you sure you want to permanently delete the report "${record.reportTitle}" (Batch: ${record.batch})? This action cannot be undone.`,
      variant: 'danger',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(deleteReport(record._id)).unwrap();
          toast.success('Report deleted successfully');
          if (editingId === record._id) resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to delete report');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-light">
            Report Generation Filter
          </h1>
          <p className="text-light-400 mt-1">
            Generate custom placement reports by batch, department, or Job Readiness score range
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-light-400">
            <DocumentChartBarIcon className="w-4 h-4" />
            <span>{reportList.length} reports</span>
          </div>
        </div>
      </motion.div>

      {/* ────────────────────── FORM SECTION ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-dark"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-light">
            {editingId ? '✏️ Edit Report' : '➕ Add New Report'}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs text-light-400 hover:text-light transition-colors flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Report Title */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Report Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="reportTitle"
              value={form.reportTitle}
              onChange={handleInputChange}
              placeholder="Q1 Placement Summary"
              className="input w-full"
            />
          </div>

          {/* 2. Batch */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Batch <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="batch"
              value={form.batch}
              onChange={handleInputChange}
              placeholder="2024-2025"
              className="input w-full"
            />
          </div>

          {/* 3. Department (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Department <span className="text-red-400">*</span>
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleInputChange}
              className="input w-full"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Report Type (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Report Type <span className="text-red-400">*</span>
            </label>
            <select
              name="reportType"
              value={form.reportType}
              onChange={handleInputChange}
              className="input w-full"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Min Job Readiness Score */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Min Job Readiness Score <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="minScore"
              value={form.minScore}
              onChange={handleInputChange}
              min={0}
              max={100}
              className="input w-full"
            />
          </div>

          {/* 6. Max Job Readiness Score */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Max Job Readiness Score <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="maxScore"
              value={form.maxScore}
              onChange={handleInputChange}
              min={0}
              max={100}
              className="input w-full"
            />
          </div>

          {/* 7. Format (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Format <span className="text-red-400">*</span>
            </label>
            <select
              name="format"
              value={form.format}
              onChange={handleInputChange}
              className="input w-full"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Status (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="input w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 9. Generated By */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Generated By <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="generatedBy"
              value={form.generatedBy}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              className="input w-full"
            />
          </div>

          {/* 10. Description (Textarea) */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-light-400 mb-1">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Optional notes about this report..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-300">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors text-sm font-medium border border-gray-300"
          >
            Clear
          </button>
          {editingId ? (
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {isLoading ? 'Updating…' : 'Update Report'}
            </button>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {isLoading ? 'Adding…' : 'Add Report'}
            </button>
          )}
        </div>
      </motion.div>

      {/* ────────────────────── SEARCH BAR ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-light-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reports by Report ID or title (primary key)…"
          className="input w-full pl-10"
        />
      </motion.div>

      {/* ────────────────────── DATA GRID ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-dark overflow-hidden"
      >
        <h2 className="text-lg font-semibold text-light mb-4">
          Placement Reports
        </h2>

        {isLoading && reportList.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-steel border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-light-400 text-sm">Loading reports…</p>
          </div>
        ) : reportList.length === 0 ? (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="w-12 h-12 text-light-400 mx-auto mb-3 opacity-50" />
            <p className="text-light-400">
              {searchQuery
                ? 'No reports match your search.'
                : 'No reports yet. Add one using the form above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b-2 border-surface-300 bg-surface-200">
                  {[
                    'Title',
                    'Batch',
                    'Dept',
                    'Type',
                    'Score Range',
                    'Format',
                    'Status',
                    'Generated By',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportList.map((record, idx) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-light font-medium whitespace-nowrap">
                      {record.reportTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.batch}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {record.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {record.reportType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.minScore} – {record.maxScore}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                        {record.format}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${record.status === 'Generated'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.generatedBy}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onOk={confirmDialog.onOk}
        onCancel={closeDialog}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

export default PlacementReports;
