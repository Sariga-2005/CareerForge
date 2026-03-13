import api from './index';

export const jobService = {
    // Get all active jobs (with optional filters)
    getJobs: async (params?: { search?: string; type?: string; location?: string; page?: number; limit?: number }) => {
        const response = await api.get('/jobs', { params });
        return response.data.data;
    },

    // Get single job by ID
    getJobById: async (id: string) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data.data;
    },

    // Get recommended jobs with match scores
    getRecommendedJobs: async () => {
        const response = await api.get('/jobs/user/recommended');
        return response.data.data;
    },

    // Save / unsave a job
    getSavedJobs: async () => {
        const response = await api.get('/jobs/saved');
        return response.data.data;
    },

    saveJob: async (jobId: string) => {
        const response = await api.post('/jobs/save', { jobId });
        return response.data.data;
    },

    unsaveJob: async (jobId: string) => {
        const response = await api.delete(`/jobs/unsave/${jobId}`);
        return response.data.data;
    },

    // Apply for a job
    applyForJob: async (jobId: string, data: any) => {
        const response = await api.post(`/jobs/${jobId}/apply`, data);
        return response.data.data;
    },

    // Get user's applied jobs
    getMyApplications: async () => {
        const response = await api.get('/jobs/applications/me');
        return response.data.data;
    },

    // Check application status
    getApplicationStatus: async (jobId: string) => {
        const response = await api.get(`/jobs/${jobId}/application-status`);
        return response.data.data;
    },
};
