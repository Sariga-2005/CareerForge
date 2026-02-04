import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { interviewService } from '../../services/api/interviewService';

// Types
export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  expectedDuration: number;
}

export interface InterviewResponse {
  questionId: string;
  answer: string;
  audioUrl?: string;
  duration: number;
  timestamp: string;
  confidence: number;
  keywords: string[];
}

export interface InterviewMetrics {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  nervousnessLevel: number;
  eyeContactScore: number;
  speechClarity: number;
  responseRelevance: number;
  questionScores: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

export interface Interview {
  id: string;
  userId: string;
  jobId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'mock' | 'screening' | 'technical';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  metrics?: InterviewMetrics;
  transcript: {
    role: 'interviewer' | 'candidate';
    text: string;
    timestamp: string;
  }[];
  feedback?: string;
  passed?: boolean;
  decisionReason?: string;
}

interface InterviewState {
  currentInterview: Interview | null;
  interviews: Interview[];
  isLoading: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  currentQuestion: InterviewQuestion | null;
  currentQuestionIndex: number;
  liveTranscript: string;
  nervousnessLevel: number;
  error: string | null;
  // WebRTC
  localStream: MediaStream | null;
}

const initialState: InterviewState = {
  currentInterview: null,
  interviews: [],
  isLoading: false,
  isRecording: false,
  isProcessing: false,
  currentQuestion: null,
  currentQuestionIndex: 0,
  liveTranscript: '',
  nervousnessLevel: 0,
  error: null,
  localStream: null,
};

// Async Thunks
export const startInterview = createAsyncThunk(
  'interview/start',
  async (
    params: { jobId?: string; type: 'mock' | 'screening' | 'technical' },
    { rejectWithValue }
  ) => {
    try {
      const response = await interviewService.startInterview(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start interview');
    }
  }
);

export const submitResponse = createAsyncThunk(
  'interview/submitResponse',
  async (
    {
      interviewId,
      questionId,
      answer,
      audioBlob,
    }: {
      interviewId: string;
      questionId: string;
      answer: string;
      audioBlob?: Blob;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await interviewService.submitResponse(
        interviewId,
        questionId,
        answer,
        audioBlob
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit response');
    }
  }
);

export const getNextQuestion = createAsyncThunk(
  'interview/nextQuestion',
  async (interviewId: string, { rejectWithValue }) => {
    try {
      const response = await interviewService.getNextQuestion(interviewId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get next question');
    }
  }
);

export const endInterview = createAsyncThunk(
  'interview/end',
  async (interviewId: string, { rejectWithValue }) => {
    try {
      const response = await interviewService.endInterview(interviewId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end interview');
    }
  }
);

export const fetchInterviewHistory = createAsyncThunk(
  'interview/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterviewHistory();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchInterviewDetails = createAsyncThunk(
  'interview/fetchDetails',
  async (interviewId: string, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterviewDetails(interviewId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch details');
    }
  }
);

// Slice
const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setLiveTranscript: (state, action: PayloadAction<string>) => {
      state.liveTranscript = action.payload;
    },
    appendToTranscript: (state, action: PayloadAction<string>) => {
      state.liveTranscript += ' ' + action.payload;
    },
    setNervousnessLevel: (state, action: PayloadAction<number>) => {
      state.nervousnessLevel = action.payload;
    },
    setMediaStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.localStream = action.payload;
    },
    updateTranscript: (
      state,
      action: PayloadAction<{ role: 'interviewer' | 'candidate'; text: string }>
    ) => {
      if (state.currentInterview) {
        state.currentInterview.transcript.push({
          ...action.payload,
          timestamp: new Date().toISOString(),
        });
      }
    },
    clearInterviewError: (state) => {
      state.error = null;
    },
    resetInterview: (state) => {
      state.currentInterview = null;
      state.currentQuestion = null;
      state.currentQuestionIndex = 0;
      state.liveTranscript = '';
      state.nervousnessLevel = 0;
      state.isRecording = false;
      state.isProcessing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Interview
      .addCase(startInterview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startInterview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInterview = action.payload;
        state.currentQuestion = action.payload.questions[0] || null;
        state.currentQuestionIndex = 0;
      })
      .addCase(startInterview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit Response
      .addCase(submitResponse.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(submitResponse.fulfilled, (state, action) => {
        state.isProcessing = false;
        if (state.currentInterview) {
          state.currentInterview.responses.push(action.payload);
        }
      })
      .addCase(submitResponse.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })
      // Get Next Question
      .addCase(getNextQuestion.fulfilled, (state, action) => {
        state.currentQuestion = action.payload;
        state.currentQuestionIndex += 1;
        state.liveTranscript = '';
      })
      // End Interview
      .addCase(endInterview.fulfilled, (state, action) => {
        state.currentInterview = action.payload;
        state.isRecording = false;
      })
      // Fetch History
      .addCase(fetchInterviewHistory.fulfilled, (state, action) => {
        state.interviews = action.payload;
      })
      // Fetch Details
      .addCase(fetchInterviewDetails.fulfilled, (state, action) => {
        state.currentInterview = action.payload;
      });
  },
});

export const {
  setRecording,
  setLiveTranscript,
  appendToTranscript,
  setNervousnessLevel,
  setMediaStream,
  updateTranscript,
  clearInterviewError,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
