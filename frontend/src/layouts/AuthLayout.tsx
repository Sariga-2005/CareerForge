import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Professional Branding Panel */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-500 to-secondary-600" />

        {/* Subtle decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          {/* Header with Back to Home */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="CareerForge" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-2xl font-bold text-white">CareerForge</h1>
                  <p className="text-white/70 text-sm">From Resume to Offer Letter</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 border border-white/20 backdrop-blur-sm group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </motion.div>
          </div>

          {/* Main slogan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <SparklesIcon className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Placements</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your Career Journey<br />
              <span className="text-secondary-200">Starts Here</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md mx-auto">
              Join thousands of students who've landed their dream jobs with CareerForge
            </p>
          </motion.div>

          {/* Features - Professional icons instead of emojis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-3"
          >
            <FeatureItem
              icon={CpuChipIcon}
              title="AI-Powered Screening"
              description="Semantic resume analysis with BERT-based matching"
              delay={0.6}
            />
            <FeatureItem
              icon={ChatBubbleLeftRightIcon}
              title="Adaptive Interviews"
              description="GPT-4o powered interviews that adapt to your responses"
              delay={0.7}
            />
            <FeatureItem
              icon={ChartBarIcon}
              title="Real-time Analytics"
              description="Track your placement readiness with live dashboards"
              delay={0.8}
            />
            <FeatureItem
              icon={UserGroupIcon}
              title="Alumni Network"
              description="Connect with industry professionals for referrals"
              delay={0.9}
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-white/50 text-sm flex items-center justify-between"
          >
            <span>© 2026 CareerForge</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Help</a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gradient-mesh min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 flex items-center justify-between border-b border-surface-300 bg-white">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CareerForge" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gradient">CareerForge</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-secondary hover:text-primary text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="hidden lg:block p-6 text-center border-t border-surface-300 bg-white/50">
          <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <span>500+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature item component with professional icons
const FeatureItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300 group"
  >
    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  </motion.div>
);

export default AuthLayout;
