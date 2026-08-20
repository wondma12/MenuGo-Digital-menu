import {useRef, useState, useEffect} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Fingerprint,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../../store/authStore';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { toast } from 'react-toastify';
import SocialLogin from './SocialLogin';
import { getEffectiveRole, getPostLoginRedirectPath, getRoleHomePath } from '../../utils/authRouting';
import { getPublicPlatformBranding } from '../../services/systemService';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

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

const getSafeReturnPath = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed)) return null;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const forceLogin = searchParams.get('forceLogin') === '1';
  const returnToPath = getSafeReturnPath(searchParams.get('returnTo') || searchParams.get('redirect') || location.state?.from || null);
  const { login, isLoading, error, clearError, checkAuth, isAuthenticated } = useAuthStore();
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [platformLogo, setPlatformLogo] = useState('');
  const submitLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    let cancelled = false;

    const redirectIfAuthenticated = async () => {
      try {
        if (forceLogin) return;

        const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null;
        if (!sessionToken && !isAuthenticated) return;

        const isReady = isAuthenticated || await checkAuth();
        if (cancelled || !isReady) return;

        const currentUser = useAuthStore.getState().user;
        const token = useAuthStore.getState().token || sessionStorage.getItem('token');
        const targetPath = getRoleHomePath(getEffectiveRole(currentUser, token));
        navigate(targetPath, { replace: true });
      } catch (error) {
        // Stay on login when auth cannot be confirmed.
      }
    };

    redirectIfAuthenticated();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, forceLogin, isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;

    getPublicPlatformBranding()
      .then((branding) => {
        if (!cancelled) setPlatformLogo(branding?.platform_logo || branding?.logo || '');
      })
      .catch(() => {
        // Keep the default MenuGo mark when branding is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle token returned from OAuth redirects
  useEffect(() => {
    let cancelled = false;

    const handleOauthToken = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token || cancelled) return;

        try { sessionStorage.setItem('token', token) } catch (e) { /* ignore */ }

        const authResolved = await checkAuth();
        if (authResolved && !cancelled) {
          const persistedUser = useAuthStore.getState().user;
          const currentToken = useAuthStore.getState().token || sessionStorage.getItem('token');
          const userRole = getEffectiveRole(persistedUser, currentToken);
          const redirectPath = getPostLoginRedirectPath(
            persistedUser,
            returnToPath || getRoleHomePath(userRole),
            currentToken
          );
          navigate(redirectPath, { replace: true });
        }
      } catch (e) {
        // ignore malformed urls
      }
    };

    handleOauthToken();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, navigate, returnToPath]);

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

        const authResolved = await checkAuth().catch(() => false);

        // Prefer the authoritative user returned by checkAuth(). If checkAuth
        // failed (network or transient), fall back to the login response
        // payload first, then to any persisted user snapshot. This avoids
        // using a stale persisted user (e.g. previous waiter) when deciding
        // the post-login redirect for staff users.
        const persistedUser = useAuthStore.getState().user;
        const srcUser = authResolved ? persistedUser : (result.user || persistedUser);
        const currentToken = useAuthStore.getState().token || sessionStorage.getItem('token');
        const userRole = getEffectiveRole(srcUser, currentToken);
        const redirectPath = getPostLoginRedirectPath(
          srcUser,
          returnToPath || getRoleHomePath(userRole),
          currentToken
        );
        navigate(redirectPath, { replace: true });
      } else {
        setLoginAttempts(prev => prev + 1);
        setShowError(true);
        toast.error(result?.error || 'Login failed');
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      setShowError(true);
      const message = err?.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      submitLockRef.current = false;
    }
  };

  const isFormValid = watchedEmail && watchedPassword && !errors.email && !errors.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated decorative blobs */}
      <motion.div
        animate={floatAnimation}
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-300/10 blur-3xl"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            }}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 80 - 40, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 8,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-md relative z-10"
      >
        {/* Back to home link */}
        <motion.div variants={itemVariants} className="mb-4">
          <Link
            to={returnToPath || '/'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition-all duration-300 group"
          >
            <motion.span whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ArrowLeft className="h-4 w-4" />
            </motion.span>
            Back to home
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/80 p-6 sm:p-8 relative overflow-hidden"
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

          <div className="text-center">
            {platformLogo ? (
              <motion.img
                src={platformLogo}
                alt="MenuGo platform logo"
                onError={() => setPlatformLogo('')}
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="mx-auto h-16 w-16 rounded-2xl object-contain shadow-lg shadow-orange-500/20"
              />
            ) : <motion.div
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              <span className="text-white font-bold text-2xl">MG</span>
            </motion.div>}

            <motion.h2 
              variants={itemVariants}
              className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl"
            >
              Welcome back
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="mt-2 text-sm text-slate-500"
            >
              Sign in to your account to continue
            </motion.p>

            {/* Security badge */}
            <motion.div
              variants={itemVariants}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-medium text-emerald-700">Secure login</span>
            </motion.div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4"
              >
                <Alert
                  type="success"
                  message="Login successful! Redirecting..."
                  className="rounded-xl border-emerald-200 bg-emerald-50"
                  onClose={() => setShowSuccess(false)}
                />
              </motion.div>
            )}

            {showError && error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4"
              >
                <Alert
                  type="error"
                  message={error}
                  className="rounded-xl border-red-200 bg-red-50"
                  onClose={() => {
                    setShowError(false);
                    clearError();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className={`relative mt-1.5 transition-all duration-300 ${
                isFocused.email ? 'ring-2 ring-orange-200' : ''
              }`}>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors duration-300" />
                <Input
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  autoComplete="email"
                  disabled={isLoading}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  className={`pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="you@example.com"
                />
                {watchedEmail && !errors.email && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={`relative mt-1.5 transition-all duration-300 ${
                isFocused.password ? 'ring-2 ring-orange-200' : ''
              }`}>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors duration-300" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={errors.password?.message}
                  autoComplete="current-password"
                  disabled={isLoading}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  className={`pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 ${
                    errors.password ? 'border-red-300' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              {loginAttempts >= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-xs text-amber-600"
                >
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>Multiple attempts</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading || !isFormValid}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 ${
                  isLoading || !isFormValid
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:shadow-orange-500/30 hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">Or continue with</span>
              </div>
            </div>
            <div className="mt-4">
              <SocialLogin />
            </div>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="mt-6 text-center text-sm text-slate-500"
          >
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors hover:underline inline-flex items-center gap-1 group"
            >
              Sign up
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </Link>
          </motion.p>

          {/* Trust badges */}
          <motion.div 
            variants={itemVariants}
            className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400"
          >
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              SSL Secure
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              24/7 Support
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;