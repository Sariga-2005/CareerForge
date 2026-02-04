import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { resumeService } from '../../services/api/resumeService';

// Types
export interface SkillGap {
  skill: string;
  required: number;
  current: number;
  priority: 'high' | 'medium' | 'low';
  resources?: string[];
}

export interface ResumeAnalysis {
  id?: string;
  _id?: string;
  userId?: string;
  fileName?: string;
  originalName?: string;
  uploadedAt?: string;
  createdAt?: string;
  overallScore?: number;
  jobFitScore?: number;
  placementProbability?: number;
  skills?: {
    technical?: string[];
    soft?: string[];
    missing?: string[];
  };
  skillGaps?: SkillGap[];
  experience?: {
    years?: number;
    relevantExperience?: string[];
    highlights?: string[];
  };
  education?: {
    degree: string;
    institution: string;
    gpa?: number;
    relevance?: number;
  }[];
  suggestions?: string[];
  atsScore?: number;
  sectionScores?: {
    contact?: number;
    summary?: number;
    experience?: number;
    education?: number;
    skills?: number;
    formatting?: number;
  };
  embedding?: number[];
  // Backend fields
  parsedData?: any;
  analysis?: any;
  storagePath?: string;
  mimeType?: string;
  fileSize?: number;
  isActive?: boolean;
  version?: number;
}

interface ResumeState {
  currentResume: ResumeAnalysis | null;
  resumes: ResumeAnalysis[];
  uploadProgress: number;
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  currentResume: null,
  resumes: [],
  uploadProgress: 0,
  isUploading: false,
  isAnalyzing: false,
  error: null,
};

// Async Thunks
export const uploadResume = createAsyncThunk(
  'resume/upload',
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      const response = await resumeService.uploadResume(file, (progress) => {
        dispatch(setUploadProgress(progress));
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const analyzeResume = createAsyncThunk(
  'resume/analyze',
  async (resumeId: string, { rejectWithValue }) => {
    try {
      const response = await resumeService.analyzeResume(resumeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Analysis failed');
    }
  }
);

export const fetchResumes = createAsyncThunk(
  'resume/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeService.getResumes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resumes');
    }
  }
);

export const fetchResumeAnalysis = createAsyncThunk(
  'resume/fetchAnalysis',
  async (resumeId: string, { rejectWithValue }) => {
    try {
      const response = await resumeService.getResumeAnalysis(resumeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis');
    }
  }
);

export const matchJobDescription = createAsyncThunk(
  'resume/matchJD',
  async (
    { resumeId, jobDescriptionId }: { resumeId: string; jobDescriptionId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await resumeService.matchWithJD(resumeId, jobDescriptionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Matching failed');
    }
  }
);

// Slice
const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearResumeError: (state) => {
      state.error = null;
    },
    setCurrentResume: (state, action: PayloadAction<ResumeAnalysis>) => {
      state.currentResume = action.payload;
    },
    clearCurrentResume: (state) => {
      state.currentResume = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Resume
      .addCase(uploadResume.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.currentResume = action.payload;
        state.resumes.unshift(action.payload);
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      })
      // Analyze Resume
      .addCase(analyzeResume.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.currentResume = action.payload;
        // Update in list
        const index = state.resumes.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.resumes[index] = action.payload;
        }
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      })
      // Fetch Resumes
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.resumes = action.payload;
        // Set the most recent (first) resume as current if we don't have one
        if (!state.currentResume && action.payload.length > 0) {
          state.currentResume = action.payload[0];
        }
      })
      // Fetch Analysis
      .addCase(fetchResumeAnalysis.fulfilled, (state, action) => {
        state.currentResume = action.payload;
      });
  },
});

export const {
  setUploadProgress,
  clearResumeError,
  setCurrentResume,
  clearCurrentResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;
