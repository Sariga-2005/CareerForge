import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardMetrics, fetchStudentAnalytics } from '../../store/slices/analyticsSlice';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ── Detailed mock data for tables ──
const studentReadinessData = [
  { id: 'STU001', name: 'Aarav Patel', department: 'CSE', batch: '2024-25', cgpa: 8.9, resumeScore: 88, interviewScore: 82, readinessScore: 86, status: 'Ready' },
  { id: 'STU002', name: 'Priya Sharma', department: 'ECE', batch: '2024-25', cgpa: 7.4, resumeScore: 65, interviewScore: 58, readinessScore: 62, status: 'Needs Improvement' },
  { id: 'STU003', name: 'Rahul Kumar', department: 'CSE', batch: '2024-25', cgpa: 9.1, resumeScore: 92, interviewScore: 88, readinessScore: 90, status: 'Ready' },
  { id: 'STU004', name: 'Sneha Reddy', department: 'IT', batch: '2024-25', cgpa: 6.2, resumeScore: 45, interviewScore: 40, readinessScore: 42, status: 'At Risk' },
  { id: 'STU005', name: 'Vikram Singh', department: 'MECH', batch: '2024-25', cgpa: 7.8, resumeScore: 72, interviewScore: 68, readinessScore: 70, status: 'Ready' },
  { id: 'STU006', name: 'Ananya Iyer', department: 'CSE', batch: '2024-25', cgpa: 5.8, resumeScore: 38, interviewScore: 32, readinessScore: 35, status: 'At Risk' },
  { id: 'STU007', name: 'Karthik Nair', department: 'ECE', batch: '2024-25', cgpa: 8.3, resumeScore: 78, interviewScore: 75, readinessScore: 77, status: 'Ready' },
  { id: 'STU008', name: 'Megha Das', department: 'EEE', batch: '2024-25', cgpa: 7.0, resumeScore: 55, interviewScore: 50, readinessScore: 52, status: 'Needs Improvement' },
];

const skillGapTableData = [
  { skill: 'Python', lacking: 45, total: 1250, priority: 'High', category: 'Programming', recommendation: 'Complete Python for Data Science course' },
  { skill: 'React', lacking: 62, total: 1250, priority: 'High', category: 'Frontend', recommendation: 'Build 2-3 React projects with Redux' },
  { skill: 'SQL', lacking: 38, total: 1250, priority: 'Medium', category: 'Database', recommendation: 'Practice SQL queries on LeetCode' },
  { skill: 'AWS', lacking: 72, total: 1250, priority: 'High', category: 'Cloud', recommendation: 'Get AWS Cloud Practitioner certified' },
  { skill: 'Docker', lacking: 85, total: 1250, priority: 'High', category: 'DevOps', recommendation: 'Complete Docker containerization workshop' },
  { skill: 'Machine Learning', lacking: 55, total: 1250, priority: 'Medium', category: 'AI/ML', recommendation: 'Finish Andrew Ng ML course on Coursera' },
  { skill: 'System Design', lacking: 90, total: 1250, priority: 'High', category: 'Architecture', recommendation: 'Study system design patterns and case studies' },
  { skill: 'Git', lacking: 22, total: 1250, priority: 'Low', category: 'Tools', recommendation: 'Practice Git branching workflows' },
];

const batchStatsData = [
  { batch: '2024-25', department: 'CSE', total: 240, placed: 205, avgCgpa: 8.2, placementRate: 85.4, avgPackage: 12.5 },
  { batch: '2024-25', department: 'ECE', total: 180, placed: 130, avgCgpa: 7.8, placementRate: 72.2, avgPackage: 9.8 },
  { batch: '2024-25', department: 'IT', total: 200, placed: 156, avgCgpa: 7.9, placementRate: 78.0, avgPackage: 10.2 },
  { batch: '2024-25', department: 'EEE', total: 150, placed: 98, avgCgpa: 7.5, placementRate: 65.3, avgPackage: 8.5 },
  { batch: '2024-25', department: 'MECH', total: 280, placed: 126, avgCgpa: 7.1, placementRate: 45.0, avgPackage: 6.8 },
  { batch: '2024-25', department: 'CIVIL', total: 200, placed: 70, avgCgpa: 7.0, placementRate: 35.0, avgPackage: 5.5 },
  { batch: '2023-24', department: 'CSE', total: 220, placed: 198, avgCgpa: 8.0, placementRate: 90.0, avgPackage: 11.8 },
  { batch: '2023-24', department: 'ECE', total: 170, placed: 136, avgCgpa: 7.6, placementRate: 80.0, avgPackage: 9.2 },
];

const dashboardMetricsData = [
  { metric: 'Total Students', value: '1,250', change: '+12%', period: 'vs last batch', source: 'User Collection', lastUpdated: '2 min ago' },
  { metric: 'Placed Students', value: '892', change: '+8%', period: 'vs last batch', source: 'User Collection', lastUpdated: '2 min ago' },
  { metric: 'Placement Rate', value: '71.4%', change: '+3.2%', period: 'vs last batch', source: 'Computed', lastUpdated: '2 min ago' },
  { metric: 'Active Jobs', value: '45', change: '+8', period: 'this week', source: 'Job Collection', lastUpdated: '5 min ago' },
  { metric: 'Alumni Engaged', value: '156', change: '+15', period: 'this month', source: 'User Collection', lastUpdated: '10 min ago' },
  { metric: 'Avg. Package (LPA)', value: '₹9.8', change: '+₹1.2', period: 'vs last year', source: 'Computed', lastUpdated: '1 hour ago' },
  { metric: 'Resume Uploads', value: '1,180', change: '+45', period: 'this week', source: 'Resume Collection', lastUpdated: '3 min ago' },
  { metric: 'Mock Interviews', value: '3,420', change: '+280', period: 'this month', source: 'Interview Collection', lastUpdated: '8 min ago' },
  { metric: 'Avg. Resume Score', value: '72/100', change: '+4', period: 'vs last month', source: 'Computed', lastUpdated: '15 min ago' },
  { metric: 'Redis Cache Hits', value: '94.2%', change: '+1.5%', period: 'today', source: 'Redis Cache', lastUpdated: 'Just now' },
];

// ── Collapsible Table Section Component ──
const CollapsibleTable: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-5 border-t border-surface-300 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left text-sm font-semibold text-steel hover:text-accent transition-colors"
      >
        {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        {title}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

// ── Main Dashboard ──
const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { metrics, studentAnalytics, isLoading } = useSelector(
    (state: RootState) => state.analytics
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchStudentAnalytics());
  }, [dispatch]);

  // Chart data
  const placementTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Placements',
        data: [12, 19, 25, 35, 45, 52],
        borderColor: '#5DA9E9',
        backgroundColor: 'rgba(93, 169, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const departmentData = {
    labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
    datasets: [
      {
        data: [85, 72, 65, 45, 35, 78],
        backgroundColor: ['#3A6EA5', '#5DA9E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  const skillGapData = {
    labels: ['Python', 'React', 'SQL', 'AWS', 'Docker', 'ML'],
    datasets: [
      {
        label: 'Students Lacking',
        data: [45, 62, 38, 72, 85, 55],
        backgroundColor: '#3A6EA5',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#A2A5AA' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#A2A5AA' } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-light">Admin Dashboard</h1>
          <p className="text-light-400 mt-1">
            Welcome back, {user?.firstName}! Here's your placement overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-light-400">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
          <button className="btn-primary btn-sm">Generate Report</button>
        </div>
      </motion.div>

      {/* ═══════════════════ DASHBOARD METRICS TABLE ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-dark"
      >
        <h3 className="text-lg font-semibold text-light mb-1">Dashboard Metrics</h3>
        <p className="text-xs text-light-400 mb-4">Cached data for fast dashboard loading (Redis TTL: 300s)</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          <StatCard icon={UsersIcon} label="Total Students" value={metrics?.totalStudents || 1250} change="+12% from last batch" trend="up" />
          <StatCard icon={CheckCircleIcon} label="Placed" value={metrics?.totalPlaced || 892} change={`${(metrics?.overallPlacementRate || 71.4).toFixed(1)}% placement rate`} trend="up" />
          <StatCard icon={BriefcaseIcon} label="Active Jobs" value={metrics?.activeJobs || 45} change="+8 new this week" trend="up" />
          <StatCard icon={UserGroupIcon} label="Alumni Engaged" value={metrics?.alumniEngaged || 156} change="23 referrals made" trend="up" />
        </div>

        <CollapsibleTable title="View Detailed Dashboard Metrics Table" defaultOpen={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-surface-300 bg-surface-200">
                  {['Metric', 'Value', 'Change', 'Period', 'Data Source', 'Last Updated'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardMetricsData.map((row, idx) => (
                  <tr key={idx} className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-light font-medium">{row.metric}</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-light">{row.value}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">{row.change}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-light-400">{row.period}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{row.source}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-light-400">{row.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleTable>
      </motion.div>

      {/* ═══════════════════ BATCH STATISTICS ═══════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placement Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light">Placement Trend</h3>
            <select className="input bg-charcoal text-sm py-1 px-3 w-auto">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={placementTrendData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">By Department</h3>
          <div className="h-48">
            <Doughnut
              data={departmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#A2A5AA', usePointStyle: true, padding: 15 } },
                },
                cutout: '60%',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Batch Statistics Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-dark"
      >
        <h3 className="text-lg font-semibold text-light mb-1">Batch Statistics</h3>
        <p className="text-xs text-light-400 mb-4">Department &amp; batch analytics — placement rates, CGPA, and package data</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-surface-300 bg-surface-200">
                {['Batch', 'Department', 'Total Students', 'Placed', 'Placement Rate', 'Avg CGPA', 'Avg Package (LPA)'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batchStatsData.map((row, idx) => (
                <tr key={idx} className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-light font-medium">{row.batch}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{row.department}</span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-light-400">{row.total}</td>
                  <td className="px-4 py-2.5 text-sm text-light-400">{row.placed}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${row.placementRate >= 70 ? 'bg-green-100 text-green-700' : row.placementRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {row.placementRate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-light-400">{row.avgCgpa}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-light">₹{row.avgPackage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══════════════════ STUDENT READINESS ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-dark"
      >
        <h3 className="text-lg font-semibold text-light mb-1">Student Readiness</h3>
        <p className="text-xs text-light-400 mb-4">Combined readiness score based on CGPA, resume, and interview performance</p>

        {/* Summary bars */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <ReadinessBar label="Placement Ready" value={studentAnalytics?.placementReady || 420} total={metrics?.totalStudents || 1250} color="bg-success" />
          <ReadinessBar label="Needs Improvement" value={studentAnalytics?.needsImprovement || 580} total={metrics?.totalStudents || 1250} color="bg-warning" />
          <ReadinessBar label="At Risk" value={studentAnalytics?.atRisk || 250} total={metrics?.totalStudents || 1250} color="bg-error" />
        </div>

        {/* Detailed student table */}
        <div className="border-t border-surface-300 pt-4">
          <h4 className="text-sm font-semibold text-steel mb-3">Detailed Student Readiness Data</h4>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-surface-300 bg-surface-200">
                  {['Student ID', 'Name', 'Dept', 'Batch', 'CGPA', 'Resume Score', 'Interview Score', 'Readiness', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentReadinessData.map((row, idx) => (
                  <tr key={idx} className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono text-light-400">{row.id}</td>
                    <td className="px-4 py-2.5 text-sm text-light font-medium">{row.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{row.department}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-light-400">{row.batch}</td>
                    <td className="px-4 py-2.5 text-sm text-light-400">{row.cgpa}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-sm font-medium ${row.resumeScore >= 70 ? 'text-green-600' : row.resumeScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {row.resumeScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-sm font-medium ${row.interviewScore >= 70 ? 'text-green-600' : row.interviewScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {row.interviewScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${row.readinessScore >= 70 ? 'bg-green-100 text-green-700' : row.readinessScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {row.readinessScore}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${row.status === 'Ready' ? 'bg-green-100 text-green-700' : row.status === 'At Risk' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════ SKILL GAP REPORTS ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-dark"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-light">Skill Gap Reports</h3>
          <span className="text-sm text-light-400">Missing skills and recommendations</span>
        </div>
        <p className="text-xs text-light-400 mb-4">Aggregated from resume analysis across all active students</p>

        {/* Chart */}
        <div className="h-48 mb-4">
          <Bar data={skillGapData} options={chartOptions} />
        </div>

        {/* Detailed table */}
        <div className="border-t border-surface-300 pt-4">
          <h4 className="text-sm font-semibold text-steel mb-3">Detailed Skill Gap Data</h4>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-surface-300 bg-surface-200">
                  {['Skill', 'Category', 'Students Lacking', '% of Total', 'Priority', 'Recommendation'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-light-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skillGapTableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-surface-300/50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-light font-medium">{row.skill}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">{row.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-bold text-light">{row.lacking}</td>
                    <td className="px-4 py-2.5 text-sm text-light-400">{((row.lacking / row.total) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${row.priority === 'High' ? 'bg-red-100 text-red-700' : row.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-light-400">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════ BOTTOM ROW ═══════════════════ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem icon={AcademicCapIcon} title="New student registered" description="John Doe joined CSE 2026 batch" time="2 mins ago" />
            <ActivityItem icon={ChartBarIcon} title="Resume analyzed" description="AI scored resume 85/100" time="5 mins ago" />
            <ActivityItem icon={BriefcaseIcon} title="Job posted" description="Google - SDE Intern position" time="15 mins ago" />
            <ActivityItem icon={CheckCircleIcon} title="Placement confirmed" description="Jane Smith placed at Microsoft" time="1 hour ago" />
          </div>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">Top Hiring Companies</h3>
          <div className="space-y-3">
            <CompanyRow company="Google" hires={24} package="₹28 LPA" />
            <CompanyRow company="Microsoft" hires={18} package="₹24 LPA" />
            <CompanyRow company="Amazon" hires={32} package="₹22 LPA" />
            <CompanyRow company="Meta" hires={8} package="₹32 LPA" />
            <CompanyRow company="Apple" hires={5} package="₹35 LPA" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Sub-components ──
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, trend }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-steel/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-steel" />
      </div>
      <ArrowTrendingUpIcon className={`w-5 h-5 ${trend === 'up' ? 'text-success' : 'text-error'}`} />
    </div>
    <p className="text-2xl font-bold text-light">{value.toLocaleString()}</p>
    <p className="text-sm text-light-400 mt-1">{label}</p>
    <p className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-error'}`}>{change}</p>
  </motion.div>
);

interface ReadinessBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const ReadinessBar: React.FC<ReadinessBarProps> = ({ label, value, total, color }) => {
  const percentage = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-light-400">{label}</span>
        <span className="text-sm font-medium text-light">{value}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon: Icon, title, description, time }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal">
    <div className="w-8 h-8 rounded-lg bg-steel/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-steel" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-light">{title}</p>
      <p className="text-xs text-light-400 truncate">{description}</p>
    </div>
    <span className="text-xs text-light-400 whitespace-nowrap">{time}</span>
  </div>
);

interface CompanyRowProps {
  company: string;
  hires: number;
  package: string;
}

const CompanyRow: React.FC<CompanyRowProps> = ({ company, hires, package: pkg }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-steel to-accent flex items-center justify-center text-white font-semibold">
        {company[0]}
      </div>
      <div>
        <p className="font-medium text-light">{company}</p>
        <p className="text-xs text-light-400">{hires} hires</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-success">{pkg}</p>
      <p className="text-xs text-light-400">avg. package</p>
    </div>
  </div>
);

export default AdminDashboard;
