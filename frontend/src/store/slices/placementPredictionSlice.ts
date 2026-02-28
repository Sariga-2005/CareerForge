import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface PlacementPredictionRecord {
    _id: string;
    studentId: string;
    studentName: string;
    email: string;
    department: string;
    batch: string;
    cgpa: number;
    resumeScore: number;
    interviewScore: number;
    skillCount: number;
    placementProbability: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    predictedPackage: number;
    recommendations: string;
    lastCalculated: string;
    createdAt: string;
    updatedAt: string;
}

interface PlacementPredictionState {
    predictionList: PlacementPredictionRecord[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PlacementPredictionState = {
    predictionList: [],
    isLoading: false,
    error: null,
};

// Fetch all predictions
export const fetchAllPredictions = createAsyncThunk(
    'placementPrediction/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/predictions');
            return response.data.data.predictions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch predictions');
        }
    }
);

// Search predictions
export const searchPredictions = createAsyncThunk(
    'placementPrediction/search',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/predictions/search?q=${encodeURIComponent(query)}`);
            return response.data.data.predictions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search predictions');
        }
    }
);

// Auto-generate predictions
export const generatePredictions = createAsyncThunk(
    'placementPrediction/generate',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/predictions/generate');
            return response.data.data.predictions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to generate predictions');
        }
    }
);

// Create manual prediction
export const createPrediction = createAsyncThunk(
    'placementPrediction/create',
    async (data: Omit<PlacementPredictionRecord, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/predictions', data);
            return response.data.data.prediction;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create prediction');
        }
    }
);

// Update prediction
export const updatePrediction = createAsyncThunk(
    'placementPrediction/update',
    async ({ id, data }: { id: string; data: Partial<PlacementPredictionRecord> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/predictions/${id}`, data);
            return response.data.data.prediction;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update prediction');
        }
    }
);

// Delete prediction
export const deletePrediction = createAsyncThunk(
    'placementPrediction/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/predictions/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete prediction');
        }
    }
);

const placementPredictionSlice = createSlice({
    name: 'placementPrediction',
    initialState,
    reducers: {
        clearPredictionError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all
        builder
            .addCase(fetchAllPredictions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllPredictions.fulfilled, (state, action: PayloadAction<PlacementPredictionRecord[]>) => {
                state.isLoading = false;
                state.predictionList = action.payload;
            })
            .addCase(fetchAllPredictions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Search
        builder
            .addCase(searchPredictions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchPredictions.fulfilled, (state, action: PayloadAction<PlacementPredictionRecord[]>) => {
                state.isLoading = false;
                state.predictionList = action.payload;
            })
            .addCase(searchPredictions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Generate
        builder
            .addCase(generatePredictions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generatePredictions.fulfilled, (state, action: PayloadAction<PlacementPredictionRecord[]>) => {
                state.isLoading = false;
                state.predictionList = action.payload;
            })
            .addCase(generatePredictions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createPrediction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPrediction.fulfilled, (state, action: PayloadAction<PlacementPredictionRecord>) => {
                state.isLoading = false;
                state.predictionList.unshift(action.payload);
            })
            .addCase(createPrediction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updatePrediction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePrediction.fulfilled, (state, action: PayloadAction<PlacementPredictionRecord>) => {
                state.isLoading = false;
                const index = state.predictionList.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.predictionList[index] = action.payload;
                }
            })
            .addCase(updatePrediction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deletePrediction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePrediction.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.predictionList = state.predictionList.filter((p) => p._id !== action.payload);
            })
            .addCase(deletePrediction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPredictionError } = placementPredictionSlice.actions;
export default placementPredictionSlice.reducer;
