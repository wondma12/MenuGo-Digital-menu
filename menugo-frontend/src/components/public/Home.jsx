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
import { QrCode, Smartphone, ChefHat, Bell, CreditCard, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [hoveredStep, setHoveredStep] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialDirection, setTestimonialDirection] = useState(0);
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

  // How It Works Steps - 6 Step Process
  const howItWorksSteps = [
    {
      icon: QrCode,
      step: "01",
      title: "Scan QR Code",
      description: "Customer scans the unique QR code on their table using their smartphone camera. No app download needed.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
      image: "📱"
    },
    {
      icon: Smartphone,
      step: "02",
      title: "Browse & Order",
      description: "Digital menu appears instantly. Customers browse items, customize orders, and add to cart with ease.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      image: "🛒"
    },
    {
      icon: ChefHat,
      step: "03",
      title: "Kitchen Receives Order",
      description: "Order instantly appears on the kitchen display. Chefs can prioritize and track preparation time.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      image: "👨‍🍳"
    },
    {
      icon: Bell,
      step: "04",
      title: "Real-Time Updates",
      description: "Customer receives live updates on order status. Staff gets notified when orders are ready for serving.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      gradient: "from-green-500 to-emerald-500",
      image: "🔔"
    },
    {
      icon: CreditCard,
      step: "05",
      title: "Secure Payment",
      description: "Multiple payment options available. Customers can pay via card, digital wallet, or split the bill.",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      gradient: "from-indigo-500 to-violet-500",
      image: "💳"
    },
    {
      icon: Star,
      step: "06",
      title: "Feedback & Analytics",
      description: "Collect customer feedback and gain insights. Improve service quality with data-driven decisions.",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      gradient: "from-yellow-500 to-amber-500",
      image: "⭐"
    }
  ];

  // Testimonials Data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Owner, The Italian Place",
      image: "https://i.pravatar.cc/100?img=1",
      rating: 5,
      text: "MenuGo transformed our restaurant operations completely. The QR menu system is incredibly intuitive, and our customers love the convenience. We've seen a 40% increase in order efficiency since implementing it.",
      metrics: { label: "Revenue Increase", value: "+35%" }
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CEO, Golden Dragon Group",
      image: "https://i.pravatar.cc/100?img=3",
      rating: 5,
      text: "Managing multiple locations was always a challenge until we found MenuGo. The centralized dashboard gives us real-time insights across all our restaurants. The analytics have been game-changing for our business decisions.",
      metrics: { label: "Efficiency Gain", value: "+50%" }
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Manager, Fresh Bites Cafe",
      image: "https://i.pravatar.cc/100?img=5",
      rating: 4,
      text: "The staff management features are phenomenal. Scheduling, permissions, and performance tracking have never been easier. Our team productivity has improved significantly, and the support team is incredibly responsive.",
      metrics: { label: "Time Saved", value: "20hrs/wk" }
    },
    {
      id: 4,
      name: "David Park",
      role: "Founder, Sushi Master",
      image: "https://i.pravatar.cc/100?img=8",
      rating: 5,
      text: "We tried several restaurant management platforms before MenuGo. None compare to the seamless experience and comprehensive features. The real-time kitchen display system has reduced our order errors by 90%.",
      metrics: { label: "Error Reduction", value: "-90%" }
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Director, Bistro Deluxe",
      image: "https://i.pravatar.cc/100?img=9",
      rating: 5,
      text: "MenuGo's customer feedback system has been invaluable. We're able to address issues in real-time and improve our service quality continuously. Our customer satisfaction scores have never been higher.",
      metrics: { label: "Customer Satisfaction", value: "4.9/5" }
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialDirection(1);
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleTestimonialPrevious = () => {
    setTestimonialDirection(-1);
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleTestimonialNext = () => {
    setTestimonialDirection(1);
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

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

        {/* How It Works - 6 Step Detailed Process */}
        <section className="bg-white py-16 sm:py-24 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-0 w-72 h-72 bg-orange-500/5 rounded-full mix-blend-multiply filter blur-3xl" />
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-orange-500/5 rounded-full mix-blend-multiply filter blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Simple 6-Step{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Process
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                From scanning to payment, experience the seamless journey that makes 
                MenuGo the preferred choice for modern restaurants.
              </p>
            </motion.div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredStep === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />

                  <div className="relative z-10">
                    {/* Step Number and Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {step.step}
                      </span>
                      <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center transition-colors group-hover:bg-gradient-to-r ${step.color}`}>
                        <step.icon className={`w-7 h-7 ${step.iconColor} transition-colors group-hover:text-white`} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Animated icon indicator */}
                    <motion.div 
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      animate={{ x: hoveredStep === index ? 0 : -10 }}
                    >
                      <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <p className="text-lg text-slate-600 mb-6">
                Ready to streamline your restaurant operations?
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
                >
                  Get Started Now
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section with Carousel */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-orange-50/20 to-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500/5 rounded-full filter blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full filter blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                Testimonials
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Trusted by{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Restaurant Owners
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                See what our customers are saying about MenuGo
              </p>
            </motion.div>

            {/* Testimonials Carousel */}
            <div className="max-w-4xl mx-auto relative">
              <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
                <AnimatePresence initial={false} custom={testimonialDirection}>
                  <motion.div
                    key={testimonialIndex}
                    custom={testimonialDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute w-full"
                  >
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 relative">
                      {/* Quote Icon */}
                      <div className="absolute top-6 right-6 text-orange-100">
                        <Quote className="w-16 h-16" />
                      </div>

                      <div className="relative">
                        {/* Rating Stars */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                          ))}
                        </div>

                        {/* Testimonial Text */}
                        <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-8 font-light">
                          "{testimonials[testimonialIndex].text}"
                        </p>

                        {/* Author and Metrics */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={testimonials[testimonialIndex].image}
                              alt={testimonials[testimonialIndex].name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-200"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-slate-900">
                                {testimonials[testimonialIndex].name}
                              </h4>
                              <p className="text-slate-500">
                                {testimonials[testimonialIndex].role}
                              </p>
                            </div>
                          </div>

                          {/* Metrics Badge */}
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl px-6 py-3 border border-orange-200">
                            <p className="text-sm text-slate-600">
                              {testimonials[testimonialIndex].metrics.label}
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {testimonials[testimonialIndex].metrics.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handleTestimonialPrevious}
                  className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 group"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setTestimonialDirection(index > testimonialIndex ? 1 : -1);
                        setTestimonialIndex(index);
                      }}
                      className={`transition-all duration-300 ${
                        index === testimonialIndex
                          ? 'w-8 h-3 bg-orange-500 rounded-full'
                          : 'w-3 h-3 bg-slate-300 rounded-full hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleTestimonialNext}
                  className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 group"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Trusted By Brands */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 pt-10 border-t border-slate-100"
            >
              <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                Trusted by leading restaurants worldwide
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center opacity-40">
                {['The Italian Place', 'Golden Dragon', 'Fresh Bites', 'Sushi Master', 'Bistro Deluxe'].map((brand) => (
                  <div key={brand} className="text-lg font-bold text-slate-500 hover:text-slate-700 transition-colors">
                    {brand}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

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

      <style>{`
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