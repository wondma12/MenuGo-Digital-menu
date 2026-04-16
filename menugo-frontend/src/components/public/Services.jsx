import React from 'react';
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
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { staggerContainer, fadeInUp, popIn, hoverLift, heroImage, subtleFloat } from '../common/motionVariants';
const Services = () => {
  const services = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Digital Menu Creation',
      description: 'Create stunning digital menus with photos, descriptions, and pricing. Easy to update and manage.',
      features: ['Drag-and-drop editor', 'Multiple menu layouts', 'Image gallery', 'Category management'],
      color: 'blue',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Code System',
      description: 'Generate unique QR codes for tables, menus, and promotions. Track scans in real-time.',
      features: ['Custom QR codes', 'Table-specific codes', 'Scan analytics', 'Printable formats'],
      color: 'green',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'Get detailed insights into customer behavior, popular items, and revenue trends.',
      features: ['Real-time dashboard', 'Sales reports', 'Customer analytics', 'Performance metrics'],
      color: 'purple',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Updates',
      description: 'Update menu items, prices, and availability instantly across all customer devices.',
      features: ['Instant sync', 'Scheduled updates', 'Version control', 'Change history'],
      color: 'orange',
    },
    {
      icon: UsersIcon,
      title: 'Staff Management',
      description: 'Manage your team, assign roles, and track performance efficiently.',
      features: ['Role-based access', 'Shift scheduling', 'Performance tracking', 'Activity logs'],
      color: 'red',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data and secure payment processing.',
      features: ['SSL encryption', 'GDPR compliant', 'Secure payments', 'Data backup'],
      color: 'teal',
    },
    {
      icon: CreditCardIcon,
      title: 'Payment Integration',
      description: 'Accept payments seamlessly through multiple payment gateways.',
      features: ['Stripe integration', 'Mobile payments', 'Digital receipts', 'Refund management'],
      color: 'indigo',
    },
    {
      icon: BellAlertIcon,
      title: 'Order Notifications',
      description: 'Real-time order alerts for kitchen and waitstaff.',
      features: ['Push notifications', 'Email alerts', 'SMS updates', 'Sound alerts'],
      color: 'pink',
    },
    {
      icon: DocumentTextIcon,
      title: 'Digital Receipts',
      description: 'Send digital receipts via email or SMS automatically.',
      features: ['Email receipts', 'SMS receipts', 'PDF invoices', 'Order history'],
      color: 'yellow',
    },
  ];

  const pricing = [
    {
      name: 'Basic',
      price: '$29',
      period: 'month',
      features: [
        'Up to 50 menu items',
        'QR code generation',
        'Basic analytics',
        'Email support',
      ],
      recommended: false,
    },
    {
      name: 'Premium',
      price: '$79',
      period: 'month',
      features: [
        'Unlimited menu items',
        'Advanced analytics',
        'Staff management',
        'Priority support',
        'Custom branding',
        'API access',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Custom',
      features: [
        'Everything in Premium',
        'Multi-location support',
        'Dedicated account manager',
        'SLA agreement',
        'Custom integration',
        '24/7 phone support',
      ],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      {/* Hero Section - white background + movable hero image */}
      <section className="pt-20 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl">
                We provide a complete digital solution designed to help modern restaurants streamline operations, enhance customer experience, and grow their business. From online ordering systems to menu management and real-time analytics, our platform empowers restaurants to operate efficiently in today’s digital world.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-6 flex items-center gap-4">
                <a href="/contact" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-lg shadow hover:bg-primary-700 transition">Get Started</a>
                <a href="/services" className="text-primary-600 font-medium">Learn more</a>
              </motion.div>
            </motion.div>

            <motion.div className="flex justify-center lg:justify-end" initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div
                className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-gray-50"
                variants={heroImage}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.995 }}
                drag="x"
                dragConstraints={{ left: -30, right: 30 }}
                dragElastic={0.12}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              >
                <motion.img
                  src="/placeholder-food.jpg"
                  alt="Digital menu on tablet - placeholder"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What We Offer</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              Comprehensive features to digitize your restaurant operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
                {...hoverLift}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/contact" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline">
                    Learn more
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple Pricing</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your restaurant's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08 }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-primary-600 transform scale-105' : ''
                }`}
                {...hoverLift}
              >
                {plan.recommended && (
                  <div className="bg-primary-600 text-white text-center py-2 text-sm font-semibold">
                    Recommended
                  </div>
                )}
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period !== 'Custom' && (
                      <span className="text-gray-500">/{plan.period}</span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`mt-8 w-full inline-block text-center px-6 py-2 rounded-lg transition-colors ${
                      plan.recommended
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'border-2 border-gray-300 text-gray-700 hover:border-primary-600 hover:text-primary-600'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Start your 14-day free trial today. No credit card required.
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

export default Services;