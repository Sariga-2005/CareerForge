import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  PaintBrushIcon, 
  RocketLaunchIcon, 
  BugAntIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import feedbackService, { FeedbackData } from '../services/api/feedbackService';


const FeedbackPage: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    rating: 0,
    category: 'other',
    message: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'ui', label: 'User Interface', icon: PaintBrushIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'features', label: 'New Features', icon: RocketLaunchIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'bug', label: 'Bugs/Issues', icon: BugAntIcon, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'other', label: 'General', icon: EllipsisHorizontalIcon, color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback(formData);
      toast.success('Thank you for your feedback!');
      setFormData({
        name: '',
        email: '',
        rating: 0,
        category: 'other',
        message: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">We'd Love Your Feedback!</h1>
          <p className="text-lg text-gray-600">
            Help us make CareerForge the best placement platform for everyone.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Section */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= (hoverRating || formData.rating) ? (
                        <StarSolidIcon className="h-10 w-10 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-10 w-10 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Which area should we focus on?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id as any })}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat.id 
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <cat.icon className={`h-8 w-8 ${cat.color} mb-2`} />
                      <span className="text-xs font-semibold text-gray-600">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us more
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="What's on your mind? Suggestions, bugs, or just a hello!"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${
                  isSubmitting 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Send Feedback'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          CareerForge Team • feedback@careerforge-app.com
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackPage;
