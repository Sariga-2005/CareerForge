import React, { useEffect } from 'react';
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
        backgroundColor: [
          '#3A6EA5',
          '#5DA9E9',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
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
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#A2A5AA',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#A2A5AA',
        },
      },
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
          <h1 className="text-2xl md:text-3xl font-bold text-light">
            Admin Dashboard
          </h1>
          <p className="text-light-400 mt-1">
            Welcome back, {user?.firstName}! Here's your placement overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-light-400">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
          <button className="btn-primary btn-sm">
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UsersIcon}
          label="Total Students"
          value={metrics?.totalStudents || 1250}
          change="+12% from last batch"
          trend="up"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Placed"
          value={metrics?.totalPlaced || 892}
          change={`${((metrics?.overallPlacementRate || 71.4)).toFixed(1)}% placement rate`}
          trend="up"
        />
        <StatCard
          icon={BriefcaseIcon}
          label="Active Jobs"
          value={metrics?.activeJobs || 45}
          change="+8 new this week"
          trend="up"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Alumni Engaged"
          value={metrics?.alumniEngaged || 156}
          change="23 referrals made"
          trend="up"
        />
      </div>

      {/* Main Charts */}
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
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#A2A5AA',
                      usePointStyle: true,
                      padding: 15,
                    },
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">Student Readiness</h3>
          <div className="space-y-4">
            <ReadinessBar
              label="Placement Ready"
              value={studentAnalytics?.placementReady || 420}
              total={metrics?.totalStudents || 1250}
              color="bg-success"
            />
            <ReadinessBar
              label="Needs Improvement"
              value={studentAnalytics?.needsImprovement || 580}
              total={metrics?.totalStudents || 1250}
              color="bg-warning"
            />
            <ReadinessBar
              label="At Risk"
              value={studentAnalytics?.atRisk || 250}
              total={metrics?.totalStudents || 1250}
              color="bg-error"
            />
          </div>
        </motion.div>

        {/* Skill Gap Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light">Skill Gap Analysis</h3>
            <span className="text-sm text-light-400">Students lacking skills</span>
          </div>
          <div className="h-48">
            <Bar data={skillGapData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-dark"
        >
          <h3 className="text-lg font-semibold text-light mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              icon={AcademicCapIcon}
              title="New student registered"
              description="John Doe joined CSE 2026 batch"
              time="2 mins ago"
            />
            <ActivityItem
              icon={ChartBarIcon}
              title="Resume analyzed"
              description="AI scored resume 85/100"
              time="5 mins ago"
            />
            <ActivityItem
              icon={BriefcaseIcon}
              title="Job posted"
              description="Google - SDE Intern position"
              time="15 mins ago"
            />
            <ActivityItem
              icon={CheckCircleIcon}
              title="Placement confirmed"
              description="Jane Smith placed at Microsoft"
              time="1 hour ago"
            />
          </div>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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

// Sub-components
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card-dark"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-steel/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-steel" />
      </div>
      <ArrowTrendingUpIcon className={`w-5 h-5 ${trend === 'up' ? 'text-success' : 'text-error'}`} />
    </div>
    <p className="text-2xl font-bold text-light">{value.toLocaleString()}</p>
    <p className="text-sm text-light-400 mt-1">{label}</p>
    <p className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-error'}`}>
      {change}
    </p>
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
