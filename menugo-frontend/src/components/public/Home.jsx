import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
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
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'backOut' } },
};

const heroImage = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const compactNumber = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue);
};

const Home = () => {
  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    orders_processed: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const summary = await getPublicPlatformSummary();
        if (!cancelled && summary && typeof summary === 'object') {
          setPlatformSummary((current) => ({ ...current, ...summary }));
        }
      } catch (e) {
        // ignore
      }

      // Try dashboard totals for a reliable orders count
      try {
        const dashboard = await getPlatformDashboardData();
        if (!cancelled && dashboard && typeof dashboard === 'object') {
          const orders = dashboard.totalOrders ?? dashboard.completedOrders ?? dashboard.total_orders ?? dashboard.completed_orders
          if (orders !== undefined && orders !== null) {
            setPlatformSummary((cur) => ({ ...cur, orders_processed: Number(orders) || cur.orders_processed }))
          }
        }
      } catch (e) {
        // ignore dashboard errors
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
    },
    {
      icon: QrCodeIcon,
      title: 'Smart QR Flows',
      description: 'Instant table QR codes with dine-in, takeaway & prepayment modes.',
    },
    {
      icon: PresentationChartLineIcon,
      title: 'Live Performance Data',
      description: 'Monitor revenue, popular items & staff performance from one dashboard.',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Change prices, availability & descriptions — reflected instantly.',
    },
    {
      icon: Bars3BottomLeftIcon,
      title: 'Operational Simplicity',
      description: 'Clear workflows for waiters, kitchen display & manager oversight.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'GDPR-ready, encrypted payments, and 99.99% uptime SLA.',
    },
  ];

  const advancedFeatures = [
    {
      icon: CreditCardIcon,
      title: 'Split Payments',
      description: 'Let guests split bills seamlessly via QR or waiter assistance.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Multi‑language',
      description: 'Auto‑translate menus into 15+ languages for international guests.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Order Assistant',
      description: 'Smart upsell suggestions & allergen alerts during ordering.',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Reservations Sync',
      description: 'Connect with Google Calendar & booking platforms automatically.',
    },
  ];

  const stats = [
    { value: compactNumber(platformSummary.restaurants_live), label: 'Restaurants Live', suffix: '' },
    { value: compactNumber(platformSummary.orders_processed), label: 'Orders Processed', suffix: '' },
    { value: '98%', label: 'Customer Retention', suffix: '' },
    { value: '24/7', label: 'Priority Support', suffix: '' },
  ];

  const testimonials = [
    {
      quote: "MenuGo completely removed friction from our ordering process. Our staff loves it, and customers keep coming back!",
      name: 'Luca Romano',
      title: 'Owner, Trattoria Roma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: "The analytics dashboard gave us insights we never had before. We redesigned our menu and saw a 22% increase in average check.",
      name: 'Priya Patel',
      title: 'Manager, Spice Route',
      avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: "Onboarding took only 48 hours, and the QR codes work perfectly even during Friday rush hours. A game-changer.",
      name: 'Daniel Kim',
      title: 'GM, Seoul Eats',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const highlights = [
    {
      icon: RocketLaunchIcon,
      title: 'Go live fast',
      text: 'Launch your digital menu in under 10 minutes — no coding.',
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Grow with insights',
      text: 'Real-time reports to boost margins and staff efficiency.',
    },
    {
      icon: BoltIcon,
      title: 'Built for rush hours',
      text: 'Handles 10K+ concurrent orders without breaking a sweat.',
    },
  ];

  const integrations = [
    { name: 'Square', icon: '💰' },
    { name: 'Toast', icon: '🍞' },
    { name: 'Stripe', icon: '💳' },
    { name: 'Uber Eats', icon: '🛵' },
    { name: 'Slack', icon: '💬' },
    { name: 'Google Maps', icon: '🗺️' },
  ];

  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-gray-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.2),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-orange-700 shadow-sm backdrop-blur-sm">
                <SparklesIcon className="h-3.5 w-3.5" />
                Digital dining, reimagined
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Design a better
                <span className="block bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  restaurant journey
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                MenuGo helps restaurants move from paper menus to a complete digital flow with QR ordering,
                instant updates, and practical analytics your team can use every day.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Book Demo
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600"
                >
                  Explore Features
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-600 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                  Fast onboarding support
                </div>
              </div>
            </motion.div>

            <motion.div variants={heroImage} className="relative">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-orange-300/30 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-orange-400/25 blur-2xl" />
              <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D"
                  alt="MenuGo Dashboard"
                  className="h-40 sm:h-48 md:h-64 w-full rounded-xl object-cover shadow-sm"
                />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {highlights.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      className="rounded-xl border border-slate-100 bg-white/70 p-2 shadow-sm backdrop-blur-sm"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.5 }}
                    >
                      <item.icon className="h-4 w-4 text-orange-600" />
                      <p className="mt-1 text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-white via-orange-50/30 to-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
              >
                <p className="text-2xl font-extrabold text-orange-600 sm:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-600 sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl"
            >
              Everything you need to digitize your restaurant
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-slate-600"
            >
              Powerful tools that work together seamlessly — from QR to checkout.
            </motion.p>
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
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 transition-colors group-hover:bg-orange-600">
                  <feature.icon className="h-5 w-5 text-orange-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="bg-gradient-to-br from-slate-50 to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-800"
            >
              <LightBulbIcon className="h-3.5 w-3.5" />
              Next‑gen capabilities
            </motion.div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Go beyond basic ordering
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Premium features designed to maximize revenue and guest satisfaction.
            </p>
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
                className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <feature.icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Get started in 3 simple steps
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From setup to first order — faster than you think.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Sign up and add your restaurant details — takes under 2 minutes.',
                icon: RocketLaunchIcon,
              },
              {
                step: '02',
                title: 'Upload your menu',
                desc: 'Add items, prices, and categories. Bulk import from Excel or PDF.',
                icon: DevicePhoneMobileIcon,
              },
              {
                step: '03',
                title: 'Print QR codes & go live',
                desc: 'Download your table QR codes, place them, and start accepting orders.',
                icon: QrCodeIcon,
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl font-black text-orange-200">{step.step}</span>
                  <step.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations
      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Works with your stack
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Seamless integrations with the tools you already use.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {integrations.map((integration, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 shadow-sm"
              >
                <span className="text-xl">{integration.icon}</span>
                <span className="text-xs font-medium text-slate-700">{integration.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Loved by restaurant teams
            </h2>
            <p className="mt-2 text-sm text-slate-600">Real feedback from happy customers.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <StarIcon key={idx} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <div className="flex items-start gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-200" />
                  <div>
                    <p className="text-sm text-slate-700">"{t.quote}"</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section
      <section className="relative overflow-hidden bg-slate-900 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(251,146,60,0.2),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold tracking-tight text-white md:text-3xl"
          >
            Ready to level up your restaurant experience?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-2xl text-sm text-slate-200"
          >
            Join hundreds of restaurant owners who streamlined their operations with MenuGo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-orange-400"
            >
              Start Free Trial
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:text-white"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section> */}

      <PublicFooter />
    </div>
  );
};

export default Home;