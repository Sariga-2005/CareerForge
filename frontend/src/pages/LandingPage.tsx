import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  StarIcon,
  ArrowUpRightIcon,
  CpuChipIcon,
  CommandLineIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

// 3D Floating Card Component
const FloatingCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, type: 'spring', stiffness: 100 }}
      viewport={{ once: true }}
      whileHover={{
        y: -10,
        rotateY: 5,
        boxShadow: '0 30px 60px -15px rgba(30, 58, 95, 0.3)'
      }}
      className={`transform-gpu perspective-1000 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring' }}
      className="text-center"
    >
      <motion.div
        className="text-4xl sm:text-5xl font-bold text-gradient mb-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
      >
        {value}
      </motion.div>
      <div className="text-text-muted font-medium">{label}</div>
    </motion.div>
  );
};

// Animated Background Particles
const ParticleField: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-secondary-500/20"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            x: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
            y: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// Interactive 3D Logo Component
const Logo3D: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      className="relative w-24 h-24 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      animate={{ rotateY: mousePosition.x, rotateX: -mousePosition.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <img
        src="/logo.png"
        alt="CareerForge"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
      {/* Glow effect */}
      <div className="absolute inset-0 bg-secondary-500/20 blur-2xl rounded-full -z-10" />
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'AI Resume Analysis',
      description: 'Get instant feedback with our advanced AI that analyzes content, formatting, and ATS compatibility.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: AcademicCapIcon,
      title: 'Mock Interviews',
      description: 'Practice with AI-powered interviews tailored to your roles and receive detailed performance feedback.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BriefcaseIcon,
      title: 'Smart Job Matching',
      description: 'Our algorithm matches your skills and preferences with the best opportunities from top companies.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Track your progress with comprehensive analytics on your placement journey.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Alumni Network',
      description: 'Connect with successful alumni for mentorship, referrals, and industry insights.',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Decisions',
      description: 'Let our AI make intelligent decisions to optimize your placement success rate.',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const stats = [
    { value: '95%', label: 'Placement Rate' },
    { value: '500+', label: 'Partner Companies' },
    { value: '10K+', label: 'Students Placed' },
    { value: '4.9★', label: 'User Rating' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer at Google',
      image: '👩‍💻',
      quote: 'CareerForge helped me land my dream job! The AI interview practice was incredibly helpful.',
    },
    {
      name: 'Rahul Verma',
      role: 'Product Manager at Microsoft',
      image: '👨‍💼',
      quote: 'The resume analysis feature highlighted areas I never thought about. Highly recommended!',
    },
    {
      name: 'Ananya Patel',
      role: 'Data Scientist at Amazon',
      image: '👩‍🔬',
      quote: 'From resume to offer letter in just 3 weeks. CareerForge is a game changer!',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.img
                src="/logo.png"
                alt="CareerForge"
                className="h-10 w-10 object-contain"
                whileHover={{ rotate: 10, scale: 1.1 }}
              />
              <span className="text-xl font-bold text-primary">CareerForge</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-secondary hover:text-primary transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors font-medium">How it Works</a>
              <a href="#testimonials" className="text-text-secondary hover:text-primary transition-colors font-medium">Success Stories</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-text-secondary hover:text-primary transition-colors px-4 py-2 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - 3D Interactive */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        <ParticleField />

        {/* 3D Floating Elements */}
        <motion.div
          className="absolute top-40 left-10 w-20 h-20 bg-secondary-500/10 rounded-2xl"
          style={{ y: y1 }}
          animate={{
            rotate: [0, 10, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-60 right-20 w-32 h-32 bg-primary/10 rounded-full"
          style={{ y: y2 }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-pink-500/10 rounded-xl rotate-45"
          animate={{
            rotate: [45, 60, 45],
            x: [0, 20, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.div
          style={{ opacity, scale }}
          className="relative max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center bg-secondary-500/10 border border-secondary-500/30 rounded-full px-4 py-2 mb-8"
              >
                <SparklesIcon className="h-5 w-5 text-secondary-500 mr-2" />
                <span className="text-secondary-600 text-sm font-medium">AI-Powered Placement Platform</span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
                From Resume to{' '}
                <span className="text-gradient">Offer Letter</span>
                <br />
                <span className="text-primary">Autonomously</span>
              </h1>

              <p className="text-xl text-text-secondary mb-10 max-w-xl leading-relaxed">
                Transform your career journey with our AI-powered platform. Get personalized resume feedback,
                practice with intelligent mock interviews, and land your dream job.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/register"
                  className="group flex items-center btn-primary text-lg px-8 py-4 shadow-card-lg"
                >
                  Start Your Journey
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  className="flex items-center text-text-secondary hover:text-primary px-6 py-4 rounded-xl font-medium text-lg border-2 border-surface-400 hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                    <PlayIcon className="h-5 w-5 text-primary" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {['😊', '😎', '🤓', '😄'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-surface-200 border-2 border-white flex items-center justify-center text-xl">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-text-muted">Trusted by 10,000+ students</p>
                </div>
              </div>
            </motion.div>

            {/* Right - 3D Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative perspective-1000"
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div
                  className="bg-white rounded-3xl shadow-card-lg border-2 border-surface-300 p-6 transform-gpu"
                  whileHover={{ rotateY: 5, rotateX: -5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Logo3D />
                      <div>
                        <h3 className="font-bold text-text-primary">CareerForge Dashboard</h3>
                        <p className="text-sm text-text-muted">AI-Powered Insights</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-error" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>
                  </div>

                  {/* Score Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div
                      className="bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-4 text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-sm opacity-80">Resume Score</p>
                      <p className="text-3xl font-bold">94</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-2xl p-4 text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-sm opacity-80">Job Matches</p>
                      <p className="text-3xl font-bold">12</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-success to-green-600 rounded-2xl p-4 text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-sm opacity-80">Interviews</p>
                      <p className="text-3xl font-bold">5</p>
                    </motion.div>
                  </div>

                  {/* Skills Preview */}
                  <div className="bg-surface-100 rounded-2xl p-4">
                    <p className="text-sm font-medium text-text-primary mb-3">Top Skills Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Python', 'Machine Learning', 'AWS', 'TypeScript'].map((skill, i) => (
                        <motion.span
                          key={skill}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Floating notification cards */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-card-lg p-3 border-2 border-surface-300"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-text-primary">Resume Score: Excellent!</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-card-lg p-3 border-2 border-surface-300"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-secondary-500" />
                    <span className="text-sm font-medium text-text-primary">New match: Google SWE</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center">
            <motion.div
              className="w-1.5 h-3 bg-text-muted rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FloatingCard key={index} delay={index * 0.1}>
                <div className="text-center p-6 rounded-2xl bg-white border-2 border-surface-300 shadow-soft">
                  <AnimatedCounter value={stat.value} label={stat.label} />
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - 3D Cards */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Everything You Need to{' '}
              <span className="text-gradient">Land Your Dream Job</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and support you need throughout your placement journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FloatingCard key={index} delay={index * 0.1}>
                <div className="group p-8 rounded-2xl bg-white border-2 border-surface-300 hover:border-primary/30 shadow-soft hover:shadow-card-lg transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Timeline */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              How <span className="text-gradient">CareerForge</span> Works
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Three simple steps to transform your career prospects.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: CpuChipIcon,
                title: 'Upload Your Resume',
                description: 'Upload your resume and let our AI analyze it for improvements and ATS optimization.',
              },
              {
                step: '02',
                icon: CommandLineIcon,
                title: 'Practice & Improve',
                description: 'Take AI-powered mock interviews and receive personalized feedback.',
              },
              {
                step: '03',
                icon: GlobeAltIcon,
                title: 'Get Matched & Hired',
                description: 'Our algorithm matches you with perfect opportunities and helps you land your dream job.',
              },
            ].map((item, index) => (
              <FloatingCard key={index} delay={index * 0.2}>
                <div className="relative p-8 rounded-2xl bg-white border-2 border-surface-300 shadow-soft h-full">
                  <div className="text-8xl font-bold text-surface-300 absolute top-4 right-6">
                    {item.step}
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary-500 flex items-center justify-center mb-6 shadow-lg">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Success <span className="text-gradient">Stories</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Hear from students who transformed their careers with CareerForge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FloatingCard key={index} delay={index * 0.15}>
                <div className="p-8 rounded-2xl bg-white border-2 border-surface-300 shadow-soft h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-text-secondary mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{testimonial.name}</p>
                      <p className="text-sm text-text-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary via-primary-500 to-secondary-600 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Launch Your Career?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students who have already transformed their career prospects with CareerForge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="flex items-center bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Create Free Account
                </Link>
                <span className="text-white/60">No credit card required</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="CareerForge" className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold text-primary">CareerForge</span>
            </div>
            <p className="text-text-muted text-sm">
              © {new Date().getFullYear()} CareerForge. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
