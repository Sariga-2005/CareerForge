import api from './index';
import {
  PlacementMetrics,
  BatchAnalytics,
  StudentAnalytics,
  TimeSeriesData,
} from '../../store/slices/analyticsSlice';

export const analyticsService = {
  getDashboardMetrics: async (): Promise<PlacementMetrics> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getBatchAnalytics: async (batchId?: string): Promise<BatchAnalytics[]> => {
    const response = await api.get('/analytics/batch', {
      params: { batchId },
    });
    return response.data;
  },

  getStudentAnalytics: async (): Promise<StudentAnalytics> => {
    const response = await api.get('/analytics/students');
    return response.data;
  },

  getTrendData: async (
    type: 'placement' | 'interview' | 'resume',
    period: 'week' | 'month' | 'year'
  ): Promise<TimeSeriesData[]> => {
    const response = await api.get(`/analytics/trends/${type}`, {
      params: { period },
    });
    return response.data;
  },

  generateReport: async (
    type: 'batch' | 'department' | 'overall',
    format: 'pdf' | 'excel'
  ): Promise<{ downloadUrl: string }> => {
    const response = await api.post('/analytics/report', { type, format });
    return response.data;
  },

  getCompanyStats: async (): Promise<
    {
      company: string;
      hires: number;
      averagePackage: number;
      openPositions: number;
    }[]
  > => {
    const response = await api.get('/analytics/companies');
    return response.data;
  },

  getSkillDemand: async (): Promise<
    {
      skill: string;
      demand: number;
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    }[]
  > => {
    const response = await api.get('/analytics/skill-demand');
    return response.data;
  },

  getAlumniEngagement: async (): Promise<{
    totalAlumni: number;
    activeAlumni: number;
    referralsMade: number;
    successfulPlacements: number;
    topReferrers: { name: string; referrals: number; company: string }[];
  }> => {
    const response = await api.get('/analytics/alumni-engagement');
    return response.data;
  },

  getRealTimeStats: async (): Promise<{
    activeInterviews: number;
    resumesProcessingNow: number;
    onlineStudents: number;
    pendingReviews: number;
  }> => {
    const response = await api.get('/analytics/realtime');
    return response.data;
  },
};
