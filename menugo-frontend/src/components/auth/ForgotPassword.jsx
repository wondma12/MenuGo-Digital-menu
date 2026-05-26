import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { forgotPassword } from '../../services/authService';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await forgotPassword(data.email);
      setSuccessMessage(response?.message || 'If an account exists for that email, a reset link has been prepared.');
      setResetUrl(response?.data?.reset_url || response?.reset_url || '');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="mx-auto w-full max-w-md">
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8"
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Check your email</h3>
              <p className="mt-2 text-sm text-slate-600">
                {successMessage || "We've sent a password reset link to your email address."}
              </p>
              {resetUrl && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-left">
                  <p className="text-sm font-medium text-amber-800">Local development reset link</p>
                  <p className="mt-1 text-xs text-amber-700 break-all">{resetUrl}</p>
                  <a
                    href={resetUrl}
                    className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Open reset page →
                  </a>
                </div>
              )}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="mx-auto w-full max-w-md">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8"
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xl">MG</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Reset your password</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} className="mt-6" onClose={() => setError(null)} />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} fullWidth className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-2.5">
              Send reset link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-orange-600 hover:text-orange-700">
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;