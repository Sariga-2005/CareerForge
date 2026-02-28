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
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../../store';
import {
  fetchAllAlumni,
  searchAlumniByEmail,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  AlumniRecord,
} from '../../store/slices/alumniAdminSlice';
import toast from 'react-hot-toast';

// ---------- Types ----------
interface AlumniFormData {
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number;
  department: string;
  currentCompany: string;
  currentDesignation: string;
  phone: string;
  linkedIn: string;
  isActive: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onOk: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

const emptyForm: AlumniFormData = {
  firstName: '',
  lastName: '',
  email: '',
  graduationYear: new Date().getFullYear(),
  department: 'CSE',
  currentCompany: '',
  currentDesignation: '',
  phone: '',
  linkedIn: '',
  isActive: true,
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
const AlumniEngagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alumniList, isLoading } = useSelector(
    (state: RootState) => state.alumniAdmin
  );

  const [form, setForm] = useState<AlumniFormData>({ ...emptyForm });
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

  // Load all alumni on mount
  useEffect(() => {
    dispatch(fetchAllAlumni());
  }, [dispatch]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchAlumniByEmail(searchQuery.trim()));
      } else {
        dispatch(fetchAllAlumni());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const closeDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'graduationYear'
            ? parseInt(value) || 0
            : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  // CREATE
  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Add Alumni Record',
      message: `Are you sure you want to add "${form.firstName} ${form.lastName}" (${form.email}) to the alumni database?`,
      variant: 'primary',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(createAlumni(form)).unwrap();
          toast.success('Alumni record created successfully');
          resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to create alumni');
        }
      },
    });
  };

  // EDIT — populate form
  const handleEditClick = (record: AlumniRecord) => {
    setForm({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      graduationYear: record.graduationYear,
      department: record.department,
      currentCompany: record.currentCompany || '',
      currentDesignation: record.currentDesignation || '',
      phone: record.phone || '',
      linkedIn: record.linkedIn || '',
      isActive: record.isActive,
    });
    setEditingId(record._id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UPDATE
  const handleUpdate = () => {
    if (!editingId) return;
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Update Alumni Record',
      message: `Are you sure you want to update the record for "${form.firstName} ${form.lastName}"?`,
      variant: 'primary',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(updateAlumni({ id: editingId, data: form })).unwrap();
          toast.success('Alumni record updated successfully');
          resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to update alumni');
        }
      },
    });
  };

  // DELETE
  const handleDelete = (record: AlumniRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Alumni Record',
      message: `Are you sure you want to permanently delete the record for "${record.firstName} ${record.lastName}" (${record.email})? This action cannot be undone.`,
      variant: 'danger',
      onOk: async () => {
        closeDialog();
        try {
          await dispatch(deleteAlumni(record._id)).unwrap();
          toast.success('Alumni record deleted successfully');
          if (editingId === record._id) resetForm();
        } catch (err: any) {
          toast.error(err || 'Failed to delete alumni');
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
            Alumni Database Management
          </h1>
          <p className="text-light-400 mt-1">
            Add, update, or remove alumni records for outreach and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-light-400">
            <UserGroupIcon className="w-4 h-4" />
            <span>{alumniList.length} records</span>
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
            {editingId ? '✏️ Edit Alumni Record' : '➕ Add New Alumni'}
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
          {/* 1. First Name */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="input w-full"
            />
          </div>

          {/* 2. Last Name */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="input w-full"
            />
          </div>

          {/* 3. Email (Primary Key) */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
              className="input w-full"
            />
          </div>

          {/* 4. Graduation Year */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Graduation Year <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="graduationYear"
              value={form.graduationYear}
              onChange={handleInputChange}
              min={1990}
              max={2030}
              className="input w-full"
            />
          </div>

          {/* 5. Department (Dropdown) */}
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

          {/* 6. Current Company */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Current Company
            </label>
            <input
              type="text"
              name="currentCompany"
              value={form.currentCompany}
              onChange={handleInputChange}
              placeholder="Google"
              className="input w-full"
            />
          </div>

          {/* 7. Current Designation */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Current Designation
            </label>
            <input
              type="text"
              name="currentDesignation"
              value={form.currentDesignation}
              onChange={handleInputChange}
              placeholder="Software Engineer"
              className="input w-full"
            />
          </div>

          {/* 8. Phone */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="+91 9876543210"
              className="input w-full"
            />
          </div>

          {/* 9. LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-light-400 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedIn"
              value={form.linkedIn}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/johndoe"
              className="input w-full"
            />
          </div>

          {/* 10. Active Status (Checkbox) */}
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500/50 cursor-pointer"
              />
              <span className="text-sm font-medium text-light-400">
                Active Alumni
              </span>
            </label>
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
              {isLoading ? 'Updating…' : 'Update Alumni'}
            </button>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {isLoading ? 'Adding…' : 'Add Alumni'}
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
          placeholder="Search alumni by email (primary key)…"
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
          Alumni Records
        </h2>

        {isLoading && alumniList.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-steel border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-light-400 text-sm">Loading alumni records…</p>
          </div>
        ) : alumniList.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-light-400 mx-auto mb-3 opacity-50" />
            <p className="text-light-400">
              {searchQuery
                ? 'No alumni records match your search.'
                : 'No alumni records yet. Add one using the form above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-surface-300 bg-surface-200">
                  {[
                    'Name',
                    'Email',
                    'Year',
                    'Dept',
                    'Company',
                    'Designation',
                    'Phone',
                    'Status',
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
                {alumniList.map((record, idx) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-light font-medium whitespace-nowrap">
                      {record.firstName} {record.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400">
                      {record.graduationYear}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {record.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.currentCompany || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.currentDesignation || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-light-400 whitespace-nowrap">
                      {record.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${record.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {record.isActive ? 'Active' : 'Inactive'}
                      </span>
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

export default AlumniEngagement;
