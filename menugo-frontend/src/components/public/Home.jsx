import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  staggerContainer,
  fadeInUp,
  heroImage,
  popIn,
  hoverLift,
} from '../common/motionVariants'
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { 
  ArrowRightIcon, 
  CheckBadgeIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Digital Menus',
      description: 'Create beautiful digital menus accessible instantly on smartphones.',
      color: 'blue',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Code Integration',
      description: 'Generate QR codes for tables and menus with real-time tracking.',
      color: 'green',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Track orders, revenue, and customer behavior in real-time.',
      color: 'purple',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Update menu items and prices instantly across all devices.',
      color: 'orange',
    },
    {
      icon: UsersIcon,
      title: 'Staff Management',
      description: 'Manage waitstaff and optimize table assignments.',
      color: 'red',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data.',
      color: 'teal',
    },
  ];

  const stats = [
    { value: '2+', label: 'Restaurants' },
    { value: '23+', label: 'Happy Customers' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  const testimonials = [
    {
      quote: "MenuGo transformed how we serve customers — orders are faster and happier!",
      name: 'Luca Romano',
      title: 'Owner, Trattoria Roma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    {
      quote: "The analytics helped us optimize top-selling dishes — revenue went up 18%.",
      name: 'Priya Patel',
      title: 'Manager, Spice Route',
      avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80'
    },
    {
      quote: "Easy QR menus and staff management — onboarding was a breeze.",
      name: 'Daniel Kim',
      title: 'GM, Seoul Eats',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <PublicHeader />
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Digital Menu Solution for{' '}
                <span className="text-primary-600">Modern Restaurants</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Transform your restaurant with QR code menus, real-time order management, 
                and powerful analytics. Increase efficiency and enhance customer experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/Contact"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <a
                  href="/services"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">14-day free trial</span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={heroImage} className="relative">
              <img
                src="/images/hero-illustration.svg"
                alt="MenuGo Dashboard"
                className="w-full h-auto rounded-2xl shadow-2xl"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80' }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                {...hoverLift}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary-600">{stat.value}</p>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Restaurants Say</h2>
            <p className="text-gray-600 mt-2">Real feedback from customers using MenuGo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06 }}
                {...hoverLift}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="text-gray-700">"{t.quote}"</p>
                    <p className="mt-3 text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose MenuGo?</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              Everything you need to digitize your restaurant operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.06 }}
                {...hoverLift}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of restaurants already using MenuGo to enhance their dining experience.
          </p>
          <Link
            to="/Contact"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
};

export default Home;