import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  VideoCameraIcon,
  ClockIcon,
  BriefcaseIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  AcademicCapIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../store/slices/authSlice';
import { markNotificationRead, markAllNotificationsRead } from '../store/slices/uiSlice';
import { socketService } from '../services/socket/socketService';
import { AppDispatch, RootState } from '../store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  role?: 'student' | 'admin' | 'alumni';
}

const studentNavItems: NavItem[] = [
  { path: '/student/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/student/resume/upload', label: 'Upload Resume', icon: DocumentTextIcon },
  { path: '/student/resume/analysis', label: 'Resume Analysis', icon: DocumentMagnifyingGlassIcon },
  { path: '/student/interview', label: 'Mock Interview', icon: VideoCameraIcon },
  { path: '/student/interview/history', label: 'Interview History', icon: ClockIcon },
  { path: '/student/jobs', label: 'Placement Drives', icon: BriefcaseIcon },
  { path: '/student/career', label: 'Career Advisor', icon: SparklesIcon },
  { path: '/student/headhunter', label: 'Headhunter', icon: MegaphoneIcon },
  { path: '/student/profile', label: 'Profile', icon: UserIcon },
];

const adminNavItems: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/admin/analytics', label: 'Batch Analytics', icon: ChartBarIcon },
  { path: '/admin/students', label: 'Student Management', icon: UsersIcon },
  { path: '/admin/jobs', label: 'Job Management', icon: BriefcaseIcon },
  { path: '/admin/alumni', label: 'Alumni Engagement', icon: UserGroupIcon },
  { path: '/admin/reports', label: 'Placement Reports', icon: DocumentChartBarIcon },
  { path: '/admin/predictions', label: 'Placement Predictions', icon: ChartBarIcon },
  { path: '/admin/settings', label: 'System Settings', icon: Cog6ToothIcon },
];

const alumniNavItems: NavItem[] = [
  { path: '/alumni/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/alumni/referrals', label: 'Referral Requests', icon: BriefcaseIcon },
  { path: '/alumni/mentorship', label: 'Mentorship', icon: AcademicCapIcon },
];

const navItemsByRole: Record<string, NavItem[]> = {
  student: studentNavItems,
  admin: adminNavItems,
  alumni: alumniNavItems,
};

const portalLabels: Record<string, string> = {
  student: 'Student Portal',
  admin: 'Admin Portal',
  alumni: 'Alumni Portal',
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role = 'student' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.ui);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = navItemsByRole[role] || studentNavItems;
  const portalLabel = portalLabels[role] || 'Student Portal';
  const homePath = `/${role}/dashboard`;

  // Get page title based on route
  const getPageTitle = () => {
    const item = navItems.find((item) => item.path === location.pathname);
    if (item) return item.label;
    // Sub-routes inside Mock Interview module
    if (location.pathname.startsWith('/student/interview')) return 'Mock Interview';
    return 'Dashboard';
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Connect to real-time WebSocket for notifications
  useEffect(() => {
    socketService.connect();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-200">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex fixed z-50 h-screen bg-white border-r-2 border-surface-300 flex-col shadow-soft"
      >
        {/* Logo */}
        <div className="p-6 border-b-2 border-surface-300">
          <Link to={homePath} className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="CareerForge"
                className="w-11 h-11 object-contain"
              />
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-bold text-xl text-primary">CareerForge</h1>
                  <p className="text-xs text-text-muted">{portalLabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.path === '/student/interview'
                ? location.pathname.startsWith('/student/interview') && !location.pathname.includes('/history')
                : location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
                        : 'text-text-secondary hover:bg-secondary/10 hover:text-secondary-600'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-secondary-500'}`} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && sidebarOpen && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t-2 border-surface-300">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
              {user?.firstName?.charAt(0) || 'S'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-text-primary truncate text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {sidebarOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors font-medium text-sm border-2 border-error/20"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </motion.button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 280 : 80 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-surface-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Toggle sidebar button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-200 text-text-secondary transition-colors"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-200 text-text-secondary transition-colors"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-text-primary">{getPageTitle()}</h1>
                <p className="text-sm text-text-muted">Welcome back, {user?.firstName || 'Student'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Menu as="div" className="relative">
                <Menu.Button as={motion.button}
                  className="relative w-10 h-10 rounded-xl hover:bg-surface-200 flex items-center justify-center text-text-secondary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse" />
                  )}
                </Menu.Button>
                <Transition
                  as={React.Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                    <div className="p-4 border-b border-surface-200 flex justify-between items-center">
                      <h3 className="font-bold text-text-primary">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(markAllNotificationsRead());
                          }}
                          className="text-xs text-primary hover:text-primary-600 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-text-muted text-sm relative z-50 bg-white">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  dispatch(markNotificationRead(notification.id));
                                }}
                                className={`w-full text-left p-4 border-b border-surface-100 flex items-start gap-3 transition-colors ${
                                  active ? 'bg-surface-50' : ''
                                } ${!notification.read ? 'bg-primary/5' : ''}`}
                              >
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  !notification.read ? 'bg-primary' : 'bg-transparent'
                                }`} />
                                <div>
                                  <p className={`text-sm ${!notification.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1">
                                    {new Date(notification.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </button>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Settings */}
              <motion.button
                className="w-10 h-10 rounded-xl hover:bg-surface-200 flex items-center justify-center text-text-secondary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </motion.button>

              {/* Profile quick access */}
              <Link to={`/${role}/profile`}>
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user?.firstName?.charAt(0) || 'S'}
                </motion.div>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-primary/40 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 border-r-2 border-surface-300 shadow-modal flex flex-col"
              >
                {/* Mobile Logo */}
                <div className="p-6 border-b-2 border-surface-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="CareerForge" className="w-10 h-10 object-contain" />
                    <div>
                      <h1 className="font-bold text-lg text-primary">CareerForge</h1>
                      <p className="text-xs text-text-muted">{portalLabel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center"
                  >
                    <XMarkIcon className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>

                {/* Mobile Nav */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = item.path === '/student/interview'
                        ? location.pathname.startsWith('/student/interview') && !location.pathname.includes('/history')
                        : location.pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                              ${isActive
                                ? 'bg-primary text-white shadow-lg font-semibold'
                                : 'text-text-secondary hover:bg-secondary/10'
                              }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Mobile User Section */}
                <div className="p-4 border-t-2 border-surface-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary-500 flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 text-error font-medium text-sm border-2 border-error/20"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t-2 border-surface-300 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
            <p>© 2026 CareerForge. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
