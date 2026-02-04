import React from 'react';
import { motion } from 'framer-motion';

const JobManagement: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-light">Job Management</h1>
      <p className="text-light-400 mt-1">Manage job postings and applications</p>
    </motion.div>
    <div className="card-dark text-center py-12">
      <p className="text-light-400">Job management interface coming soon</p>
    </div>
  </div>
);

export default JobManagement;
