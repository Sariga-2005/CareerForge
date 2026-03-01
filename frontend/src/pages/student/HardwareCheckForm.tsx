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
interface HardwareCheck {
    id: number;
    studentName: string;
    cameraStatus: string;
    microphoneStatus: string;
    internetStatus: string;
    browser: string;
    os: string;
    checkDate: string;
    notes: string;
}

// ─── Static options ───────────────────────────────────────────
const STATUS_OPTIONS = ['Passed', 'Failed', 'Not Tested'];
const BROWSER_OPTIONS = ['Google Chrome', 'Mozilla Firefox', 'Microsoft Edge', 'Safari', 'Opera', 'Brave'];
const OS_OPTIONS = ['Windows 11', 'Windows 10', 'macOS Sonoma', 'macOS Ventura', 'Ubuntu 22.04', 'Ubuntu 24.04', 'Fedora 39'];

// ─── Seed data ────────────────────────────────────────────────
const INITIAL_DATA: HardwareCheck[] = [
    { id: 1, studentName: 'Aarav Sharma', cameraStatus: 'Passed', microphoneStatus: 'Passed', internetStatus: 'Passed', browser: 'Google Chrome', os: 'Windows 11', checkDate: '2026-03-01', notes: 'All devices working fine' },
    { id: 2, studentName: 'Priya Nair', cameraStatus: 'Passed', microphoneStatus: 'Failed', internetStatus: 'Passed', browser: 'Mozilla Firefox', os: 'macOS Sonoma', checkDate: '2026-03-02', notes: 'Microphone permission denied' },
    { id: 3, studentName: 'Rahul Verma', cameraStatus: 'Failed', microphoneStatus: 'Failed', internetStatus: 'Passed', browser: 'Microsoft Edge', os: 'Windows 10', checkDate: '2026-03-02', notes: 'Camera and mic blocked by browser settings' },
    { id: 4, studentName: 'Meera Iyer', cameraStatus: 'Passed', microphoneStatus: 'Passed', internetStatus: 'Failed', browser: 'Google Chrome', os: 'Ubuntu 22.04', checkDate: '2026-03-03', notes: 'Network issue — unstable Wi-Fi' },
    { id: 5, studentName: 'Karthik Reddy', cameraStatus: 'Passed', microphoneStatus: 'Passed', internetStatus: 'Passed', browser: 'Brave', os: 'macOS Ventura', checkDate: '2026-03-04', notes: 'Ready for interview' },
];

// ─── Blank form ───────────────────────────────────────────────
const BLANK_FORM: Omit<HardwareCheck, 'id'> = {
    studentName: '',
    cameraStatus: '',
    microphoneStatus: '',
    internetStatus: '',
    browser: '',
    os: '',
    checkDate: '',
    notes: '',
};

// ─── Status chip helper ───────────────────────────────────────
const statusChip = (value: string) => {
    const color = value === 'Passed' ? '#10B981' : value === 'Failed' ? '#EF4444' : '#637793';
    return <Chip label={value} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: '0.75rem' }} />;
};

// ─── Component ────────────────────────────────────────────────
const HardwareCheckForm: React.FC = () => {
    // ── Data state ──────────────────────────────────────────────
    const [rows, setRows] = useState<HardwareCheck[]>(INITIAL_DATA);
    const [nextId, setNextId] = useState(INITIAL_DATA.length + 1);

    // ── Dialog state ────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'insert' | 'update'>('insert');
    const [formData, setFormData] = useState<Omit<HardwareCheck, 'id'>>(BLANK_FORM);
    const [editId, setEditId] = useState<number | null>(null);

    // ── Delete confirmation ─────────────────────────────────────
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<HardwareCheck | null>(null);

    // ── Search ──────────────────────────────────────────────────
    const [searchId, setSearchId] = useState('');

    // ── Snackbar ────────────────────────────────────────────────
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });
    const toast = (message: string, severity: 'success' | 'info' | 'error' = 'success') =>
        setSnackbar({ open: true, message, severity });

    // ── Filtered rows ───────────────────────────────────────────
    const filteredRows = useMemo(() => {
        if (!searchId.trim()) return rows;
        const id = parseInt(searchId.trim(), 10);
        if (isNaN(id)) return rows;
        return rows.filter((r) => r.id === id);
    }, [rows, searchId]);

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 50, headerAlign: 'center', align: 'center' },
        { field: 'studentName', headerName: 'Student', flex: 1, minWidth: 110 },
        { field: 'cameraStatus', headerName: 'Camera', width: 95, renderCell: (p: GridRenderCellParams) => statusChip(p.value) },
        { field: 'microphoneStatus', headerName: 'Mic', width: 95, renderCell: (p: GridRenderCellParams) => statusChip(p.value) },
        { field: 'internetStatus', headerName: 'Internet', width: 95, renderCell: (p: GridRenderCellParams) => statusChip(p.value) },
        { field: 'browser', headerName: 'Browser', width: 110 },
        { field: 'os', headerName: 'OS', width: 110 },
        { field: 'checkDate', headerName: 'Date', width: 95 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditClick(params.row as HardwareCheck)} sx={{ color: '#4A90D9' }}>
                            <PencilSquareIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(params.row as HardwareCheck)} sx={{ color: '#EF4444' }}>
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

    const handleEditClick = (row: HardwareCheck) => {
        const { id, ...rest } = row;
        setFormData(rest);
        setEditId(id);
        setDialogMode('update');
        setDialogOpen(true);
    };

    const handleDeleteClick = (row: HardwareCheck) => {
        setDeleteTarget(row);
        setDeleteDialogOpen(true);
    };

    const handleDialogCancel = () => {
        setDialogOpen(false);
        toast('Operation cancelled', 'info');
    };

    const handleDialogOk = () => {
        if (!formData.studentName.trim() || !formData.cameraStatus || !formData.microphoneStatus || !formData.internetStatus || !formData.browser || !formData.os || !formData.checkDate) {
            toast('Please fill in all required fields', 'error');
            return;
        }
        if (dialogMode === 'insert') {
            const newRow: HardwareCheck = { id: nextId, ...formData };
            setRows((prev) => [...prev, newRow]);
            setNextId((n) => n + 1);
            toast(`Hardware check for "${formData.studentName}" inserted (ID ${nextId})`);
        } else {
            setRows((prev) => prev.map((r) => (r.id === editId ? { ...r, ...formData } : r)));
            toast(`Hardware check ID ${editId} updated successfully`);
        }
        setDialogOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        toast(`Hardware check for "${deleteTarget.studentName}" (ID ${deleteTarget.id}) deleted`);
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        toast('Delete cancelled', 'info');
    };

    // ── Form field handlers ─────────────────────────────────────
    const handleTextChange = (field: 'studentName' | 'checkDate' | 'notes') => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setFormData((f) => ({ ...f, [field]: e.target.value }));

    const handleSelectChange = (field: 'cameraStatus' | 'microphoneStatus' | 'internetStatus' | 'browser' | 'os') => (
        e: SelectChangeEvent
    ) => setFormData((f) => ({ ...f, [field]: e.target.value }));

    return (
        <div className="w-full max-w-full overflow-hidden space-y-6 pb-12">
            <InterviewModuleTabs />
            {/* ── Header ─────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold text-text-primary mb-1">Hardware Check</h1>
                <p className="text-text-muted">Manage pre-interview hardware verification records — Insert, Update, Delete, Search &amp; Display.</p>
            </motion.div>

            {/* ── Toolbar ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card-dark flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            >
                <TextField
                    size="small"
                    label="Search by ID"
                    placeholder="Enter Check ID…"
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
                    Insert New Check
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

            {/* ── Insert / Update Dialog (8 controls) ───────────── */}
            <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Inter', color: '#1A2B3C' }}>
                    {dialogMode === 'insert' ? '➕ Insert New Hardware Check' : `✏️ Update Check #${editId}`}
                </DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
                    {/* 1 — Student Name */}
                    <TextField
                        label="Student Name *"
                        fullWidth
                        value={formData.studentName}
                        onChange={handleTextChange('studentName')}
                    />
                    {/* 2 — Camera Status */}
                    <FormControl fullWidth>
                        <InputLabel>Camera Status *</InputLabel>
                        <Select value={formData.cameraStatus} label="Camera Status *" onChange={handleSelectChange('cameraStatus')}>
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 3 — Microphone Status */}
                    <FormControl fullWidth>
                        <InputLabel>Microphone Status *</InputLabel>
                        <Select value={formData.microphoneStatus} label="Microphone Status *" onChange={handleSelectChange('microphoneStatus')}>
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 4 — Internet Status */}
                    <FormControl fullWidth>
                        <InputLabel>Internet Status *</InputLabel>
                        <Select value={formData.internetStatus} label="Internet Status *" onChange={handleSelectChange('internetStatus')}>
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 5 — Browser */}
                    <FormControl fullWidth>
                        <InputLabel>Browser *</InputLabel>
                        <Select value={formData.browser} label="Browser *" onChange={handleSelectChange('browser')}>
                            {BROWSER_OPTIONS.map((b) => (
                                <MenuItem key={b} value={b}>{b}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 6 — OS */}
                    <FormControl fullWidth>
                        <InputLabel>Operating System *</InputLabel>
                        <Select value={formData.os} label="Operating System *" onChange={handleSelectChange('os')}>
                            {OS_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o}>{o}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 7 — Check Date */}
                    <TextField
                        label="Check Date *"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.checkDate}
                        onChange={handleTextChange('checkDate')}
                    />
                    {/* 8 — Notes */}
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={handleTextChange('notes')}
                        placeholder="Optional observations…"
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

            {/* ── Delete Confirmation ─────────────────────────────── */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Inter', color: '#EF4444' }}>
                    🗑️ Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: 'Inter', color: '#3D5168' }}>
                        Are you sure you want to delete the hardware check for <strong>"{deleteTarget?.studentName}"</strong> (ID: {deleteTarget?.id})?
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

export default HardwareCheckForm;
