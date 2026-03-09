import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { headhunterService } from '../../services/api/headhunterService';

/* ═══════ Types ═══════ */
interface Campaign {
    _id?: string;
    campaignName: string;
    targetCompanyType: string;
    targetAlumniLevel: string;
    targetIndustry: string;
    maxEmailsPerWeek: number;
    priority: 'low' | 'medium' | 'high';
    consentGiven: boolean;
    isActive: boolean;
    notes: string;
}

interface EmailTemplate {
    _id?: string;
    templateName: string;
    subject: string;
    body: string;
    signature: string;
    portfolioLabel: string;
    portfolioUrl: string;
    tone: 'formal' | 'semi-formal' | 'casual';
    isDefault: boolean;
    category: 'outreach' | 'follow-up' | 'thank-you' | 'referral';
}

interface HeadhunterState {
    campaigns: Campaign[];
    templates: EmailTemplate[];
    isLoading: boolean;
    error: string | null;
}

const initialState: HeadhunterState = {
    campaigns: [],
    templates: [],
    isLoading: false,
    error: null,
};

/* ═══════ Thunks ═══════ */
export const fetchCampaigns = createAsyncThunk('headhunter/fetchCampaigns', async (search: string | undefined, { rejectWithValue }) => {
    try {
        return await headhunterService.getCampaigns(search);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load campaigns'); }
});

export const addCampaign = createAsyncThunk('headhunter/addCampaign', async (data: Omit<Campaign, '_id'>, { rejectWithValue }) => {
    try {
        return await headhunterService.createCampaign(data);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to create campaign'); }
});

export const editCampaign = createAsyncThunk('headhunter/editCampaign', async ({ id, data }: { id: string; data: Partial<Campaign> }, { rejectWithValue }) => {
    try {
        return await headhunterService.updateCampaign(id, data);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to update campaign'); }
});

export const removeCampaign = createAsyncThunk('headhunter/removeCampaign', async (id: string, { rejectWithValue }) => {
    try {
        await headhunterService.deleteCampaign(id);
        return id;
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to delete campaign'); }
});

export const executeCampaign = createAsyncThunk('headhunter/executeCampaign', async ({ id, templateId }: { id: string; templateId?: string }, { rejectWithValue }) => {
    try {
        return await headhunterService.runCampaign(id, templateId);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to run campaign'); }
});

export const fetchTemplates = createAsyncThunk('headhunter/fetchTemplates', async (search: string | undefined, { rejectWithValue }) => {
    try {
        return await headhunterService.getTemplates(search);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load templates'); }
});

export const addTemplate = createAsyncThunk('headhunter/addTemplate', async (data: Omit<EmailTemplate, '_id'>, { rejectWithValue }) => {
    try {
        return await headhunterService.createTemplate(data);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to create template'); }
});

export const editTemplate = createAsyncThunk('headhunter/editTemplate', async ({ id, data }: { id: string; data: Partial<EmailTemplate> }, { rejectWithValue }) => {
    try {
        return await headhunterService.updateTemplate(id, data);
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to update template'); }
});

export const removeTemplate = createAsyncThunk('headhunter/removeTemplate', async (id: string, { rejectWithValue }) => {
    try {
        await headhunterService.deleteTemplate(id);
        return id;
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to delete template'); }
});

/* ═══════ Slice ═══════ */
const headhunterSlice = createSlice({
    name: 'headhunter',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Campaigns
        builder
            .addCase(fetchCampaigns.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchCampaigns.fulfilled, (state, action) => { state.isLoading = false; state.campaigns = action.payload || []; })
            .addCase(fetchCampaigns.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
            .addCase(addCampaign.fulfilled, (state, action) => { if (action.payload) state.campaigns.push(action.payload); })
            .addCase(editCampaign.fulfilled, (state, action) => {
                const idx = state.campaigns.findIndex(c => c._id === action.payload?._id);
                if (idx !== -1) state.campaigns[idx] = action.payload;
            })
            .addCase(removeCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
            });

        // Templates
        builder
            .addCase(fetchTemplates.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchTemplates.fulfilled, (state, action) => { state.isLoading = false; state.templates = action.payload || []; })
            .addCase(fetchTemplates.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
            .addCase(addTemplate.fulfilled, (state, action) => { if (action.payload) state.templates.push(action.payload); })
            .addCase(editTemplate.fulfilled, (state, action) => {
                const idx = state.templates.findIndex(t => t._id === action.payload?._id);
                if (idx !== -1) state.templates[idx] = action.payload;
            })
            .addCase(removeTemplate.fulfilled, (state, action) => {
                state.templates = state.templates.filter(t => t._id !== action.payload);
            });
    },
});

export default headhunterSlice.reducer;
