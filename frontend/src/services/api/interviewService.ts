import api from './index';
import { Interview, InterviewQuestion, InterviewResponse } from '../../store/slices/interviewSlice';

// Map frontend interview types to backend types
const mapInterviewType = (type: 'mock' | 'screening' | 'technical'): 'behavioral' | 'hr' | 'technical' => {
  switch (type) {
    case 'mock': return 'behavioral';
    case 'screening': return 'hr';
    case 'technical': return 'technical';
    default: return 'behavioral';
  }
};

// Map backend question format to frontend format
const mapQuestion = (q: any): InterviewQuestion => ({
  id: q.id || q._id || String(Math.random()),
  question: q.question || q.text || '',
  type: q.type || q.category?.toLowerCase() === 'technical' ? 'technical' : 'behavioral',
  difficulty: q.difficulty || 'medium',
  topic: q.topic || q.category || 'General',
  expectedDuration: q.expectedDuration || q.timeLimit || 180,
});

// Map backend interview format to frontend format
const mapInterview = (data: any): Interview => {
  const interview = data.interview || data;
  const questions = interview.questions || [];
  
  return {
    id: interview._id || interview.id || '',
    userId: interview.userId || '',
    jobId: interview.jobId,
    status: interview.status || 'scheduled',
    type: interview.type === 'behavioral' ? 'mock' : interview.type === 'hr' ? 'screening' : interview.type || 'mock',
    startedAt: interview.startedAt,
    completedAt: interview.completedAt,
    duration: interview.duration,
    questions: questions.map(mapQuestion),
    responses: interview.responses || [],
    metrics: interview.metrics,
    transcript: interview.transcript || [],
    feedback: interview.feedback,
    passed: interview.passed,
    decisionReason: interview.decisionReason,
  };
};

export const interviewService = {
  startInterview: async (params: {
    jobId?: string;
    type: 'mock' | 'screening' | 'technical';
  }): Promise<Interview> => {
    // First create the interview with mapped type
    const backendType = mapInterviewType(params.type);
    const createResponse = await api.post('/interview', {
      type: backendType,
      difficulty: 'medium',
      targetRole: params.type === 'technical' ? 'Software Developer' : 'General',
    });
    const interview = createResponse.data.data?.interview || createResponse.data.interview || createResponse.data;
    
    // Then start it
    const startResponse = await api.post(`/interview/${interview._id}/start`);
    const startedInterview = startResponse.data.data?.interview || startResponse.data.interview || startResponse.data;
    
    return mapInterview(startedInterview);
  },

  submitResponse: async (
    interviewId: string,
    questionId: string,
    answer: string,
    audioBlob?: Blob
  ): Promise<InterviewResponse> => {
    const formData = new FormData();
    formData.append('questionId', questionId);
    formData.append('answer', answer);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'response.webm');
    }

    const response = await api.post(`/interview/${interviewId}/answer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  getNextQuestion: async (interviewId: string): Promise<InterviewQuestion> => {
    const response = await api.get(`/interview/${interviewId}/next-question`);
    const question = response.data.data || response.data;
    return mapQuestion(question);
  },

  endInterview: async (interviewId: string): Promise<Interview> => {
    const response = await api.post(`/interview/${interviewId}/complete`);
    const interview = response.data.data?.interview || response.data.interview || response.data;
    return mapInterview(interview);
  },

  getInterviewHistory: async (): Promise<Interview[]> => {
    const response = await api.get('/interview');
    const interviews = response.data.data?.interviews || response.data.interviews || response.data || [];
    return Array.isArray(interviews) ? interviews.map(mapInterview) : [];
  },

  getInterviewDetails: async (interviewId: string): Promise<Interview> => {
    const response = await api.get(`/interview/${interviewId}`);
    return mapInterview(response.data.data || response.data);
  },

  getInterviewFeedback: async (
    interviewId: string
  ): Promise<{
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
    resources: { topic: string; url: string }[];
  }> => {
    const response = await api.get(`/interview/${interviewId}/feedback`);
    return response.data;
  },

  transcribeAudio: async (audioBlob: Blob): Promise<{ text: string; confidence: number }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await api.post('/interview/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzeConfidence: async (
    videoBlob: Blob
  ): Promise<{
    confidenceScore: number;
    nervousnessLevel: number;
    eyeContactScore: number;
    emotionBreakdown: { emotion: string; percentage: number }[];
  }> => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'video.webm');

    const response = await api.post('/interview/analyze-confidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  scheduleInterview: async (params: {
    userId: string;
    jobId: string;
    scheduledAt: string;
    type: 'screening' | 'technical';
  }): Promise<Interview> => {
    const response = await api.post('/interview/schedule', params);
    return response.data;
  },

  cancelInterview: async (interviewId: string): Promise<void> => {
    await api.post(`/interview/${interviewId}/cancel`);
  },
};
