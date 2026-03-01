import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    VideoCameraIcon,
    AdjustmentsHorizontalIcon,
    SignalIcon,
    TableCellsIcon,
} from '@heroicons/react/24/outline';

const TABS = [
    { path: '/student/interview', label: 'Mock Interview', icon: VideoCameraIcon },
    { path: '/student/interview/config', label: 'Interview Config', icon: AdjustmentsHorizontalIcon },
    { path: '/student/interview/hardware-check', label: 'Hardware Check', icon: SignalIcon },
    { path: '/student/interview/tables', label: 'Data Tables', icon: TableCellsIcon },
];

const InterviewModuleTabs: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex items-center gap-1 p-1.5 bg-surface-200 rounded-2xl border-2 border-surface-300 mb-6 overflow-x-auto">
            {TABS.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex-1 justify-center whitespace-nowrap
              ${isActive
                                ? 'text-white'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white/60'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="interviewTab"
                                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/30"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default InterviewModuleTabs;
