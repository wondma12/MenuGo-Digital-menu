import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  Bars3BottomLeftIcon,
  BoltIcon,
  CheckBadgeIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  PresentationChartLineIcon,
  QrCodeIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  GlobeAltIcon,
  UsersIcon,
  CreditCardIcon,
  LightBulbIcon,
  PhoneArrowUpRightIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  PlayIcon,
  XMarkIcon,
  CheckCircleIcon,
  HeartIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  CameraIcon,
  MapPinIcon,
  WifiIcon,
  Battery100Icon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { getPublicPlatformSummary, getPlatformDashboardData } from '../../services/analyticsService';

// Custom motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'backOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

const shimmerAnimation = {
  background: ['linear-gradient(90deg, #f97316 0%, #fb923c 50%, #f97316 100%)'],
  backgroundSize: ['200% 100%'],
  transition: { duration: 3, repeat: Infinity, ease: 'linear' },
};

const compactNumber = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue);
};

// Loading Skeleton Component
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full w-full"></div>
  </div>
);

const Home = () => {
  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    orders_processed: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const summary = await getPublicPlatformSummary();
        if (!cancelled && summary && typeof summary === 'object') {
          const summaryOrders = Number(summary.orders_processed ?? summary.completed_orders ?? summary.total_orders ?? summary.totalOrders ?? 0);
          setPlatformSummary((current) => ({
            ...current,
            ...summary,
            orders_processed: summaryOrders > 0 ? summaryOrders : current.orders_processed,
          }));
        }
      } catch (e) {
        // ignore
      }

      try {
        const dashboard = await getPlatformDashboardData();
        if (!cancelled && dashboard && typeof dashboard === 'object') {
          const dashboardOrders = Number(dashboard.totalOrders ?? dashboard.completedOrders ?? dashboard.total_orders ?? dashboard.completed_orders ?? 0);
          if (dashboardOrders > 0) {
            setPlatformSummary((cur) => ({ ...cur, orders_processed: dashboardOrders }));
          }
        }
      } catch (e) {
        // ignore dashboard errors
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile-first Menus',
      description: 'Blazing-fast menu pages that feel like a native app on any smartphone.',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: QrCodeIcon,
      title: 'Smart QR Flows',
      description: 'Instant table QR codes with dine-in, takeaway & prepayment modes.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: PresentationChartLineIcon,
      title: 'Live Performance Data',
      description: 'Monitor revenue, popular items & staff performance from one dashboard.',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Change prices, availability & descriptions — reflected instantly.',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: Bars3BottomLeftIcon,
      title: 'Operational Simplicity',
      description: 'Clear workflows for waiters, kitchen display & manager oversight.',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'GDPR-ready, encrypted payments, and 99.99% uptime SLA.',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ];

  const advancedFeatures = [
    {
      icon: CreditCardIcon,
      title: 'Split Payments',
      description: 'Let guests split bills seamlessly via QR or waiter assistance.',
      gradient: 'from-emerald-400 to-cyan-400',
    },
    {
      icon: GlobeAltIcon,
      title: 'Multi‑language',
      description: 'Auto‑translate menus into 15+ languages for international guests.',
      gradient: 'from-blue-400 to-indigo-400',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Order Assistant',
      description: 'Smart upsell suggestions & allergen alerts during ordering.',
      gradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Reservations Sync',
      description: 'Connect with Google Calendar & booking platforms automatically.',
      gradient: 'from-orange-400 to-red-400',
    },
  ];

  const stats = [
    { 
      value: compactNumber(platformSummary.restaurants_live), 
      label: 'Restaurants Live', 
      suffix: '',
      icon: FireIcon,
      gradient: 'from-orange-500 to-amber-500',
    },
    { 
      value: compactNumber(platformSummary.orders_processed ?? 0), 
      label: 'Orders Processed', 
      suffix: '',
      icon: TrophyIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      value: '98%', 
      label: 'Customer Retention', 
      suffix: '',
      icon: HeartSolidIcon,
      gradient: 'from-rose-500 to-pink-500',
    },
    { 
      value: '24/7', 
      label: 'Priority Support', 
      suffix: '',
      icon: AcademicCapIcon,
      gradient: 'from-emerald-500 to-green-500',
    },
  ];

  const testimonials = [
    {
      quote: "MenuGo completely removed friction from our ordering process. Our staff loves it, and customers keep coming back!",
      name: 'Luca Romano',
      title: 'Owner, Trattoria Roma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote: "The analytics dashboard gave us insights we never had before. We redesigned our menu and saw a 22% increase in average check.",
      name: 'Priya Patel',
      title: 'Manager, Spice Route',
      avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote: "Onboarding took only 48 hours, and the QR codes work perfectly even during Friday rush hours. A game-changer.",
      name: 'Daniel Kim',
      title: 'GM, Seoul Eats',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
  ];

  const integrations = [
    { name: 'Square', icon: '💰', bgColor: 'bg-emerald-50' },
    { name: 'Toast', icon: '🍞', bgColor: 'bg-amber-50' },
    { name: 'Stripe', icon: '💳', bgColor: 'bg-blue-50' },
    { name: 'Uber Eats', icon: '🛵', bgColor: 'bg-purple-50' },
    { name: 'Slack', icon: '💬', bgColor: 'bg-indigo-50' },
    { name: 'Google Maps', icon: '🗺️', bgColor: 'bg-rose-50' },
  ];

  const stepCards = [
    {
      step: '01',
      title: 'Create your account',
      desc: 'Sign up and add your restaurant details — takes under 2 minutes.',
      icon: RocketLaunchIcon,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      step: '02',
      title: 'Upload your menu',
      desc: 'Add items, prices, and categories. Bulk import from Excel or PDF.',
      icon: DevicePhoneMobileIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      step: '03',
      title: 'Print QR codes & go live',
      desc: 'Download your table QR codes, place them, and start accepting orders.',
      icon: QrCodeIcon,
      gradient: 'from-emerald-500 to-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-gray-900 overflow-x-hidden">
      <PublicHeader />
      <br />
      <br />
      <br />
     
      <div ref={containerRef} >
        {/* Hero Section with Enhanced Effects */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20"
        >
          <BackgroundCarousel />
          
          {/* Enhanced decorative elements */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.25),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.15),transparent_60%)]" />
          <motion.div 
            animate={floatAnimation}
            className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div variants={fadeInUp} className="max-w-2xl">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-orange-700 shadow-lg backdrop-blur-sm transition-all hover:shadow-orange-100"
                >
                  <SparklesIcon className="h-4 w-4 animate-pulse" />
                  SOFTWARE AS A SERVICE (SaaS) FOR RESTAURANTS
                </motion.div>

                <motion.h1 
                  variants={fadeInUp}
                  className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                >
                  Design a better
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    restaurant journey
                  </span>
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
                >
                  MenuGo helps restaurants move from paper menus to a complete digital flow with QR ordering,
                  instant updates, and practical analytics your team can use every day.
                </motion.p>

                <motion.div 
                  variants={fadeInUp}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
                    >
                      Book Demo
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/services"
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md"
                    >
                      Explore Features
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="mt-8 flex items-center gap-6 text-sm text-slate-500"
                >
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Free 14-day trial</span>
                  </div>
                </motion.div>
              </motion.div>

            
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section with Enhanced Cards */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
          className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={popIn}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl hover:border-orange-200 group cursor-pointer"
                >
                  <motion.div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="h-4 w-4 text-orange-600" />
                  </motion.div>
                  <motion.p 
                    className={`mt-2 text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${stat.gradient}`}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Core Features with Enhanced Cards */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">
                  Core Features
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Everything you need to digitize your restaurant
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  Powerful tools that work together seamlessly — from QR to checkout.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredCard === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} transition-colors group-hover:bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor} transition-colors group-hover:text-white`} />
                  </div>
                  
                  <h3 className="relative z-10 mb-2 text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="relative z-10 text-sm text-slate-600">{feature.description}</p>
                  
                  <motion.div 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    animate={{ x: hoveredCard === index ? 0 : -10 }}
                  >
                    <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Capabilities */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-800">
                  <LightBulbIcon className="h-4 w-4" />
                  Next‑gen capabilities
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Go beyond basic ordering
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  Premium features designed to maximize revenue and guest satisfaction.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advancedFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative group rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.gradient})` }}
                  />
                  <div className={`relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="relative mt-2 text-sm text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">
                  Get Started
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Get started in 3 simple steps
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  From setup to first order — faster than you think.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200 -z-10"></div>
              
              {stepCards.map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative"
                >
                  <div className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer">
                    <div className="mb-4 flex items-center justify-between">
                      <motion.span 
                        className={`text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent ${step.gradient}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {step.step}
                      </motion.span>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${step.gradient} shadow-lg`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials with Enhanced Cards */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-3">
                  Testimonials
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Loved by restaurant teams
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  Real feedback from happy customers.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer"
                >
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => (
                      <StarIcon key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        {/* <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">
                  Integrations
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Works with your favorite tools
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  Seamlessly connect with the platforms you already use.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {integrations.map((integration, idx) => (
                <motion.div
                  key={idx}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ 
                    y: -4,
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className={`${integration.bgColor} rounded-xl p-4 text-center transition-all hover:shadow-lg cursor-pointer`}
                >
                  <span className="text-3xl block mb-2">{integration.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{integration.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-16 sm:py-20"
        >
          <motion.div 
            animate={floatAnimation}
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </motion.div>

          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.h2 
              className="text-3xl font-extrabold text-white sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to transform your restaurant?
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-orange-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of restaurants already using MenuGo to streamline their operations.
            </motion.p>
            <motion.div 
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-orange-600 shadow-lg transition-all hover:shadow-orange-700/30 hover:bg-orange-50"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 backdrop-blur-sm"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-6 flex justify-center items-center gap-6 text-sm text-orange-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                14-day free trial
              </span>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <PublicFooter />

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
};

function BackgroundCarousel() {
  const images = [
    'https://images.pexels.com/photos/29000057/pexels-photo-29000057.jpeg',
    'https://images.pexels.com/photos/28999499/pexels-photo-28999499.jpeg',
    'https://images.pexels.com/photos/26729401/pexels-photo-26729401.jpeg',
    'https://images.pexels.com/photos/29000046/pexels-photo-29000046.jpeg',
    'https://images.pexels.com/photos/33948377/pexels-photo-33948377.jpeg'
  ];

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const showOverlay = hovered || overlayVisible;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-80 sm:h-96 lg:h-[420px]">
      {images.map((src, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: `url(${src})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            transition: 'opacity 1s ease-in-out',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1 }}
        />
      ))}

      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOverlayVisible((visible) => !visible)}
        style={{ cursor: 'pointer' }}
      >
        <motion.div 
          className={`pointer-events-auto mx-auto max-w-3xl px-4 text-center transition-opacity duration-200 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showOverlay ? 1 : 0, y: showOverlay ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl bg-black/60 px-8 py-6 text-white backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Digital dining, reimagined</h2>
            <p className="mt-2 text-sm">Design a better restaurant journey — click to book a demo.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;