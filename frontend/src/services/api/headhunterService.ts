import api from './index';

export const headhunterService = {
    // ─── Campaigns ───
    getCampaigns: async (search?: string) => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await api.get(`/headhunter/campaigns${params}`);
        return response.data.data;
    },

    getCampaignById: async (id: string) => {
        const response = await api.get(`/headhunter/campaigns/${id}`);
        return response.data.data;
    },

    createCampaign: async (data: any) => {
        const response = await api.post('/headhunter/campaigns', data);
        return response.data.data;
    },

    updateCampaign: async (id: string, data: any) => {
        const response = await api.put(`/headhunter/campaigns/${id}`, data);
        return response.data.data;
    },

    deleteCampaign: async (id: string) => {
        const response = await api.delete(`/headhunter/campaigns/${id}`);
        return response.data;
    },

    runCampaign: async (id: string, templateId?: string) => {
        const response = await api.post(`/headhunter/campaigns/${id}/run`, { templateId });
        return response.data;
    },
    getTemplates: async (search?: string) => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await api.get(`/headhunter/templates${params}`);
        return response.data.data;
    },

    getTemplateById: async (id: string) => {
        const response = await api.get(`/headhunter/templates/${id}`);
        return response.data.data;
    },

    createTemplate: async (data: any) => {
        const response = await api.post('/headhunter/templates', data);
        return response.data.data;
    },

    updateTemplate: async (id: string, data: any) => {
        const response = await api.put(`/headhunter/templates/${id}`, data);
        return response.data.data;
    },

    deleteTemplate: async (id: string) => {
        const response = await api.delete(`/headhunter/templates/${id}`);
        return response.data;
    },
};
