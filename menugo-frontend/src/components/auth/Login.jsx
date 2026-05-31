import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../../store/authStore';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { toast } from 'react-toastify';
import SocialLogin from './SocialLogin';

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const submitLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data) => {
    if (isLoading || submitLockRef.current) return;
    submitLockRef.current = true;
    setShowError(false);
    setShowSuccess(false);

    try {
      const result = await login(data.email, data.password, data.rememberMe);
      if (result?.success) {
        setShowSuccess(true);
        toast.success('Login successful! Redirecting...');
        setTimeout(() => {
          const persistedUser = useAuthStore.getState().user;
          const srcUser = result.user || persistedUser;
          const userRole = srcUser?.staff?.role || srcUser?.role || null;
          const roleRoutes = {
            platform_admin: '/platform/dashboard',
            restaurant_admin: '/admin/dashboard',
            chef: '/chef/kitchen',
            waiter: '/waiter/dashboard',
            customer: '/scan',
          };
          const redirectPath = roleRoutes[userRole] || '/';
          navigate(redirectPath);
        }, 1000);
      } else {
        setShowError(true);
        toast.error(result?.error || 'Login failed');
      }
    } catch (err) {
      setShowError(true);
      const message = err?.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-md"
      >
        {/* Back to home link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xl">MG</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to your account to continue</p>
          </div>

          {showSuccess && (
            <Alert
              type="success"
              message="Login successful! Redirecting..."
              className="mt-6"
              onClose={() => setShowSuccess(false)}
            />
          )}

          {showError && error && (
            <Alert
              type="error"
              message={error}
              className="mt-6"
              onClose={() => {
                setShowError(false);
                clearError();
              }}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  autoComplete="email"
                  disabled={isLoading}
                  className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-2.5"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-4">
              <SocialLogin />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-orange-600 hover:text-orange-700">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;