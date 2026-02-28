import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AlumniRecord {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    graduationYear: number;
    department: string;
    currentCompany: string;
    currentDesignation: string;
    phone: string;
    linkedIn: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AlumniAdminState {
    alumniList: AlumniRecord[];
    isLoading: boolean;
    error: string | null;
}

const initialState: AlumniAdminState = {
    alumniList: [],
    isLoading: false,
    error: null,
};

// Fetch all alumni
export const fetchAllAlumni = createAsyncThunk(
    'alumniAdmin/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/alumni');
            return response.data.data.alumni;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch alumni');
        }
    }
);

// Search alumni by email
export const searchAlumniByEmail = createAsyncThunk(
    'alumniAdmin/search',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/alumni/search?email=${encodeURIComponent(email)}`);
            return response.data.data.alumni;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search alumni');
        }
    }
);

// Create alumni
export const createAlumni = createAsyncThunk(
    'alumniAdmin/create',
    async (data: Omit<AlumniRecord, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/alumni', data);
            return response.data.data.alumni;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create alumni');
        }
    }
);

// Update alumni
export const updateAlumni = createAsyncThunk(
    'alumniAdmin/update',
    async ({ id, data }: { id: string; data: Partial<AlumniRecord> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/alumni/${id}`, data);
            return response.data.data.alumni;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update alumni');
        }
    }
);

// Delete alumni
export const deleteAlumni = createAsyncThunk(
    'alumniAdmin/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/alumni/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete alumni');
        }
    }
);

const alumniAdminSlice = createSlice({
    name: 'alumniAdmin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all
        builder
            .addCase(fetchAllAlumni.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllAlumni.fulfilled, (state, action: PayloadAction<AlumniRecord[]>) => {
                state.isLoading = false;
                state.alumniList = action.payload;
            })
            .addCase(fetchAllAlumni.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Search
        builder
            .addCase(searchAlumniByEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchAlumniByEmail.fulfilled, (state, action: PayloadAction<AlumniRecord[]>) => {
                state.isLoading = false;
                state.alumniList = action.payload;
            })
            .addCase(searchAlumniByEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createAlumni.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createAlumni.fulfilled, (state, action: PayloadAction<AlumniRecord>) => {
                state.isLoading = false;
                state.alumniList.unshift(action.payload);
            })
            .addCase(createAlumni.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateAlumni.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAlumni.fulfilled, (state, action: PayloadAction<AlumniRecord>) => {
                state.isLoading = false;
                const index = state.alumniList.findIndex((a) => a._id === action.payload._id);
                if (index !== -1) {
                    state.alumniList[index] = action.payload;
                }
            })
            .addCase(updateAlumni.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteAlumni.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteAlumni.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.alumniList = state.alumniList.filter((a) => a._id !== action.payload);
            })
            .addCase(deleteAlumni.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = alumniAdminSlice.actions;
export default alumniAdminSlice.reducer;
