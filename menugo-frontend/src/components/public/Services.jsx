import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { getPublicPlatformSummary, getPlatformDashboardData } from '../../services/analyticsService';
import { staggerContainer, fadeInUp, popIn, hoverLift, heroImage } from '../common/motionVariants';

const Services = () => {
  const services = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Digital Menu Creation',
      description: 'Create polished menus with images, descriptions, categories, and quick edits.',
      features: ['Drag-and-drop layout', 'Menu sections', 'Image support', 'Easy updates'],
      accent: 'from-sky-100 to-sky-50 text-sky-700',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Ordering System',
      description: 'Generate QR experiences for tables, promotions, and menu access in seconds.',
      features: ['Table-specific QR codes', 'Printable QR assets', 'Scan tracking', 'Fast guest access'],
      accent: 'from-emerald-100 to-emerald-50 text-emerald-700',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'See revenue, sales trends, customer activity, and top items from one dashboard.',
      features: ['Live dashboards', 'Revenue reports', 'Menu performance', 'Customer trends'],
      accent: 'from-amber-100 to-amber-50 text-amber-700',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Push menu changes, pricing, and availability updates instantly across devices.',
      features: ['Instant sync', 'Scheduled changes', 'Availability control', 'Version history'],
      accent: 'from-orange-100 to-orange-50 text-orange-700',
    },
    {
      icon: UsersIcon,
      title: 'Staff Management',
      description: 'Coordinate staff roles, shifts, and responsibilities with fewer manual steps.',
      features: ['Role access', 'Shift planning', 'Activity logs', 'Team visibility'],
      accent: 'from-rose-100 to-rose-50 text-rose-700',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Use a stable, secure system with encrypted sessions and reliable access control.',
      features: ['Secure sessions', 'Data protection', 'Role permissions', 'Backup friendly'],
      accent: 'from-cyan-100 to-cyan-50 text-cyan-700',
    },
  ];

  const extendedServices = [
    {
      icon: CreditCardIcon,
      title: 'Split Payments',
      description: 'Allow guests to split bills easily via QR or waiter assistance.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Order Assistant',
      description: 'Smart upsell suggestions and allergen alerts during ordering.',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Reservations Sync',
      description: 'Integrate with Google Calendar and booking platforms automatically.',
    },
    {
      icon: LanguageIcon,
      title: 'Multi-language Menus',
      description: 'Auto-translate menus into 15+ languages for international guests.',
    },
  ];

  const pricing = [
    {
      name: 'Basic',
      price: '$29',
      period: 'month',
      features: ['Up to 50 menu items', 'QR code generation', 'Basic analytics', 'Email support'],
      recommended: false,
    },
    {
      name: 'Premium',
      price: '$79',
      period: 'month',
      features: ['Unlimited menu items', 'Advanced analytics', 'Staff management', 'Priority support', 'Custom branding', 'API access'],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Custom',
      features: ['Everything in Premium', 'Multi-location support', 'Dedicated account manager', 'SLA agreement', 'Custom integration', '24/7 phone support'],
      recommended: false,
    },
  ];

  const process = [
    { icon: BuildingStorefrontIcon, title: 'Set up your space', text: 'Add your restaurant, tables, and menu structure.' },
    { icon: QrCodeIcon, title: 'Go live with QR', text: 'Place QR codes and let guests access menus instantly.' },
    { icon: TrophyIcon, title: 'Improve continuously', text: 'Use analytics to refine service and grow revenue.' },
  ];

  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    active_users: 2300,
    uptime: '99.99%',
    support: '24/7',
    orders_processed: 0,
  })

  const compactNumber = (value) => {
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return value || '0'
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue)
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const summary = await getPublicPlatformSummary()
        if (cancelled) return
        if (summary && typeof summary === 'object') {
          setPlatformSummary((cur) => ({ ...cur, ...summary }))
        }
        // Try fetching dashboard totals (may require no auth depending on backend)
        try {
          const dashboard = await getPlatformDashboardData()
          if (!cancelled && dashboard && typeof dashboard === 'object') {
            const orders = dashboard.totalOrders ?? dashboard.completedOrders ?? dashboard.total_orders ?? dashboard.completed_orders
            if (orders !== undefined && orders !== null) {
              setPlatformSummary((cur) => ({ ...cur, orders_processed: Number(orders) || cur.orders_processed }))
            }
          }
        } catch (e) {
          // ignore dashboard errors
        }
      } catch (e) {
        // ignore - keep defaults
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const restaurantsCount = (platformSummary.active_restaurants ?? platformSummary.restaurants_live ?? platformSummary.total_restaurants ?? platformSummary.restaurants) || platformSummary.restaurants_live || 0
  const activeUsersCount = (platformSummary.active_users ?? platformSummary.team_members_enabled ?? platformSummary.total_users ?? platformSummary.users) || platformSummary.active_users || 0

  const stats = [
    { value: `${compactNumber(restaurantsCount)}+`, label: 'Restaurants live' },
    { value: `${compactNumber(activeUsersCount)}+`, label: 'Active users' },
    { value: `${compactNumber(platformSummary.orders_processed)}+`, label: 'Orders processed' },
    { value: platformSummary.uptime || '99.99%', label: 'Uptime' },
    {    value: platformSummary.support || '24/7', label: 'Support' },
  ];

  const testimonials = [
    {
      quote: "The QR ordering system cut our wait times by half. Customers love the speed!",
      name: 'Luca Romano',
      title: 'Owner, Trattoria Roma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: "Analytics helped us identify our top dishes and increase average check by 22%.",
      name: 'Priya Patel',
      title: 'Manager, Spice Route',
      avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: "Staff management features made scheduling effortless. A game-changer for us.",
      name: 'Daniel Kim',
      title: 'GM, Seoul Eats',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
    },
  ];

  // const integrations = [
  //   { name: 'Square', icon: '💰' },
  //   { name: 'Toast', icon: '🍞' },
  //   { name: 'Stripe', icon: '💳' },
  //   { name: 'Uber Eats', icon: '🛵' },
  //   { name: 'Slack', icon: '💬' },
  //   { name: 'Google Maps', icon: '🗺️' },
  // ];

  const faqs = [
    { q: 'How fast can I set up MenuGo?', a: 'Most restaurants go live within 24 hours. Our onboarding team guides you every step.' },
    { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade anytime. No hidden fees.' },
    { q: 'Do I need any hardware?', a: 'No, MenuGo works on existing smartphones, tablets, and printers.' },
    { q: 'Is there a contract?', a: 'No long-term contracts. Cancel anytime with one month notice.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.2),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700 backdrop-blur-sm">
                <SparklesIcon className="h-3.5 w-3.5" />
                Services & Pricing
              </div>

              <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Tools that make your
                <span className="block bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">restaurant feel effortless</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                MenuGo combines digital menus, QR ordering, analytics, and team coordination into one clean system.
                The result is faster service, less manual work, and a better guest experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Book a Demo
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600"
                >
                  View Pricing
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-600"
                >
                  <PlayCircleIcon className="h-4 w-4" />
                  Talk to Sales
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-600 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                  Fast setup and onboarding
                </div>
              </div>
            </motion.div>

            <motion.div variants={heroImage} className="relative">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-orange-300/30 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-orange-400/25 blur-2xl" />
              <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D"
                  alt="MenuGo services preview"
                  className="h-auto w-full rounded-xl object-cover"
                />
                <div className="mt-3 flex items-center gap-2 sm:gap-3 overflow-x-auto">
                  {stats.map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="min-w-[100px] rounded-xl border border-slate-100 bg-white/70 p-2 text-center shadow-sm backdrop-blur-sm flex-shrink-0"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                    >
                      <p className="text-sm font-extrabold text-orange-600 sm:text-base">{item.value}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-white via-orange-50/30 to-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {process.map((item, index) => (
              <motion.div
                key={item.title}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <item.icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Everything your service team needs</h2>
            <p className="mt-2 text-sm text-slate-600">
              A complete toolkit to digitize restaurant operations while keeping the interface simple and polished.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${service.accent}`}>
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{service.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-800"
                >
                  Learn more
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extended Capabilities */}
      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Advanced capabilities</h2>
            <p className="mt-2 text-sm text-slate-600">Powerful features to elevate your guest experience.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {extendedServices.map((service, idx) => (
              <motion.div
                key={idx}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <service.icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      {/* <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Works with your stack</h2>
            <p className="mt-2 text-sm text-slate-600">Seamless integrations with tools you already use.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {integrations.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-5 py-2.5 shadow-sm"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium text-slate-700">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="bg-orange-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Trusted by restaurant owners</h2>
            <p className="mt-2 text-sm text-slate-700">Real results from real teams.</p>
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
                    <svg key={idx} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-700">"{t.quote}"</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-orange-200" />
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

      {/* Pricing */}
      <section id="pricing" className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Simple pricing that scales with you</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick a plan that fits your restaurant today and upgrade when you need more locations or automation.
            </p>
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
                className={`relative overflow-hidden rounded-3xl border bg-white shadow-lg transition-all hover:shadow-xl ${
                  plan.recommended ? 'border-orange-300 ring-2 ring-orange-500/20' : 'border-slate-200'
                }`}
              >
                {plan.recommended && (
                  <div className="bg-orange-600 px-4 py-1.5 text-center text-xs font-semibold text-white">Recommended</div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                    {plan.period !== 'Custom' && <span className="pb-1 text-sm text-slate-500">/{plan.period}</span>}
                  </div>
                  <ul className="mt-5 space-y-2.5 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                      plan.recommended
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing footnote */}
          <p className="mt-6 text-center text-sm text-slate-500">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-sm text-slate-600">Everything you need to know before getting started.</p>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="relative overflow-hidden bg-slate-900 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(251,146,60,0.2),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2 variants={fadeInUp} className="text-2xl font-black text-white md:text-3xl">
            Ready to upgrade your restaurant workflow?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            Start with a flexible plan, then scale your menus, analytics, and team operations as your business grows.
          </motion.p>
          <motion.div variants={popIn} className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

export default Services;