import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { register as registerUser, clearError } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'alumni';
  department?: string;
  batch?: string;
  company?: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { role: 'student' } });

  const watchRole = watch('role');
  const watchPassword = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    try {
      const result = await dispatch(registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        department: data.department,
        batch: data.batch,
      })).unwrap();
      navigate(result.user.role === 'student' ? '/student/dashboard' : result.user.role === 'alumni' ? '/alumni/dashboard' : '/');
    } catch (err) { }
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="auth-card"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Create Account</h2>
        <p className="text-text-muted mt-2">
          {step === 1 ? 'Enter your personal details' : 'Complete your profile'}
        </p>
      </div>

      {/* Step indicator - only show on step 2 */}
      {step === 2 && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-success text-white">
              ✓
            </div>
            <span className="text-sm text-text-muted">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-success" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary text-white">
              2
            </div>
            <span className="text-sm text-text-primary font-medium">Profile</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/10 border-2 border-error/30 text-error rounded-xl p-4 mb-6 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-secondary-500 transition-colors" />
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className={`auth-input pl-12 ${errors.firstName ? 'border-error' : ''}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-error text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className={`auth-input ${errors.lastName ? 'border-error' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-error text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative group">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`auth-input pl-12 ${errors.email ? 'border-error' : ''}`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Must include uppercase, lowercase, and number'
                    }
                  })}
                  className={`auth-input pl-12 pr-12 ${errors.password ? 'border-error' : ''}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watchPassword || 'Passwords do not match'
                })}
                className={`auth-input ${errors.confirmPassword ? 'border-error' : ''}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {/* Role selection */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${watchRole === 'student'
                    ? 'border-primary bg-primary/5'
                    : 'border-surface-400 hover:border-primary/30'
                  }`}>
                  <input type="radio" value="student" {...register('role')} className="hidden" />
                  <AcademicCapIcon className={`w-6 h-6 ${watchRole === 'student' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={watchRole === 'student' ? 'text-text-primary font-medium' : 'text-text-secondary'}>Student</span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${watchRole === 'alumni'
                    ? 'border-primary bg-primary/5'
                    : 'border-surface-400 hover:border-primary/30'
                  }`}>
                  <input type="radio" value="alumni" {...register('role')} className="hidden" />
                  <BriefcaseIcon className={`w-6 h-6 ${watchRole === 'alumni' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={watchRole === 'alumni' ? 'text-text-primary font-medium' : 'text-text-secondary'}>Alumni</span>
                </label>
              </div>
            </div>

            {/* Student fields */}
            {watchRole === 'student' && (
              <>
                <div>
                  <label className="label">Department</label>
                  <select
                    {...register('department', { required: 'Department is required' })}
                    className={`auth-input ${errors.department ? 'border-error' : ''}`}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="EEE">Electrical & Electronics</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="IT">Information Technology</option>
                  </select>
                  {errors.department && (
                    <p className="text-error text-sm mt-1">{errors.department.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Batch / Year</label>
                  <select
                    {...register('batch', { required: 'Batch is required' })}
                    className={`auth-input ${errors.batch ? 'border-error' : ''}`}
                  >
                    <option value="">Select Batch</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                  {errors.batch && (
                    <p className="text-error text-sm mt-1">{errors.batch.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Alumni fields */}
            {watchRole === 'alumni' && (
              <>
                <div>
                  <label className="label">Current Company</label>
                  <input
                    type="text"
                    {...register('company', { required: 'Company is required' })}
                    className={`auth-input ${errors.company ? 'border-error' : ''}`}
                    placeholder="e.g., Google, Microsoft"
                  />
                  {errors.company && (
                    <p className="text-error text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Graduation Year</label>
                  <select
                    {...register('batch', { required: 'Graduation year is required' })}
                    className={`auth-input ${errors.batch ? 'border-error' : ''}`}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 20 }, (_, i) => 2025 - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.batch && (
                    <p className="text-error text-sm mt-1">{errors.batch.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeToTerms', { required: 'You must agree to the terms' })}
                className="w-4 h-4 mt-1 rounded border-2 border-surface-400 bg-white text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <a href="#" className="text-secondary-500 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-secondary-500 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-error text-sm">{errors.agreeToTerms.message}</p>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
          )}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : step === 1 ? (
              <span className="flex items-center justify-center gap-2">
                Continue
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </div>
      </form>

      {/* Sign in link */}
      <p className="text-center mt-8 text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-secondary-500 hover:text-secondary-600 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default RegisterPage;
