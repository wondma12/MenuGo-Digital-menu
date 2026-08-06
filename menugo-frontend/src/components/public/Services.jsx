import {useEffect, useState, useRef} from 'react'
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
import { 
  QrCode, Smartphone, ChefHat, Bell, CreditCard, Star,
  BarChart3, Users, Zap, MessageSquare, Shield,
  Monitor, Tablet, ShoppingCart, Check
} from 'lucide-react';

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
  const [hoveredStep, setHoveredStep] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState("customer");
  const [activeDevice, setActiveDevice] = useState("phone");

  // Features Data
  const features = [
    {
      icon: DevicePhoneMobileIcon,
      title: "Digital Menu Creation",
      description: "Create polished menus with images, descriptions, categories, and quick edits.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
      details: ['Drag-and-drop layout', 'Menu sections', 'Image support', 'Easy updates']
    },
     {
      icon: Zap,
      title: "QR Ordering System",
      description: 'Generate QR experiences for tables, promotions, and menu access in seconds.',
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      details: ['Table-specific QR codes', 'Printable QR assets', 'Scan tracking', 'Fast guest access']
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage your team efficiently with role-based access, scheduling, and performance tracking.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      gradient: "from-green-500 to-emerald-500",
      details: ["Role permissions", "Shift scheduling", "Performance metrics", "Team communication"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: 'See revenue, sales trends, customer activity, and top items from one dashboard.',
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      details: ['Live dashboards', 'Revenue reports', 'Menu performance', 'Customer trends']
    },
    
   
    {
      icon: Zap,
      title: "Order Management",
      description: "Streamline your order flow from customer to kitchen. Real-time tracking and automated notifications.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      details: ["Real-time tracking", "Kitchen display", "Order prioritization", "Auto-notifications"]
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: 'Use a stable, secure system with encrypted sessions and reliable access control.',
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      gradient: "from-indigo-500 to-violet-500",
      details: ['Secure sessions', 'Data protection', 'Role permissions', 'Backup friendly']
    },
    // {
    //   icon: GlobeAltIcon,
    //   title: "Multi-Location",
    //   description: "Manage multiple restaurant locations from a single dashboard. Consistent experience across all outlets.",
    //   color: "from-teal-500 to-cyan-500",
    //   bgColor: "bg-teal-50",
    //   iconColor: "text-teal-600",
    //   gradient: "from-teal-500 to-cyan-500",
    //   details: ["Central dashboard", "Location analytics", "Menu syncing", "Cross-location reports"]
    // }
  ];

  // Product Showcase Tabs
  const tabs = [
    { id: "customer", label: "For Customers", icon: Users },
    { id: "staff", label: "For Staff", icon: ChefHat },
    { id: "owner", label: "For Owners", icon: BarChart3 }
  ];

  const showcaseContent = {
    customer: {
      title: "Seamless Customer Experience",
      description: "Customers scan, browse, order, and pay - all from their phone. No app download required.",
      features: [
        "QR code scanning from table",
        "Beautiful digital menu with images",
        "Easy customization of orders",
        "Multiple payment options",
        "Real-time order tracking",
        "Feedback submission"
      ]
    },
    staff: {
      title: "Efficient Staff Dashboard",
      description: "Real-time order management, table tracking, and communication tools for your team.",
      features: [
        "Instant order notifications",
        "Kitchen display system",
        "Table management",
        "Order prioritization",
        "Staff communication",
        "Performance tracking"
      ]
    },
    owner: {
      title: "Powerful Analytics Dashboard",
      description: "Get real-time insights into sales, performance, and customer behavior across all locations.",
      features: [
        "Real-time revenue tracking",
        "Customer analytics",
        "Staff performance metrics",
        "Menu optimization insights",
        "Multi-location dashboard",
        "Exportable reports"
      ]
    }
  };

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
  icon: MessageSquare,
  step: "03",
  title: "Waiter Receives Order",
  description: "Order instantly appears on the waiter's device. Waiters can view, prioritize, and track order status in real-time.",
  color: "from-orange-500 to-red-500",
  bgColor: "bg-orange-50",
  iconColor: "text-orange-600",
  gradient: "from-orange-500 to-red-500",
  image: "💁"
},

    {
      icon: ChefHat,
      step: "04",
      title: "Kitchen Receives Order",
      description: "verified Order instantly appears on the kitchen display. Chefs can prioritize and track preparation time.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      image: "👨‍🍳"
    },
    {
      icon: Bell,
      step: "05",
      title: "Real-Time Updates",
      description: "Customer receives live updates on order status. Staff gets notified when orders are ready for serving.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      gradient: "from-green-500 to-emerald-500",
      image: "🔔"
    },
    // {
    //   icon: CreditCard,
    //   step: "05",
    //   title: "Secure Payment",
    //   description: "Multiple payment options available. Customers can pay via card, digital wallet, or split the bill.",
    //   color: "from-indigo-500 to-violet-500",
    //   bgColor: "bg-indigo-50",
    //   iconColor: "text-indigo-600",
    //   gradient: "from-indigo-500 to-violet-500",
    //   image: "💳"
    // },
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

        
        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                Powerful Features
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Our comprehensive suite of tools is designed to streamline your restaurant 
                operations and enhance customer experience.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setActiveFeature(index)}
                  className="group relative"
                >
                  <div className={`relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer
                    ${activeFeature === index 
                      ? 'border-orange-400 shadow-2xl shadow-orange-500/10 bg-white scale-105' 
                      : 'border-slate-100 hover:border-orange-300/30 bg-white hover:shadow-xl'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    <AnimatePresence>
                      {activeFeature === index && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 pt-4 border-t border-slate-100"
                        >
                          {feature.details.map((detail, i) => (
                            <motion.li
                              key={detail}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              {detail}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>

                    <button className="mt-6 text-orange-600 font-semibold text-sm flex items-center gap-1 group/btn hover:text-orange-700">
                      Learn more
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-orange-50/20 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                Product Showcase
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Designed for{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Everyone
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Beautiful interfaces for customers, staff, and owners
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/25'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image/Visual */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {activeTab === 'customer' ? 'MenuGo App' : activeTab === 'staff' ? 'Staff Dashboard' : 'Analytics Dashboard'}
                      </h3>
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Live</span>
                    </div>
                    
                    {activeTab === 'customer' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl">
                          <QrCode className="w-8 h-8 text-orange-600" />
                          <div>
                            <p className="font-semibold text-sm text-slate-900">Scan to Order</p>
                            <p className="text-xs text-slate-500">Table T7 • 2 guests</p>
                          </div>
                        </div>
                        {['Margherita Pizza', 'Caesar Salad', 'Sparkling Water'].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div>
                              <p className="font-medium text-sm text-slate-900">{item}</p>
                              <p className="text-xs text-slate-500">${(12 + i * 3).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="w-6 h-6 rounded-full bg-slate-200 hover:bg-orange-500 hover:text-white transition-colors">-</button>
                              <span className="text-sm font-semibold">1</span>
                              <button className="w-6 h-6 rounded-full bg-slate-200 hover:bg-orange-500 hover:text-white transition-colors">+</button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-4">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span className="text-orange-600">$24.00</span>
                          </div>
                          <button className="w-full mt-3 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-600/30 transition-all">
                            Place Order
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'staff' && (
                      <div className="space-y-3">
                        {[
                          { table: "T7", items: "2x Pizza", time: "5 min", color: "bg-orange-100 text-orange-700" },
                          { table: "T3", items: "Salad + Drink", time: "2 min", color: "bg-red-100 text-red-700" },
                          { table: "T12", items: "Pasta", time: "8 min", color: "bg-yellow-100 text-yellow-700" }
                        ].map((order, i) => (
                          <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl hover:bg-orange-50 transition-colors">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-orange-600">
                              {order.table}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900">{order.items}</p>
                              <p className="text-xs text-slate-500">{order.time} ago</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${order.color}`}>Preparing</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'owner' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-900">Revenue</h4>
                          <span className="text-green-600 text-sm font-semibold">+12.5%</span>
                        </div>
                        <div className="h-32 bg-slate-50 rounded-xl flex items-end p-4 gap-2">
                          {[65, 75, 85, 70, 90, 95, 80].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              whileInView={{ height: `${h}%` }}
                              className="flex-1 bg-orange-200 rounded-t-lg"
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Total Orders", value: "847", color: "text-blue-600" },
                            { label: "Avg. Value", value: "$42", color: "text-green-600" }
                          ].map((stat, i) => (
                            <div key={i} className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-xs text-slate-500">{stat.label}</p>
                              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Content */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">
                      {showcaseContent[activeTab].title}
                    </h3>
                    <p className="text-lg text-slate-600 mb-8">
                      {showcaseContent[activeTab].description}
                    </p>

                    <div className="space-y-4">
                      {showcaseContent[activeTab].features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/contact"
                        className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-semibold shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
                      >
                        Learn More
                        <ArrowRightIcon className="h-5 w-5" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Core Services - Enhanced Cards
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
        </section> */}

        {/* Extended Capabilities
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
        </section> */}

        {/* Testimonials - Enhanced
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
        </section> */}

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

export default Services;