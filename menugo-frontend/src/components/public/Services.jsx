import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getSubscriptionPlans } from '../../services/subscriptionService';
import { formatPrice } from '../../utils/currency';
import {
  DevicePhoneMobileIcon,
  QrCodeIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellAlertIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  PlayCircleIcon,
  TrophyIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  LanguageIcon,
  ChevronRightIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { getPublicPlatformSummary, getPlatformDashboardData } from '../../services/analyticsService';
import { staggerContainer, fadeInUp, popIn, hoverLift, heroImage } from '../common/motionVariants';

// Loading Skeleton Component
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full w-full"></div>
  </div>
);

const Services = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Digital Menu Creation',
      description: 'Create polished menus with images, descriptions, categories, and quick edits.',
      features: ['Drag-and-drop layout', 'Menu sections', 'Image support', 'Easy updates'],
      accent: 'from-sky-100 to-sky-50 text-sky-700',
      gradient: 'from-sky-500 to-cyan-500',
      bgColor: 'bg-sky-50',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Ordering System',
      description: 'Generate QR experiences for tables, promotions, and menu access in seconds.',
      features: ['Table-specific QR codes', 'Printable QR assets', 'Scan tracking', 'Fast guest access'],
      accent: 'from-emerald-100 to-emerald-50 text-emerald-700',
      gradient: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'See revenue, sales trends, customer activity, and top items from one dashboard.',
      features: ['Live dashboards', 'Revenue reports', 'Menu performance', 'Customer trends'],
      accent: 'from-amber-100 to-amber-50 text-amber-700',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Push menu changes, pricing, and availability updates instantly across devices.',
      features: ['Instant sync', 'Scheduled changes', 'Availability control', 'Version history'],
      accent: 'from-orange-100 to-orange-50 text-orange-700',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: UsersIcon,
      title: 'Staff Management',
      description: 'Coordinate staff roles, shifts, and responsibilities with fewer manual steps.',
      features: ['Role access', 'Shift planning', 'Activity logs', 'Team visibility'],
      accent: 'from-rose-100 to-rose-50 text-rose-700',
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Use a stable, secure system with encrypted sessions and reliable access control.',
      features: ['Secure sessions', 'Data protection', 'Role permissions', 'Backup friendly'],
      accent: 'from-cyan-100 to-cyan-50 text-cyan-700',
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
    },
  ];

  const extendedServices = [
    {
      icon: CreditCardIcon,
      title: 'Split Payments',
      description: 'Allow guests to split bills easily via QR or waiter assistance.',
      gradient: 'from-emerald-400 to-cyan-400',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Order Assistant',
      description: 'Smart upsell suggestions and allergen alerts during ordering.',
      gradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Reservations Sync',
      description: 'Integrate with Google Calendar and booking platforms automatically.',
      gradient: 'from-orange-400 to-red-400',
    },
    {
      icon: LanguageIcon,
      title: 'Multi-language Menus',
      description: 'Auto-translate menus into 15+ languages for international guests.',
      gradient: 'from-blue-400 to-indigo-400',
    },
  ];

  const process = [
    { 
      icon: BuildingStorefrontIcon, 
      title: 'Set up your space', 
      text: 'Add your restaurant, tables, and menu structure.',
      gradient: 'from-orange-500 to-amber-500',
    },
    { 
      icon: QrCodeIcon, 
      title: 'Go live with QR', 
      text: 'Place QR codes and let guests access menus instantly.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      icon: TrophyIcon, 
      title: 'Improve continuously', 
      text: 'Use analytics to refine service and grow revenue.',
      gradient: 'from-emerald-500 to-green-500',
    },
  ];

  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    active_users: 2300,
    uptime: '99.99%',
    support: '24/7',
    orders_processed: null,
  });
  const [pricing, setPricing] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const normalizePlan = (plan) => {
      const rawTier = plan.tier || '';
      const tier = typeof rawTier === 'string' ? rawTier.toLowerCase() : 'monthly';
      const normalizedFeatures = Array.isArray(plan.features)
        ? plan.features
        : typeof plan.features === 'string'
          ? plan.features.split(',').map((item) => item.trim()).filter(Boolean)
          : ['Everything in Premium', 'Dedicated support', 'Custom integrations', 'Unlimited menu items', 'Unlimited staff', 'API access'];

      const name = plan.name || (tier === 'six_month' ? '6-Month' : tier === 'yearly' ? 'Yearly' : 'Monthly');
      const period = tier === 'yearly' ? 'year' : tier === 'six_month' ? '6 months' : 'month';
      const priceValue = tier === 'yearly'
        ? plan.price_yearly ?? plan.priceYearly ?? plan.price ?? 0
        : tier === 'six_month'
          ? plan.price_yearly ?? plan.priceYearly ?? plan.price ?? 0
          : plan.price_monthly ?? plan.priceMonthly ?? plan.price ?? 0;

      return {
        name,
        description: plan.description || '',
        price: formatPrice(Number(priceValue) || 0),
        period,
        features: normalizedFeatures,
        recommended: tier === 'six_month',
      };
    };

    const loadPlans = async () => {
      try {
        const plans = await getSubscriptionPlans();
        if (cancelled) return;
        if (Array.isArray(plans) && plans.length > 0) {
          setPricing(plans.map(normalizePlan));
        } else {
          setPricing([]);
        }
      } catch (error) {
        setPricing([]);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    };

    loadPlans();
    return () => { cancelled = true; };
  }, []);

  const compactNumber = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return value || '0';
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const summary = await getPublicPlatformSummary();
        if (cancelled) return;
        if (summary && typeof summary === 'object') {
          setPlatformSummary((cur) => ({ ...cur, ...summary }));
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
        }
      } catch (e) {
        // ignore - keep defaults
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const restaurantsCount = (platformSummary.active_restaurants ?? platformSummary.restaurants_live ?? platformSummary.total_restaurants ?? platformSummary.restaurants) || platformSummary.restaurants_live || 0;
  const activeUsersCount = (platformSummary.active_users ?? platformSummary.team_members_enabled ?? platformSummary.total_users ?? platformSummary.users) || platformSummary.active_users || 0;

  const stats = [
    { value: `${compactNumber(restaurantsCount)}+`, label: 'Restaurants live', icon: BuildingStorefrontIcon, gradient: 'from-orange-500 to-amber-500' },
    { value: `${compactNumber(activeUsersCount)}+`, label: 'Active users', icon: UserGroupIcon, gradient: 'from-blue-500 to-cyan-500' },
    { value: `${compactNumber(platformSummary.orders_processed ?? 0)}+`, label: 'Orders processed', icon: ChartBarIcon, gradient: 'from-emerald-500 to-green-500' },
    { value: platformSummary.uptime || '99.99%', label: 'Uptime', icon: ShieldCheckIcon, gradient: 'from-purple-500 to-violet-500' },
    { value: platformSummary.support || '24/7', label: 'Support', icon: AcademicCapIcon, gradient: 'from-rose-500 to-pink-500' },
  ];

  const testimonials = [
    {
      quote: "The QR ordering system cut our wait times by half. Customers love the speed!",
      name: 'Luca Romano',
      title: 'Owner, Trattoria Roma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote: "Analytics helped us identify our top dishes and increase average check by 22%.",
      name: 'Priya Patel',
      title: 'Manager, Spice Route',
      avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote: "Staff management features made scheduling effortless. A game-changer for us.",
      name: 'Daniel Kim',
      title: 'GM, Seoul Eats',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
  ];

  const faqs = [
    { q: 'How fast can I set up MenuGo?', a: 'Most restaurants go live within 24 hours. Our onboarding team guides you every step.' },
    { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade anytime. No hidden fees.' },
    { q: 'Do I need any hardware?', a: 'No, MenuGo works on existing smartphones, tablets, and printers.' },
    { q: 'Is there a contract?', a: 'No long-term contracts. Cancel anytime with one month notice.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <PublicHeader />

      <div ref={containerRef}>
        {/* Hero Section with Enhanced Effects */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.25),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.15),transparent_60%)]" />
          
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? 'rgba(251, 146, 60, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                }}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -150, 0],
                  x: [0, Math.random() * 60 - 30, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: Math.random() * 6,
                }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} className="max-w-2xl">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-700 backdrop-blur-sm shadow-lg transition-all hover:shadow-orange-100"
                >
                  <SparklesIcon className="h-4 w-4 animate-pulse" />
                  Services & Pricing
                </motion.div>

                <motion.h1 
                  variants={fadeInUp}
                  className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                >
                  Tools that make your
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    restaurant feel effortless
                  </span>
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
                >
                  MenuGo combines digital menus, QR ordering, analytics, and team coordination into one clean system.
                  The result is faster service, less manual work, and a better guest experience.
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
                      Book a Demo
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="#pricing"
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md"
                    >
                      View Pricing
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-600"
                    >
                      <PlayCircleIcon className="h-5 w-5" />
                      Talk to Sales
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                    Fast setup and onboarding
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={heroImage} className="relative">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-4 -top-4 h-32 w-32 rounded-2xl bg-orange-300/30 blur-2xl"
                />
                <motion.div 
                  animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-orange-400/25 blur-2xl"
                />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
                  <motion.img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D"
                    alt="MenuGo services preview"
                    className="h-auto w-full rounded-xl object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="mt-4 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                    {stats.slice(0, 4).map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="min-w-[100px] rounded-xl border border-slate-100 bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm flex-shrink-0 transition-all hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + index * 0.08 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                      >
                        <p className={`text-sm font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${item.gradient}`}>
                          {item.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* How it works - Enhanced */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <motion.span 
                variants={fadeInUp}
                className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3"
              >
                How It Works
              </motion.span>
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl"
              >
                Get started in 3 simple steps
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200 -z-10"></div>
              
              {process.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={popIn}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative group"
                >
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl cursor-pointer">
                    <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg mb-4`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                    <motion.div 
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      animate={{ x: hoveredCard === `process-${index}` ? 0 : -10 }}
                    >
                      <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Core Services - Enhanced Cards */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">
                  Core Services
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Everything your service team needs</h2>
                <p className="mt-3 text-lg text-slate-600">
                  A complete toolkit to digitize restaurant operations while keeping the interface simple and polished.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
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
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${service.gradient})` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredCard === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.bgColor} transition-colors group-hover:bg-gradient-to-r ${service.gradient}`}>
                    <service.icon className={`h-6 w-6 ${service.accent.split(' ')[2]} transition-colors group-hover:text-white`} />
                  </div>
                  
                  <h3 className="relative z-10 text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="relative z-10 mt-2 text-sm text-slate-600">{service.description}</p>
                  
                  <ul className="relative z-10 mt-4 space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/contact"
                    className="relative z-10 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-800"
                  >
                    Learn more
                    <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
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

        {/* Extended Capabilities */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-800">
                  <SparklesIcon className="h-4 w-4" />
                  Advanced Features
                </span>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Powerful capabilities</h2>
                <p className="mt-3 text-lg text-slate-600">Premium features to elevate your guest experience.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {extendedServices.map((service, idx) => (
                <motion.div
                  key={idx}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${service.gradient})` }}
                  />
                  <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r shadow-lg" style={{ backgroundImage: `linear-gradient(to right, ${service.gradient})` }}>
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-slate-900">{service.title}</h3>
                  <p className="relative mt-2 text-sm text-slate-500">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - Enhanced */}
        <section className="bg-white py-16 sm:py-20">
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
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Trusted by restaurant owners</h2>
                <p className="mt-3 text-lg text-slate-600">Real results from real teams.</p>
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
                  className="relative rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer"
                >
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => (
                      <StarSolidIcon key={idx} className="h-4 w-4 fill-current" />
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

        {/* Pricing - Enhanced */}
        <section id="pricing" className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-3">
                  Pricing
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Simple pricing that scales with you</h2>
                <p className="mt-3 text-lg text-slate-600">
                  Pick a plan that fits your restaurant today and upgrade when you need more locations or automation.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricing.map((plan, index) => (
                <motion.div
                  key={index}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className={`relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl ${
                    plan.recommended ? 'border-2 border-orange-400 ring-2 ring-orange-500/20' : 'border border-slate-200'
                  }`}
                >
                  {plan.recommended && (
                    <motion.div 
                      className="bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-white"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🔥 Most Popular
                    </motion.div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      {plan.period && <span className="pb-1 text-sm text-slate-500">/{plan.period}</span>}
                    </div>
                    <ul className="mt-5 space-y-2.5 text-left">
                      {plan.features.slice(0, 6).map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                          plan.recommended
                            ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50'
                            : 'border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600'
                        }`}
                      >
                        Get Started
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 text-center text-sm text-slate-500"
            >
              All plans include a 14-day free trial. No credit card required.
            </motion.p>
          </div>
        </section>

        {/* FAQ Section - Enhanced */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">
                  FAQ
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Frequently asked questions</h2>
                <p className="mt-3 text-lg text-slate-600">Everything you need to know before getting started.</p>
              </motion.div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-orange-200 cursor-pointer"
                >
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-orange-500 text-lg">Q:</span> {faq.q}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 pl-6">
                    <span className="text-orange-500 font-semibold">A:</span> {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
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
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
              Ready to upgrade your restaurant workflow?
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-orange-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Start with a flexible plan, then scale your menus, analytics, and team operations as your business grows.
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
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 backdrop-blur-sm"
                >
                  Sign In
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
                <CheckBadgeIcon className="h-4 w-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckBadgeIcon className="h-4 w-4" />
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

export default Services;