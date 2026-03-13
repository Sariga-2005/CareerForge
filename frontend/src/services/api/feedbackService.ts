import api from './index';


export interface FeedbackData {
  name?: string;
  email?: string;
  rating: number;
  category: 'ui' | 'features' | 'bug' | 'other';
  message: string;
}

const feedbackService = {
  submitFeedback: async (data: FeedbackData) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  getAllFeedback: async () => {
    const response = await api.get('/feedback');
    return response.data;
  }
};


export default feedbackService;
