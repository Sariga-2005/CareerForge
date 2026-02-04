import React from 'react';
import { motion } from 'framer-motion';

const MentorshipPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-light">Mentorship</h1>
      <p className="text-light-400 mt-1">Connect with students for mentoring</p>
    </motion.div>
    <div className="card-dark text-center py-12">
      <p className="text-light-400">Mentorship interface coming soon</p>
    </div>
  </div>
);

export default MentorshipPage;
