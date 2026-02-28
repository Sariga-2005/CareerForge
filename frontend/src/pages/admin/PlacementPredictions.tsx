import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    BoltIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../../store';
import {
    fetchAllPredictions,
    searchPredictions,
    generatePredictions,
    PlacementPredictionRecord,
} from '../../store/slices/placementPredictionSlice';
import toast from 'react-hot-toast';

// ── Confirmation Dialog ──
const ConfirmDialog: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    onOk: () => void;
    onCancel: () => void;
}> = ({ isOpen, title, message, onOk, onCancel }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300">
                            Cancel
                        </button>
                        <button onClick={onOk} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                            OK
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ── Main Page ──
const PlacementPredictions: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { predictionList, isLoading } = useSelector(
        (state: RootState) => state.placementPrediction
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Load predictions on mount
    useEffect(() => {
        dispatch(fetchAllPredictions());
    }, [dispatch]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                dispatch(searchPredictions(searchQuery.trim()));
            } else {
                dispatch(fetchAllPredictions());
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, dispatch]);

    // Generate predictions from student data
    const handleGenerate = () => setShowConfirm(true);

    const confirmGenerate = async () => {
        setShowConfirm(false);
        try {
            await dispatch(generatePredictions()).unwrap();
            toast.success('Predictions generated from student data successfully!');
        } catch (err: any) {
            toast.error(err || 'Failed to generate predictions');
        }
    };

    // Summary stats
    const totalStudents = predictionList.length;
    const highRisk = predictionList.filter((p) => p.riskLevel === 'High').length;
    const mediumRisk = predictionList.filter((p) => p.riskLevel === 'Medium').length;
    const lowRisk = predictionList.filter((p) => p.riskLevel === 'Low').length;
    const avgProbability = totalStudents > 0
        ? Math.round(predictionList.reduce((sum, p) => sum + p.placementProbability, 0) / totalStudents)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-light">Placement Predictions</h1>
                    <p className="text-light-400 mt-1">
                        Auto-generated placement probability estimates based on student CGPA, resume scores, interview performance, and skills
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="btn-primary px-5 py-2.5 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                            <BoltIcon className="w-4 h-4" />
                        )}
                        {isLoading ? 'Calculating…' : 'Generate Predictions'}
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4"
            >
                <div className="card-dark text-center">
                    <p className="text-2xl font-bold text-light">{totalStudents}</p>
                    <p className="text-xs text-light-400 mt-1">Total Students</p>
                </div>
                <div className="card-dark text-center">
                    <p className="text-2xl font-bold text-light">{avgProbability}%</p>
                    <p className="text-xs text-light-400 mt-1">Avg. Probability</p>
                </div>
                <div className="card-dark text-center">
                    <p className="text-2xl font-bold text-green-500">{lowRisk}</p>
                    <p className="text-xs text-light-400 mt-1">Low Risk</p>
                </div>
                <div className="card-dark text-center">
                    <p className="text-2xl font-bold text-yellow-500">{mediumRisk}</p>
                    <p className="text-xs text-light-400 mt-1">Medium Risk</p>
                </div>
                <div className="card-dark text-center">
                    <p className="text-2xl font-bold text-red-500">{highRisk}</p>
                    <p className="text-xs text-light-400 mt-1">High Risk</p>
                </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-light-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student email or name…"
                    className="input w-full pl-10"
                />
            </motion.div>

            {/* Predictions Data Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-dark overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-light">Prediction Results</h2>
                        <p className="text-xs text-light-400 mt-0.5">
                            Formula: CGPA×8 + ResumeScore×0.3 + InterviewScore×0.4 + Skills×2 (capped at 100%)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-light-400">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{predictionList.length} records</span>
                    </div>
                </div>

                {isLoading && predictionList.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-2 border-steel border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-light-400 text-sm">Calculating predictions…</p>
                    </div>
                ) : predictionList.length === 0 ? (
                    <div className="text-center py-12">
                        <ChartBarIcon className="w-12 h-12 text-light-400 mx-auto mb-3 opacity-50" />
                        <p className="text-light-400 mb-2">No predictions yet.</p>
                        <p className="text-light-400 text-sm">
                            Click <strong>"Generate Predictions"</strong> to auto-calculate placement probabilities from student data in the database.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-5 md:-mx-6">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="border-b-2 border-surface-300 bg-surface-200">
                                    {['Student', 'Email', 'Dept', 'Batch', 'CGPA', 'Resume', 'Interview', 'Skills', 'Probability', 'Risk Level', 'Est. Package', 'Recommendations'].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-3 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {predictionList.map((record, idx) => (
                                    <motion.tr
                                        key={record._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors"
                                    >
                                        <td className="px-3 py-3 text-sm text-light font-medium whitespace-nowrap">{record.studentName}</td>
                                        <td className="px-3 py-3 text-sm text-light-400 whitespace-nowrap">{record.email}</td>
                                        <td className="px-3 py-3">
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{record.department}</span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-light-400">{record.batch}</td>
                                        <td className="px-3 py-3 text-sm text-light-400">{record.cgpa}</td>
                                        <td className="px-3 py-3">
                                            <span className={`text-sm font-medium ${record.resumeScore >= 70 ? 'text-green-600' : record.resumeScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                {record.resumeScore}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`text-sm font-medium ${record.interviewScore >= 70 ? 'text-green-600' : record.interviewScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                {record.interviewScore}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-light-400">{record.skillCount}</td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${record.placementProbability >= 70 ? 'bg-green-100 text-green-700' : record.placementProbability >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {record.placementProbability}%
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${record.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : record.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {record.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-light-400">{record.predictedPackage} LPA</td>
                                        <td className="px-3 py-3 text-xs text-light-400 max-w-[200px] truncate" title={record.recommendations}>
                                            {record.recommendations}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                title="Generate Predictions"
                message="This will auto-calculate placement probability for all students in the database using their CGPA, resume score, interview performance, and skill count. Existing predictions will be refreshed. Continue?"
                onOk={confirmGenerate}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
};

export default PlacementPredictions;
