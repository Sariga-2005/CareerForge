import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ResumeUpload from './pages/student/ResumeUpload';
import ResumeAnalysis from './pages/student/ResumeAnalysis';
import MockInterview from './pages/student/MockInterview';
import InterviewHistory from './pages/student/InterviewHistory';
import JobMatches from './pages/student/JobMatches';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BatchAnalytics from './pages/admin/BatchAnalytics';
import StudentManagement from './pages/admin/StudentManagement';
import JobManagement from './pages/admin/JobManagement';
import AlumniEngagement from './pages/admin/AlumniEngagement';
import PlacementReports from './pages/admin/PlacementReports';
import SystemSettings from './pages/admin/SystemSettings';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import ReferralRequests from './pages/alumni/ReferralRequests';
import MentorshipPage from './pages/alumni/MentorshipPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'alumni':
        return <Navigate to="/alumni/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Student Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/resume/upload" element={<ResumeUpload />} />
        <Route path="/student/resume/analysis" element={<ResumeAnalysis />} />
        <Route path="/student/interview" element={<MockInterview />} />
        <Route path="/student/interview/history" element={<InterviewHistory />} />
        <Route path="/student/jobs" element={<JobMatches />} />
        <Route path="/student/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<BatchAnalytics />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/jobs" element={<JobManagement />} />
        <Route path="/admin/alumni" element={<AlumniEngagement />} />
        <Route path="/admin/reports" element={<PlacementReports />} />
        <Route path="/admin/settings" element={<SystemSettings />} />
      </Route>

      {/* Alumni Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['alumni']}>
            <DashboardLayout role="alumni" />
          </ProtectedRoute>
        }
      >
        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
        <Route path="/alumni/referrals" element={<ReferralRequests />} />
        <Route path="/alumni/mentorship" element={<MentorshipPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
