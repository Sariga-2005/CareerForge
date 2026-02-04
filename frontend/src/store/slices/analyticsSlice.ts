import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/api/analyticsService';

// Types
export interface BatchAnalytics {
  batchId: string;
  batchName: string;
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  averageResumeScore: number;
  averageInterviewScore: number;
  topCompanies: { company: string; count: number }[];
  skillDistribution: { skill: string; count: number }[];
  salaryDistribution: { range: string; count: number }[];
}

export interface PlacementMetrics {
  totalStudents: number;
  totalPlaced: number;
  overallPlacementRate: number;
  averagePackage: number;
  highestPackage: number;
  pendingInterviews: number;
  activeJobs: number;
  alumniEngaged: number;
}

export interface StudentAnalytics {
  placementReady: number;
  needsImprovement: number;
  atRisk: number;
  skillGapAnalysis: {
    skill: string;
    studentsLacking: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  departmentWise: {
    department: string;
    students: number;
    placed: number;
    rate: number;
  }[];
}

export interface TimeSeriesData {
  label: string;
  value: number;
  date: string;
}

interface AnalyticsState {
  metrics: PlacementMetrics | null;
  batchAnalytics: BatchAnalytics[];
  studentAnalytics: StudentAnalytics | null;
  placementTrend: TimeSeriesData[];
  interviewTrend: TimeSeriesData[];
  resumeTrend: TimeSeriesData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AnalyticsState = {
  metrics: null,
  batchAnalytics: [],
  studentAnalytics: null,
  placementTrend: [],
  interviewTrend: [],
  resumeTrend: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async Thunks
export const fetchDashboardMetrics = createAsyncThunk(
  'analytics/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDashboardMetrics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

export const fetchBatchAnalytics = createAsyncThunk(
  'analytics/fetchBatch',
  async (batchId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getBatchAnalytics(batchId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batch analytics');
    }
  }
);

export const fetchStudentAnalytics = createAsyncThunk(
  'analytics/fetchStudent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getStudentAnalytics();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch student analytics'
      );
    }
  }
);

export const fetchTrendData = createAsyncThunk(
  'analytics/fetchTrends',
  async (
    params: { type: 'placement' | 'interview' | 'resume'; period: 'week' | 'month' | 'year' },
    { rejectWithValue }
  ) => {
    try {
      const response = await analyticsService.getTrendData(params.type, params.period);
      return { type: params.type, data: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trend data');
    }
  }
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async (
    params: { type: 'batch' | 'department' | 'overall'; format: 'pdf' | 'excel' },
    { rejectWithValue }
  ) => {
    try {
      const response = await analyticsService.generateReport(params.type, params.format);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    updateMetricsRealtime: (state, action: PayloadAction<Partial<PlacementMetrics>>) => {
      if (state.metrics) {
        state.metrics = { ...state.metrics, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Batch Analytics
      .addCase(fetchBatchAnalytics.fulfilled, (state, action) => {
        state.batchAnalytics = action.payload;
      })
      // Fetch Student Analytics
      .addCase(fetchStudentAnalytics.fulfilled, (state, action) => {
        state.studentAnalytics = action.payload;
      })
      // Fetch Trend Data
      .addCase(fetchTrendData.fulfilled, (state, action) => {
        switch (action.payload.type) {
          case 'placement':
            state.placementTrend = action.payload.data;
            break;
          case 'interview':
            state.interviewTrend = action.payload.data;
            break;
          case 'resume':
            state.resumeTrend = action.payload.data;
            break;
        }
      });
  },
});

export const { clearAnalyticsError, updateMetricsRealtime } = analyticsSlice.actions;

export default analyticsSlice.reducer;
