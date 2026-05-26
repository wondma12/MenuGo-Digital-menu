import React from 'react';
import { motion } from 'framer-motion';
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
  CurrencyDollarIcon,
  WifiIcon,
  CheckBadgeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const About = () => {
  const values = [
    { icon: HeartIcon, title: 'Customer First', description: 'We design every screen around the real needs of restaurant teams and guests.' },
    { icon: LightBulbIcon, title: 'Innovation', description: 'We keep the platform practical, modern, and easy to adopt in busy environments.' },
    { icon: UsersIcon, title: 'Collaboration', description: 'We build for kitchens, waiters, owners, and diners as one connected system.' },
    { icon: GlobeAltIcon, title: 'Global Impact', description: 'We want to help restaurants everywhere deliver smoother, smarter service.' },
  ]

  const milestones = [
    { year: '2024', title: 'Started MenuGo', text: 'Built to replace paper menus with a smoother digital flow.', icon: RocketLaunchIcon },
    { year: '2025', title: 'Expanded Workflows', text: 'Added live orders, kitchen visibility, and staff coordination.', icon: ClockIcon },
    { year: 'Now', title: 'Growing With Restaurants', text: 'Helping teams deliver faster service and clearer analytics.', icon: ChartBarIcon },
  ]

  const metrics = [
    { value: '500+', label: 'Active Restaurants' },
    { value: '2.3K+', label: 'Team Members Enabled' },
    { value: '99.99%', label: 'Platform Uptime' },
    { value: '24/7', label: 'Priority Support' },
  ]

  const capabilities = [
    { icon: BuildingStorefrontIcon, title: 'Built for hospitality', text: 'Designed for front-of-house speed, kitchen clarity, and management control.' },
    { icon: ChartBarIcon, title: 'Actionable analytics', text: 'See what sells, where delays happen, and how to improve service quickly.' },
    { icon: ShieldCheckIcon, title: 'Secure by design', text: 'Protected sessions and stable infrastructure for day-to-day restaurant operations.' },
  ]

  const teamStories = [
    {
      quote: "MenuGo cut our ticket times by 30% and made weekend rushes effortless.",
      name: "Sarah Chen",
      role: "Owner, The Noodle House",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "The analytics dashboard helped us increase average check size by 18% in two months.",
      name: "Marcus Johnson",
      role: "Operations Director, Burger & Co.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "Finally a QR ordering system that waiters actually enjoy using.",
      name: "Elena Rossi",
      role: "General Manager, Pizzeria Centrale",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ]

  const impactStats = [
    { icon: CurrencyDollarIcon, value: '22%', label: 'Avg. revenue increase' },
    { icon: ClockIcon, value: '35%', label: 'Faster table turns' },
    { icon: WifiIcon, value: '100%', label: 'Digital adoption rate' },
    { icon: CheckBadgeIcon, value: '98%', label: 'Customer satisfaction' },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.2),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={fadeInDown} className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4" />
                About MenuGo
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                We help restaurants run a cleaner,
                <span className="block bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">faster digital service flow</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                MenuGo brings menus, ordering, and operations into one polished system so teams can work faster
                and guests can enjoy a smoother dining experience.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700">
                  Contact Us
                  <ArrowRightIcon className="h-5 w-5" />
                </a>
                <a href="/services" className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600">
                  See Services
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {metrics.map((item, index) => (
              <motion.div
                key={item.label}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <p className="text-3xl font-extrabold text-orange-600 sm:text-4xl">{item.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-800">
                <HeartIcon className="h-4 w-4" />
                Our Story
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Built from real restaurant pain points</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                MenuGo was created to solve the everyday friction that slows restaurants down: printing costs,
                outdated menus, scattered coordination, and lack of visibility during service.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                We focused on a simple idea: give staff and owners one place to update content, manage orders,
                and make better decisions without extra complexity.
              </p>
              <div className="mt-8 space-y-4">
                {milestones.map((item, idx) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                      <item.icon className="h-7 w-7 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-orange-600">{item.year}</span>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={heroImage} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <div className="absolute -left-4 -top-4 h-28 w-28 rounded-2xl bg-orange-300/30 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-orange-400/25 blur-2xl" />
              <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                  alt="About MenuGo"
                  className="h-auto w-full rounded-xl object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Mission and vision</h2>
            <p className="mt-3 text-lg text-slate-600">A focused product direction built around practical improvements for hospitality teams.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.div variants={subtleFloat} initial="hidden" whileInView="show" viewport={{ once: true }} className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <RocketLaunchIcon className="mb-4 h-14 w-14 text-orange-600" />
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="leading-relaxed text-slate-600">To empower restaurants with digital tools that reduce friction, improve guest experience, and increase operational confidence.</p>
            </motion.div>

            <motion.div variants={subtleFloat} initial="hidden" whileInView="show" transition={{ delay: 0.12 }} viewport={{ once: true }} className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <GlobeAltIcon className="mb-4 h-14 w-14 text-orange-600" />
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="leading-relaxed text-slate-600">To become a trusted restaurant operating platform that scales from independent venues to multi-location businesses.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What we value</h2>
            <p className="mt-3 text-lg text-slate-600">These principles shape every product decision and customer interaction.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <value.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-orange-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Real impact, measured</h2>
            <p className="mt-3 text-lg text-slate-700">Numbers from restaurants using MenuGo every day.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {impactStats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl bg-white p-6 text-center shadow-md"
              >
                <stat.icon className="mx-auto h-8 w-8 text-orange-600" />
                <p className="mt-3 text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stories */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Stories from our community</h2>
            <p className="mt-3 text-lg text-slate-600">Real restaurant leaders share their experience with MenuGo.</p>
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
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700">"{story.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <img src={story.avatar} alt={story.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-200" />
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

      {/* Capabilities */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">How our team thinks</h2>
            <p className="mt-3 text-lg text-slate-600">We ship with a product-first mindset and build around the realities of restaurant operations.</p>
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
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <item.icon className="h-12 w-12 text-orange-600" />
                <h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(251,146,60,0.2),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2 variants={fadeInUp} className="text-3xl font-black text-white md:text-4xl">
            Ready to see MenuGo in action?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mx-auto mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
            Connect with us to explore a cleaner restaurant experience built for speed and clarity.
          </motion.p>
          <motion.div variants={popIn} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3 font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-orange-400">
              Get in Touch
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a href="/services" className="inline-flex items-center rounded-xl border border-slate-600 px-7 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:text-white">
              View Services
            </a>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default About;