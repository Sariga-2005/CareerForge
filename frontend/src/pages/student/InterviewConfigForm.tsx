import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import InterviewModuleTabs from './InterviewModuleTabs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  IconButton,
  Tooltip,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────
interface InterviewConfig {
  id: number;
  sessionName: string;
  difficulty: string;
  topics: string[];
  duration: number;
  interviewType: string;
  scheduledDate: string;
  notes: string;
}

// ─── Static options ───────────────────────────────────────────
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const TOPIC_OPTIONS = [
  'React', 'Python', 'Java', 'Node.js', 'SQL',
  'Data Structures', 'System Design', 'JavaScript',
  'TypeScript', 'AWS / Cloud', 'Machine Learning',
  'DevOps', 'API Design', 'Testing',
];
const INTERVIEW_TYPE_OPTIONS = ['Mock', 'Technical', 'Behavioral', 'System Design'];
const DURATION_OPTIONS = [15, 30, 45, 60];

// ─── Seed data ────────────────────────────────────────────────
const INITIAL_DATA: InterviewConfig[] = [
  { id: 1, sessionName: 'React Fundamentals', difficulty: 'Easy', topics: ['React', 'JavaScript'], duration: 30, interviewType: 'Technical', scheduledDate: '2026-03-05', notes: 'Focus on hooks and state management' },
  { id: 2, sessionName: 'System Design Practice', difficulty: 'Hard', topics: ['System Design', 'AWS / Cloud'], duration: 60, interviewType: 'System Design', scheduledDate: '2026-03-08', notes: 'Practice URL shortener and chat system design' },
  { id: 3, sessionName: 'DSA Warm-up', difficulty: 'Medium', topics: ['Data Structures', 'Python'], duration: 45, interviewType: 'Technical', scheduledDate: '2026-03-10', notes: 'Binary trees and dynamic programming' },
  { id: 4, sessionName: 'Behavioral Round Prep', difficulty: 'Easy', topics: ['Testing', 'API Design'], duration: 30, interviewType: 'Behavioral', scheduledDate: '2026-03-12', notes: 'STAR method practice' },
  { id: 5, sessionName: 'Full Stack Deep Dive', difficulty: 'Hard', topics: ['Node.js', 'React', 'SQL'], duration: 60, interviewType: 'Mock', scheduledDate: '2026-03-15', notes: 'End-to-end project walkthrough' },
];

// ─── Blank form state ─────────────────────────────────────────
const BLANK_FORM: Omit<InterviewConfig, 'id'> = {
  sessionName: '',
  difficulty: '',
  topics: [],
  duration: 30,
  interviewType: '',
  scheduledDate: '',
  notes: '',
};

// ─── Component ────────────────────────────────────────────────
const InterviewConfigForm: React.FC = () => {
  // ── Data state ──────────────────────────────────────────────
  const [rows, setRows] = useState<InterviewConfig[]>(INITIAL_DATA);
  const [nextId, setNextId] = useState(INITIAL_DATA.length + 1);

  // ── Dialog state ────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'insert' | 'update'>('insert');
  const [formData, setFormData] = useState<Omit<InterviewConfig, 'id'>>(BLANK_FORM);
  const [editId, setEditId] = useState<number | null>(null);

  // ── Delete confirmation  ────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InterviewConfig | null>(null);

  // ── Search ──────────────────────────────────────────────────
  const [searchId, setSearchId] = useState('');

  // ── Snackbar ────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });
  const toast = (message: string, severity: 'success' | 'info' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Filtered rows for search ────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!searchId.trim()) return rows;
    const id = parseInt(searchId.trim(), 10);
    if (isNaN(id)) return rows;
    return rows.filter((r) => r.id === id);
  }, [rows, searchId]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60, headerAlign: 'center', align: 'center' },
    { field: 'sessionName', headerName: 'Session Name', flex: 1, minWidth: 130 },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const color = params.value === 'Easy' ? '#10B981' : params.value === 'Medium' ? '#F59E0B' : '#EF4444';
        return (
          <Chip label={params.value} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: '0.7rem' }} />
        );
      },
    },
    {
      field: 'topics',
      headerName: 'Topics',
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
          {(params.value as string[]).map((t: string) => (
            <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
          ))}
        </Box>
      ),
    },
    { field: 'duration', headerName: 'Dur.', width: 70, renderCell: (p: GridRenderCellParams) => `${p.value}m` },
    { field: 'interviewType', headerName: 'Type', width: 100 },
    { field: 'scheduledDate', headerName: 'Date', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditClick(params.row as InterviewConfig)} sx={{ color: '#4A90D9' }}>
              <PencilSquareIcon style={{ width: 16, height: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteClick(params.row as InterviewConfig)} sx={{ color: '#EF4444' }}>
              <TrashIcon style={{ width: 16, height: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Handlers ────────────────────────────────────────────────
  const openInsertDialog = () => {
    setFormData({ ...BLANK_FORM });
    setDialogMode('insert');
    setEditId(null);
    setDialogOpen(true);
  };

  const handleEditClick = (row: InterviewConfig) => {
    const { id, ...rest } = row;
    setFormData(rest);
    setEditId(id);
    setDialogMode('update');
    setDialogOpen(true);
  };

  const handleDeleteClick = (row: InterviewConfig) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    toast('Operation cancelled', 'info');
  };

  const handleDialogOk = () => {
    // Basic validation
    if (!formData.sessionName.trim() || !formData.difficulty || formData.topics.length === 0 || !formData.interviewType || !formData.scheduledDate) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    if (dialogMode === 'insert') {
      const newRow: InterviewConfig = { id: nextId, ...formData };
      setRows((prev) => [...prev, newRow]);
      setNextId((n) => n + 1);
      toast(`Session "${formData.sessionName}" inserted successfully (ID ${nextId})`);
    } else {
      setRows((prev) => prev.map((r) => (r.id === editId ? { ...r, ...formData } : r)));
      toast(`Session ID ${editId} updated successfully`);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast(`Session "${deleteTarget.sessionName}" (ID ${deleteTarget.id}) deleted`);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast('Delete cancelled', 'info');
  };

  // ── Form field handlers ─────────────────────────────────────
  const handleTextChange = (field: keyof Omit<InterviewConfig, 'id' | 'topics' | 'duration'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData((f) => ({ ...f, [field]: e.target.value }));

  const handleSelectChange = (field: 'difficulty' | 'interviewType') => (e: SelectChangeEvent) =>
    setFormData((f) => ({ ...f, [field]: e.target.value }));

  const handleTopicsChange = (e: SelectChangeEvent<string[]>) => {
    const val = e.target.value;
    setFormData((f) => ({ ...f, topics: typeof val === 'string' ? val.split(',') : val }));
  };

  const handleDurationChange = (e: SelectChangeEvent) =>
    setFormData((f) => ({ ...f, duration: Number(e.target.value) }));

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 pb-12">
      <InterviewModuleTabs />
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-1">Interview Configuration</h1>
        <p className="text-text-muted">Manage your interview practice sessions — Insert, Update, Delete, Search &amp; Display.</p>
      </motion.div>

      {/* ── Toolbar: Search + Insert ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-dark flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
      >
        {/* Search by primary key */}
        <TextField
          size="small"
          label="Search by ID"
          placeholder="Enter Session ID…"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon style={{ width: 18, height: 18, color: '#637793' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />

        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 18, height: 18 }} />}
          onClick={openInsertDialog}
          sx={{
            bgcolor: '#1E3A5F',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
            '&:hover': { bgcolor: '#162B47' },
          }}
        >
          Insert New Session
        </Button>
      </motion.div>

      {/* ── DataGrid ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-dark"
        style={{ padding: 0 }}
      >
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            getRowHeight={() => 'auto'}
            sx={{
              border: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#F5F7FA',
                borderBottom: '2px solid #E1E6ED',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#1A2B3C',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.85rem',
                color: '#1A2B3C',
                py: 1,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: '#EBF4FC',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid #E1E6ED',
              },
            }}
          />
        </Box>
      </motion.div>

      {/* ── Insert / Update Dialog (7 controls) ───────────── */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Inter', color: '#1A2B3C' }}>
          {dialogMode === 'insert' ? '➕ Insert New Session' : `✏️ Update Session #${editId}`}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          {/* 1 — Session Name */}
          <TextField
            label="Session Name *"
            fullWidth
            value={formData.sessionName}
            onChange={handleTextChange('sessionName')}
          />
          {/* 2 — Difficulty */}
          <FormControl fullWidth>
            <InputLabel>Difficulty *</InputLabel>
            <Select value={formData.difficulty} label="Difficulty *" onChange={handleSelectChange('difficulty')}>
              {DIFFICULTY_OPTIONS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* 3 — Topics (multi-select) */}
          <FormControl fullWidth>
            <InputLabel>Topics *</InputLabel>
            <Select
              multiple
              value={formData.topics}
              onChange={handleTopicsChange}
              input={<OutlinedInput label="Topics *" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {TOPIC_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* 4 — Duration */}
          <FormControl fullWidth>
            <InputLabel>Duration (min) *</InputLabel>
            <Select value={String(formData.duration)} label="Duration (min) *" onChange={handleDurationChange}>
              {DURATION_OPTIONS.map((d) => (
                <MenuItem key={d} value={d}>{d} minutes</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* 5 — Interview Type */}
          <FormControl fullWidth>
            <InputLabel>Interview Type *</InputLabel>
            <Select value={formData.interviewType} label="Interview Type *" onChange={handleSelectChange('interviewType')}>
              {INTERVIEW_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* 6 — Scheduled Date */}
          <TextField
            label="Scheduled Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.scheduledDate}
            onChange={handleTextChange('scheduledDate')}
          />
          {/* 7 — Notes */}
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleTextChange('notes')}
            placeholder="Optional preparation notes…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDialogCancel} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDialogOk}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1E3A5F', '&:hover': { bgcolor: '#162B47' }, borderRadius: '10px', px: 3 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Inter', color: '#EF4444' }}>
          🗑️ Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Inter', color: '#3D5168' }}>
            Are you sure you want to delete <strong>"{deleteTarget?.sessionName}"</strong> (ID: {deleteTarget?.id})?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 3 }}
          >
            OK — Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ───────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', fontFamily: 'Inter', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InterviewConfigForm;
