import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface PlacementReportRecord {
    _id: string;
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
    createdAt: string;
    updatedAt: string;
}

interface PlacementReportState {
    reportList: PlacementReportRecord[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PlacementReportState = {
    reportList: [],
    isLoading: false,
    error: null,
};

// Fetch all reports
export const fetchAllReports = createAsyncThunk(
    'placementReport/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/reports');
            return response.data.data.reports;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch reports');
        }
    }
);

// Search reports by ID or title
export const searchReports = createAsyncThunk(
    'placementReport/search',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/reports/search?q=${encodeURIComponent(query)}`);
            return response.data.data.reports;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search reports');
        }
    }
);

// Create report
export const createReport = createAsyncThunk(
    'placementReport/create',
    async (data: Omit<PlacementReportRecord, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/reports', data);
            return response.data.data.report;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create report');
        }
    }
);

// Update report
export const updateReport = createAsyncThunk(
    'placementReport/update',
    async ({ id, data }: { id: string; data: Partial<PlacementReportRecord> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/reports/${id}`, data);
            return response.data.data.report;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update report');
        }
    }
);

// Delete report
export const deleteReport = createAsyncThunk(
    'placementReport/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/reports/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete report');
        }
    }
);

const placementReportSlice = createSlice({
    name: 'placementReport',
    initialState,
    reducers: {
        clearReportError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all
        builder
            .addCase(fetchAllReports.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllReports.fulfilled, (state, action: PayloadAction<PlacementReportRecord[]>) => {
                state.isLoading = false;
                state.reportList = action.payload;
            })
            .addCase(fetchAllReports.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Search
        builder
            .addCase(searchReports.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchReports.fulfilled, (state, action: PayloadAction<PlacementReportRecord[]>) => {
                state.isLoading = false;
                state.reportList = action.payload;
            })
            .addCase(searchReports.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createReport.fulfilled, (state, action: PayloadAction<PlacementReportRecord>) => {
                state.isLoading = false;
                state.reportList.unshift(action.payload);
            })
            .addCase(createReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateReport.fulfilled, (state, action: PayloadAction<PlacementReportRecord>) => {
                state.isLoading = false;
                const index = state.reportList.findIndex((r) => r._id === action.payload._id);
                if (index !== -1) {
                    state.reportList[index] = action.payload;
                }
            })
            .addCase(updateReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteReport.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.reportList = state.reportList.filter((r) => r._id !== action.payload);
            })
            .addCase(deleteReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearReportError } = placementReportSlice.actions;
export default placementReportSlice.reducer;
