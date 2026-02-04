import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // TODO: Implement forgot password API call
    console.log('Forgot password:', data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
          <EnvelopeIcon className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-light mb-2">Check Your Email</h2>
        <p className="text-light-400 mb-6">We've sent password reset instructions to your email address.</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-light">Forgot Password</h2>
        <p className="text-light-400 mt-2">Enter your email to reset your password</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400" />
            <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} className={`input pl-12 ${errors.email ? 'input-error' : ''}`} placeholder="Enter your email" />
          </div>
          {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full">Send Reset Link</button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-2 mt-8 text-light-400 hover:text-light">
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Login
      </Link>
    </motion.div>
  );
};

export default ForgotPasswordPage;
