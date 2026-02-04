import React from 'react';
import { motion } from 'framer-motion';

const AlumniEngagement: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-light">Alumni Engagement</h1>
      <p className="text-light-400 mt-1">Track alumni outreach and referrals</p>
    </motion.div>
    <div className="card-dark text-center py-12">
      <p className="text-light-400">Alumni engagement dashboard coming soon</p>
    </div>
  </div>
);

export default AlumniEngagement;
