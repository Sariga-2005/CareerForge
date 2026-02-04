import api, { uploadWithProgress } from './index';
import { ResumeAnalysis } from '../../store/slices/resumeSlice';

export const resumeService = {
  uploadResume: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ResumeAnalysis> => {
    const response = await uploadWithProgress('/resume/upload', file, onProgress);
    // Backend returns { success, data: { resume } }
    return response.data.data?.resume || response.data.resume || response.data;
  },

  analyzeResume: async (resumeId: string): Promise<ResumeAnalysis> => {
    const response = await api.post(`/resume/${resumeId}/analyze`);
    // Backend returns { success, data: { analysis } }
    return response.data.data?.analysis || response.data.data || response.data;
  },

  getResumes: async (): Promise<ResumeAnalysis[]> => {
    const response = await api.get('/resume');
    // Backend returns { success, data: { resumes } }
    return response.data.data?.resumes || response.data.resumes || response.data;
  },

  getResumeAnalysis: async (resumeId: string): Promise<ResumeAnalysis> => {
    const response = await api.get(`/resume/${resumeId}/analysis`);
    return response.data.data?.analysis || response.data.analysis || response.data;
  },

  matchWithJD: async (
    resumeId: string,
    jobDescriptionId: string
  ): Promise<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  }> => {
    const response = await api.post(`/resume/${resumeId}/match`, { jobDescriptionId });
    return response.data;
  },

  deleteResume: async (resumeId: string): Promise<void> => {
    await api.delete(`/resume/${resumeId}`);
  },

  downloadResume: async (resumeId: string): Promise<Blob> => {
    const response = await api.get(`/resume/${resumeId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getSkillGaps: async (
    resumeId: string,
    targetJobId?: string
  ): Promise<{
    gaps: {
      skill: string;
      required: number;
      current: number;
      priority: 'high' | 'medium' | 'low';
      resources: string[];
    }[];
  }> => {
    const response = await api.get(`/resume/${resumeId}/skill-gaps`, {
      params: { targetJobId },
    });
    return response.data;
  },

  getPlacementProbability: async (
    resumeId: string
  ): Promise<{
    probability: number;
    factors: { factor: string; impact: number }[];
    suggestions: string[];
  }> => {
    const response = await api.get(`/resume/${resumeId}/placement-probability`);
    return response.data;
  },
};
