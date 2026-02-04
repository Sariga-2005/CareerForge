import React from 'react';
import { motion } from 'framer-motion';

const PlacementReports: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-light">Placement Reports</h1>
      <p className="text-light-400 mt-1">Generate and download reports</p>
    </motion.div>
    <div className="card-dark text-center py-12">
      <p className="text-light-400">Report generation interface coming soon</p>
    </div>
  </div>
);

export default PlacementReports;
