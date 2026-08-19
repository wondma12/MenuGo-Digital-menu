import {useEffect, useState, useRef} from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  staggerContainer,
  fadeInUp,
  popIn,
  hoverLift,
  fadeInDown,
  heroImage,
  subtleFloat,
} from '../common/motionVariants'
import {
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PhoneArrowUpRightIcon,
  ClockIcon,
  CheckBadgeIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  PlayIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { getPublicPlatformSummary } from '../../services/analyticsService';

// Loading Skeleton Component
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full w-full"></div>
  </div>
);

const compactNumber = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue);
}

const About = () => {
  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    team_members_enabled: 2300,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const summary = await getPublicPlatformSummary();
        if (!cancelled && summary && typeof summary === 'object') {
          setPlatformSummary((current) => ({
            ...current,
            ...summary,
          }));
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const values = [
    {
      icon: HeartIcon,
      title: 'Customer First',
      description: 'Every detail is shaped around the real rhythms of service, from first contact to final payment.',
      summary: 'We make hospitality tools feel intuitive for guests and teams alike.',
      bullets: ['Faster guest journeys', 'Less friction during rush hours', 'Experience-first design'],
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We blend practical product thinking with modern experiences that restaurants can adopt quickly.',
      summary: 'Every release is designed to feel useful, modern, and easy to bring into daily operations.',
      bullets: ['Fresh product ideas', 'Simple onboarding', 'Built for busy teams'],
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: UsersIcon,
      title: 'Collaboration',
      description: 'We build for kitchens, waiters, owners, and diners as one connected system that works together.',
      summary: 'When everyone shares the same flow, service becomes more confident and coordinated.',
      bullets: ['Shared workflows', 'Clear team communication', 'Connected operations'],
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'We want to help restaurants everywhere deliver smoother, smarter service with flexible digital tools.',
      summary: 'From local cafés to growing chains, our platform supports hospitality at scale.',
      bullets: ['Multi-language readiness', 'Scalable for growth', 'Built for modern dining'],
      gradient: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ]

  const milestones = [
    { 
      year: '2026', 
      title: 'Started MenuGo', 
      text: 'Built to replace paper menus with a smoother digital flow.', 
      icon: RocketLaunchIcon,
      gradient: 'from-orange-500 to-amber-500',
    },
  ]

  const metrics = [
    { 
      value: `${compactNumber(platformSummary.restaurants_live)}+`, 
      label: 'Active Restaurants',
      icon: BuildingStorefrontIcon,
      gradient: 'from-orange-500 to-amber-500',
    },
    { 
      value: `${compactNumber(platformSummary.team_members_enabled)}+`, 
      label: 'Team Members Enabled',
      icon: UserGroupIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      value: '99.99%', 
      label: 'Platform Uptime',
      icon: ShieldCheckIcon,
      gradient: 'from-emerald-500 to-green-500',
    },
    { 
      value: '24/7', 
      label: 'Priority Support',
      icon: AcademicCapIcon,
      gradient: 'from-purple-500 to-violet-500',
    },
  ]

  const capabilities = [
    { 
      icon: BuildingStorefrontIcon, 
      title: 'Built for hospitality', 
      text: 'Designed for front-of-house speed, kitchen clarity, and management control.',
      gradient: 'from-orange-500 to-amber-500',
    },
    { 
      icon: ChartBarIcon, 
      title: 'Actionable analytics', 
      text: 'See what sells, where delays happen, and how to improve service quickly.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      icon: ShieldCheckIcon, 
      title: 'Secure by design', 
      text: 'Protected sessions and stable infrastructure for day-to-day restaurant operations.',
      gradient: 'from-emerald-500 to-green-500',
    },
  ]

  const teamStories = [
    {
      quote: "MenuGo cut our ticket times by 30% and made weekend rushes effortless.",
      name: "Sarah Chen",
      role: "Owner, The Noodle House",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
    },
    {
      quote: "The analytics dashboard helped us increase average check size by 18% in two months.",
      name: "Marcus Johnson",
      role: "Operations Director, Burger & Co.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
    },
    {
      quote: "Finally a QR ordering system that waiters actually enjoy using.",
      name: "Elena Rossi",
      role: "General Manager, Pizzeria Centrale",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <PublicHeader />

      <div ref={containerRef}>
        {/* Hero Section with Enhanced Effects */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24"
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
            {[...Array(12)].map((_, i) => (
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
              variants={staggerContainer} 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInDown} className="mx-auto max-w-3xl text-center">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 backdrop-blur-sm shadow-lg transition-all hover:shadow-orange-100"
                >
                  <SparklesIcon className="h-4 w-4 animate-pulse" />
                  About MenuGo
                </motion.div>
                
                <motion.h1 
                  variants={fadeInUp}
                  className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                >
                  We help restaurants run a cleaner,
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    faster digital service flow
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeInUp}
                  className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
                >
                  MenuGo brings menus, ordering, and operations into one polished system so teams can work faster
                  and guests can enjoy a smoother dining experience.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50">
                      Contact Us
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="/services" className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md">
                      See Services
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Metrics Strip with Enhanced Cards */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {metrics.map((item, index) => (
                <motion.div
                  key={item.label}
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
                    <item.icon className="h-4 w-4 text-orange-600" />
                  </motion.div>
                  <motion.p 
                    className={`mt-2 text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${item.gradient}`}
                  >
                    {item.value}
                  </motion.p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Our Story Section with Enhanced Layout */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div 
                variants={fadeInUp} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }}
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-800"
                >
                  <HeartIcon className="h-4 w-4" />
                  Our Story
                </motion.div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Built from real restaurant pain points</h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  MenuGo was created to solve the everyday friction that slows restaurants down: printing costs,
                  outdated menus, scattered coordination, and lack of visibility during service.
                </p>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  We focused on a simple idea: give staff and owners one place to update content, manage orders,
                  and make better decisions without extra complexity.
                </p>
                <div className="mt-8 space-y-4">
                  {milestones.map((item, idx) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                      whileHover={{ 
                        scale: 1.02,
                        x: 8,
                        transition: { type: 'spring', stiffness: 300 },
                      }}
                      className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    >
                      <motion.div 
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${item.gradient}`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-orange-600">{item.year}</span>
                          <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                variants={heroImage} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                className="relative"
              >
                <motion.div 
                  animate={subtleFloat}
                  className="absolute -left-4 -top-4 h-32 w-32 rounded-2xl bg-orange-300/30 blur-2xl"
                />
                <motion.div 
                  animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-orange-400/25 blur-2xl"
                />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                    alt="About MenuGo"
                    className="h-auto w-full rounded-xl object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg"
                  >
                    <p className="text-xs font-semibold text-slate-900">Trusted by 500+ restaurants</p>
                    <p className="text-xs text-slate-500">Growing every day</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision with Enhanced Cards */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-3">
                  Mission & Vision
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Mission and vision</h2>
                <p className="mt-3 text-lg text-slate-600">A focused product direction built around practical improvements for hospitality teams.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <motion.div 
                variants={popIn} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300 },
                }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scale: 0 }}
                  animate={{ scale: hoveredCard === 'mission' ? 1 : 0 }}
                />
                <motion.div 
                  className="relative z-10"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <RocketLaunchIcon className="h-14 w-14 text-orange-600 mb-4" />
                </motion.div>
                <h3 className="relative z-10 mb-2 text-2xl font-bold text-slate-900">Our Mission</h3>
                <p className="relative z-10 text-base leading-relaxed text-slate-600">To empower restaurants with digital tools that reduce friction, improve guest experience, and increase operational confidence.</p>
                <motion.div 
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  animate={{ x: hoveredCard === 'mission' ? 0 : -10 }}
                >
                  <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                </motion.div>
              </motion.div>

              <motion.div 
                variants={popIn} 
                initial="hidden" 
                whileInView="show" 
                transition={{ delay: 0.12 }} 
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300 },
                }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scale: 0 }}
                  animate={{ scale: hoveredCard === 'vision' ? 1 : 0 }}
                />
                <motion.div 
                  className="relative z-10"
                  whileHover={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <GlobeAltIcon className="h-14 w-14 text-orange-600 mb-4" />
                </motion.div>
                <h3 className="relative z-10 mb-2 text-2xl font-bold text-slate-900">Our Vision</h3>
                <p className="relative z-10 text-base leading-relaxed text-slate-600">To become a trusted restaurant operating platform that scales from independent venues to multi-location businesses.</p>
                <motion.div 
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  animate={{ x: hoveredCard === 'vision' ? 0 : -10 }}
                >
                  <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values with Enhanced Cards */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">
                  Core Values
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What we value</h2>
                <p className="mt-3 text-lg text-slate-600">These principles guide how we build every experience, from digital menus to order flow and analytics.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl"
                  onMouseEnter={() => setHoveredCard(`value-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${value.gradient})` }}
                  />
                  <div className="relative z-10">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${value.bgColor} transition-transform group-hover:scale-110`}>
                      <value.icon className={`h-8 w-8 ${value.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{value.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.description}</p>
                    <p className="mt-3 text-sm font-medium text-slate-700">{value.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {value.bullets.map((bullet, bulletIndex) => (
                        <span
                          key={bulletIndex}
                          className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-700">
                      Learn more
                      <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Stories with Enhanced Cards */}
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
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Stories from our community</h2>
                <p className="mt-3 text-lg text-slate-600">Real restaurant leaders share their experience with MenuGo.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {teamStories.map((story, idx) => (
                <motion.div
                  key={idx}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="relative rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer"
                >
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(story.rating)].map((_, i) => (
                      <StarSolidIcon key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">"{story.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.img 
                      src={story.avatar} 
                      alt={story.name} 
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{story.name}</p>
                      <p className="text-xs text-slate-500">{story.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities with Enhanced Cards */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">
                  Our Approach
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">How our team thinks</h2>
                <p className="mt-3 text-lg text-slate-600">We ship with a product-first mindset and build around the realities of restaurant operations.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {capabilities.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={popIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${item.gradient})` }}
                  />
                  <div className="relative">
                    <motion.div 
                      className={`inline-block p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
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

export default About;