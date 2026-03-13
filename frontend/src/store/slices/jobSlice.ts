import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../../services/api/jobService';

/* ═══════ Types ═══════ */
interface Job {
    _id: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    location: string;
    type: string;
    level: string;
    salary?: { min: number; max: number; currency: string; period: string };
    requiredSkills: string[];
    preferredSkills?: string[];
    description: string;
    requirements: string[];
    responsibilities: string[];
    applicationDeadline: string;
    status: string;
    matchScore?: number;
    referralAvailable?: boolean;
    stats?: { views: number; applications: number; shortlisted: number; selected: number };
}

interface JobState {
    jobs: Job[];
    recommendedJobs: Job[];
    savedJobIds: string[];
    appliedJobIds: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: JobState = {
    jobs: [],
    recommendedJobs: [],
    savedJobIds: [],
    appliedJobIds: [],
    isLoading: false,
    error: null,
};

/* ═══════ Thunks ═══════ */
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (params: { search?: string; type?: string; location?: string } | undefined, { rejectWithValue }) => {
    try {
        return await jobService.getJobs(params);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load jobs'); }
});

export const fetchRecommendedJobs = createAsyncThunk('jobs/fetchRecommended', async (_, { rejectWithValue }) => {
    try {
        return await jobService.getRecommendedJobs();
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load recommendations'); }
});

export const fetchSavedJobs = createAsyncThunk('jobs/fetchSaved', async (_, { rejectWithValue }) => {
    try {
        return await jobService.getSavedJobs();
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load saved jobs'); }
});

export const saveJob = createAsyncThunk('jobs/save', async (jobId: string, { rejectWithValue }) => {
    try {
        const data = await jobService.saveJob(jobId);
        return data.savedJobs;
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to save job'); }
});


export const unsaveJob = createAsyncThunk('jobs/unsave', async (jobId: string, { rejectWithValue }) => {
    try {
        const data = await jobService.unsaveJob(jobId);
        return data.savedJobs;
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to unsave job'); }
});


export const applyForJob = createAsyncThunk('jobs/apply', async ({ jobId, data }: { jobId: string; data: any }, { rejectWithValue }) => {
    try {
        return await jobService.applyForJob(jobId, data);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to apply'); }
});

export const fetchAppliedJobs = createAsyncThunk('jobs/fetchApplied', async (_, { rejectWithValue }) => {
    try {
        return await jobService.getMyApplications();
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load applied jobs'); }
});

/* ═══════ Slice ═══════ */
const jobSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobs.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs = action.payload?.jobs || [];
            })
            .addCase(fetchJobs.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

            .addCase(fetchRecommendedJobs.pending, (state) => { state.isLoading = true; })
            .addCase(fetchRecommendedJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.recommendedJobs = action.payload?.jobs || [];
            })
            .addCase(fetchRecommendedJobs.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

            .addCase(fetchSavedJobs.fulfilled, (state, action) => {
                state.savedJobIds = action.payload?.savedJobs || [];
            })

            .addCase(saveJob.fulfilled, (state, action) => {
                state.savedJobIds = action.payload || [];
            })
            .addCase(unsaveJob.fulfilled, (state, action) => {
                state.savedJobIds = action.payload || [];
            })

            
            .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
                const applications = action.payload?.applications || [];
                state.appliedJobIds = applications.map((app: any) => app.jobId._id || app.jobId);
            })
            .addCase(applyForJob.fulfilled, (state, action) => {
                const appId = action.payload?.application?.jobId?._id || action.payload?.application?.jobId;
                if (appId && !state.appliedJobIds.includes(appId)) {
                    state.appliedJobIds.push(appId);
                }
            });
    },
});

export default jobSlice.reducer;
