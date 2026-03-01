import React from 'react';
import { motion } from 'framer-motion';
import InterviewModuleTabs from './InterviewModuleTabs';

/* ─── Sample Data ──────────────────────────────────────────── */

const interviewsData = [
    { id: 'INT-001', userId: 'USR-042', type: 'Technical', difficulty: 'Hard', duration: 45, status: 'Completed', scheduledAt: '2026-02-28', createdAt: '2026-02-27' },
    { id: 'INT-002', userId: 'USR-015', type: 'Behavioral', difficulty: 'Easy', duration: 30, status: 'Completed', scheduledAt: '2026-02-28', createdAt: '2026-02-27' },
    { id: 'INT-003', userId: 'USR-042', type: 'System Design', difficulty: 'Hard', duration: 60, status: 'In Progress', scheduledAt: '2026-03-01', createdAt: '2026-02-28' },
    { id: 'INT-004', userId: 'USR-078', type: 'HR', difficulty: 'Medium', duration: 30, status: 'Scheduled', scheduledAt: '2026-03-02', createdAt: '2026-03-01' },
    { id: 'INT-005', userId: 'USR-023', type: 'Technical', difficulty: 'Medium', duration: 45, status: 'Completed', scheduledAt: '2026-02-25', createdAt: '2026-02-24' },
];

const questionsData = [
    { id: 'Q-001', interviewId: 'INT-001', text: 'Explain React virtual DOM and reconciliation', category: 'Frontend', difficulty: 'Hard', timeLimit: 180 },
    { id: 'Q-002', interviewId: 'INT-001', text: 'What is the difference between useEffect and useLayoutEffect?', category: 'React Hooks', difficulty: 'Medium', timeLimit: 120 },
    { id: 'Q-003', interviewId: 'INT-002', text: 'Describe a time you handled conflict in a team', category: 'Teamwork', difficulty: 'Easy', timeLimit: 180 },
    { id: 'Q-004', interviewId: 'INT-003', text: 'Design a URL shortener system', category: 'System Design', difficulty: 'Hard', timeLimit: 600 },
    { id: 'Q-005', interviewId: 'INT-005', text: 'Implement a binary search tree in Python', category: 'DSA', difficulty: 'Medium', timeLimit: 300 },
];

const responsesData = [
    { id: 'R-001', questionId: 'Q-001', transcript: 'Virtual DOM is a lightweight copy of the actual DOM...', audioPath: '/audio/r001.webm', duration: 145, timestamp: '2026-02-28 10:05:23' },
    { id: 'R-002', questionId: 'Q-002', transcript: 'useEffect runs asynchronously after paint while...', audioPath: '/audio/r002.webm', duration: 98, timestamp: '2026-02-28 10:08:41' },
    { id: 'R-003', questionId: 'Q-003', transcript: 'In my previous project, there was a disagreement...', audioPath: '/audio/r003.webm', duration: 162, timestamp: '2026-02-28 11:15:08' },
    { id: 'R-004', questionId: 'Q-005', transcript: 'I would start by defining a Node class with left...', audioPath: '/audio/r004.webm', duration: 230, timestamp: '2026-02-25 14:22:17' },
];

const scoresData = [
    { id: 'S-001', interviewId: 'INT-001', confidence: 82, clarity: 88, relevance: 90, technicalAccuracy: 85, totalScore: 86, grade: 'A' },
    { id: 'S-002', interviewId: 'INT-002', confidence: 75, clarity: 80, relevance: 85, technicalAccuracy: null, totalScore: 80, grade: 'B+' },
    { id: 'S-003', interviewId: 'INT-005', confidence: 70, clarity: 75, relevance: 78, technicalAccuracy: 72, totalScore: 74, grade: 'B' },
];

const transcriptsData = [
    { id: 'T-001', interviewId: 'INT-001', questionId: 'Q-001', rawText: 'virtual dom is a lightweight copy of the actual dom...', processedText: 'Virtual DOM is a lightweight copy of the actual DOM...', language: 'en', createdAt: '2026-02-28 10:05:23' },
    { id: 'T-002', interviewId: 'INT-001', questionId: 'Q-002', rawText: 'use effect runs asynchronously after paint while...', processedText: 'useEffect runs asynchronously after paint while...', language: 'en', createdAt: '2026-02-28 10:08:41' },
    { id: 'T-003', interviewId: 'INT-002', questionId: 'Q-003', rawText: 'in my previous project there was a disagreement...', processedText: 'In my previous project, there was a disagreement...', language: 'en', createdAt: '2026-02-28 11:15:08' },
    { id: 'T-004', interviewId: 'INT-005', questionId: 'Q-005', rawText: 'i would start by defining a node class with left...', processedText: 'I would start by defining a Node class with left...', language: 'en', createdAt: '2026-02-25 14:22:17' },
];

/* ─── Helpers ──────────────────────────────────────────────── */

const statusColor = (s: string) => {
    if (s === 'Completed') return 'bg-emerald-100 text-emerald-700';
    if (s === 'In Progress') return 'bg-amber-100 text-amber-700';
    if (s === 'Scheduled') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
};

const diffColor = (d: string) => {
    if (d === 'Easy') return 'bg-emerald-100 text-emerald-700';
    if (d === 'Medium') return 'bg-amber-100 text-amber-700';
    if (d === 'Hard') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
};

const gradeColor = (g: string) => {
    if (g.startsWith('A')) return 'text-emerald-600 font-bold';
    if (g.startsWith('B')) return 'text-blue-600 font-bold';
    return 'text-amber-600 font-bold';
};

const Badge: React.FC<{ text: string; className: string }> = ({ text, className }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{text}</span>
);

/* ─── Table Component ──────────────────────────────────────── */

interface TableSectionProps {
    title: string;
    subtitle: string;
    headers: string[];
    children: React.ReactNode;
    delay?: number;
}

const TableSection: React.FC<TableSectionProps> = ({ title, subtitle, headers, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-2xl border-2 border-surface-300 shadow-soft overflow-hidden"
    >
        <div className="px-6 py-4 border-b-2 border-surface-300">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-surface-200">
                        {headers.map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-300">
                    {children}
                </tbody>
            </table>
        </div>
    </motion.div>
);

/* ─── Main Component ───────────────────────────────────────── */

const InterviewDataTables: React.FC = () => {
    return (
        <div className="w-full max-w-full overflow-hidden space-y-8 pb-12">
            <InterviewModuleTabs />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold text-text-primary mb-1">Interview Data Tables</h1>
                <p className="text-text-muted">Visual representation of all tables in the Adaptive Interviewer module</p>
            </motion.div>

            {/* ── 1. Interviews Table ──────────────────────────────── */}
            <TableSection title="Interviews" subtitle="Interview session details" headers={['ID', 'User ID', 'Type', 'Difficulty', 'Duration', 'Status', 'Scheduled', 'Created']} delay={0.05}>
                {interviewsData.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.userId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><Badge text={r.difficulty} className={diffColor(r.difficulty)} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.duration} min</td>
                        <td className="px-4 py-3 whitespace-nowrap"><Badge text={r.status} className={statusColor(r.status)} /></td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.scheduledAt}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.createdAt}</td>
                    </tr>
                ))}
            </TableSection>

            {/* ── 2. Interview Questions Table ─────────────────────── */}
            <TableSection title="Interview_Questions" subtitle="AI-generated questions" headers={['ID', 'Interview ID', 'Question Text', 'Category', 'Difficulty', 'Time Limit']} delay={0.1}>
                {questionsData.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.interviewId}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{r.text}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><Badge text={r.category} className="bg-indigo-100 text-indigo-700" /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><Badge text={r.difficulty} className={diffColor(r.difficulty)} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.timeLimit}s</td>
                    </tr>
                ))}
            </TableSection>

            {/* ── 3. Interview Responses Table ──────────────────────── */}
            <TableSection title="Interview_Responses" subtitle="Student answers (text/audio)" headers={['ID', 'Question ID', 'Transcript', 'Audio Path', 'Duration', 'Timestamp']} delay={0.15}>
                {responsesData.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.questionId}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{r.transcript}</td>
                        <td className="px-4 py-3 text-text-muted whitespace-nowrap text-xs">{r.audioPath}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.duration}s</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">{r.timestamp}</td>
                    </tr>
                ))}
            </TableSection>

            {/* ── 4. Interview Scores Table ─────────────────────────── */}
            <TableSection title="Interview_Scores" subtitle="Confidence, fluency, technical score" headers={['ID', 'Interview ID', 'Confidence', 'Clarity', 'Relevance', 'Technical', 'Total', 'Grade']} delay={0.2}>
                {scoresData.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.interviewId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.confidence}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.clarity}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.relevance}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.technicalAccuracy !== null ? `${r.technicalAccuracy}%` : '—'}</td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">{r.totalScore}%</td>
                        <td className={`px-4 py-3 whitespace-nowrap ${gradeColor(r.grade)}`}>{r.grade}</td>
                    </tr>
                ))}
            </TableSection>

            {/* ── 5. Speech Transcripts Table ───────────────────────── */}
            <TableSection title="Speech_Transcripts" subtitle="Whisper AI transcription results" headers={['ID', 'Interview ID', 'Question ID', 'Raw Text', 'Processed Text', 'Language', 'Created']} delay={0.25}>
                {transcriptsData.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.interviewId}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{r.questionId}</td>
                        <td className="px-4 py-3 max-w-[150px] truncate text-text-muted italic">{r.rawText}</td>
                        <td className="px-4 py-3 max-w-[150px] truncate">{r.processedText}</td>
                        <td className="px-4 py-3 whitespace-nowrap uppercase font-semibold text-xs">{r.language}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">{r.createdAt}</td>
                    </tr>
                ))}
            </TableSection>
        </div>
    );
};

export default InterviewDataTables;
