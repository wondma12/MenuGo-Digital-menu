import {useState, useRef, useEffect} from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  PencilIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  StarIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  HeartIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { createPublicContact } from '../../services/contactService';

// Loading Skeleton Component
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full w-full"></div>
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [activeFaq, setActiveFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email is invalid';
    if (!formData.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateForm();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      const resp = await createPublicContact(payload);
      if (resp && resp.success) {
        setSubmitted(true);
      } else {
        setError((resp && resp.message) || 'Failed to send message');
      }
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      details: 'support@menugo.com',
      sub: 'sales@menugo.com',
      action: 'mailto:support@menugo.com',
      actionText: 'support@menugo.com',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      sub: 'Mon-Fri, 9am-6pm EST',
      action: 'tel:+15551234567',
      actionText: 'Call Now',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      details: '123 Main Street',
      sub: 'Addis Abeba, AA 1000',
      action: 'https://www.google.com/maps/dir/?api=1&destination=9.0320,38.7469',
      actionText: 'Get Directions',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: ClockIcon,
      title: 'Support Hours',
      details: '24/7 Support',
      sub: 'Email support available 24/7',
      action: null,
      actionText: null,
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  const faqs = [
    {
      question: 'How do I get started with MenuGo?',
      answer: 'Simply sign up for a free trial, create your digital menu, generate QR codes, and you\'re ready to go! Our onboarding team will guide you through the entire process.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees. You only pay for your chosen subscription plan. All features are included in your monthly subscription.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time with no cancellation fees. Your menu will remain active until the end of your billing period.',
    },
    {
      question: 'Do you offer customer support?',
      answer: 'Yes, we offer 24/7 email support for all customers and priority phone support for premium plan customers. Our average response time is under 2 hours.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely! We use enterprise-grade encryption and security practices. Your restaurant data and customer information are always protected.',
    },
    {
      question: 'Can I customize the menu design?',
      answer: 'Yes! Our platform allows full customization including colors, fonts, logos, and layout to match your restaurant\'s brand identity.',
    },
  ];

  const socialLinks = [
    { icon: Twitter, name: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Facebook, name: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Instagram, name: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, name: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Youtube, name: 'YouTube', color: 'hover:text-red-600' },
  ];

  const stats = [
    { value: '500+', label: 'Restaurants', icon: BuildingStorefrontIcon },
    { value: '98%', label: 'Satisfaction', icon: HeartIcon },
    { value: '24/7', label: 'Support', icon: UsersIcon },
    { value: '15+', label: 'Countries', icon: GlobeAltIcon },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <PublicHeader />

      <div ref={containerRef}>
        {/* Hero Section - Enhanced */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -200, 0],
                  x: [0, Math.random() * 80 - 40, 0],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: Math.random() * 8,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-white mb-4"
              >
                <SparklesIcon className="h-4 w-4 animate-pulse" />
                Get in touch
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Let's talk
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-base text-orange-100 max-w-2xl mx-auto sm:text-lg"
              >
                We're here to answer your questions, schedule a demo, or help you get started with MenuGo.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href="#contact-form"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 shadow-lg transition-all hover:shadow-xl"
                  >
                    Send a Message
                    <EnvelopeIcon className="h-4 w-4" />
                  </a>
                </motion.div>
              </motion.div>

              {/* Stats below hero */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-wrap justify-center gap-6"
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/90">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{stat.value}</span>
                    <span className="text-xs text-white/70">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Info Cards - Enhanced */}
        <section className="py-10 bg-white -mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredInfo(index)}
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${info.gradient})` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredInfo === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className={`relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r ${info.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                    <info.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="relative text-base font-bold text-slate-900">{info.title}</h3>
                  <p className="relative mt-1 text-sm text-slate-600 font-medium">{info.details}</p>
                  <p className="relative text-xs text-slate-500">{info.sub}</p>
                  
                  {info.action && (
                    <motion.a
                      href={info.action}
                      className="relative mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-600 transition-colors hover:text-orange-800"
                      target={info.title === 'Visit Us' ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      whileHover={{ x: 4 }}
                    >
                      {info.actionText}
                      <ArrowRightIcon className="h-3 w-3" />
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form + Map Section - Enhanced */}
        <section id="contact-form" className="py-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Form - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
                  <p className="mt-1 text-sm text-slate-600">We'll reply within 24 hours. For urgent issues, use live chat.</p>
                </motion.div>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4"
                    >
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="font-medium">Thank you — we'll get back to you shortly.</span>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex items-center gap-2 text-sm text-red-700">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        <span className="font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name *</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300"
                          placeholder="Your name"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address *</label>
                      <div className="relative group">
                        <EnvelopeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300"
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone (optional)</label>
                      <div className="relative group">
                        <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                      <div className="relative group">
                        <PencilIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300"
                          placeholder="How can we help?"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div whileHover={{ scale: 1.005 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Message *</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-orange-300"
                      placeholder="Please describe your question or concern..."
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Right column: Map + Live Chat + Newsletter - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Map - Enhanced */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 transition-all hover:shadow-2xl"
                >
                  <div className="h-56 w-full bg-slate-200 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                    <iframe
                      src="https://www.google.com/maps?q=9.0320,38.7469&z=13&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="MenuGo Office Location"
                    ></iframe>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Visit our office</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          123 Main Street, Suite 100<br />
                          Addis Abeba, AA 1000
                        </p>
                      </div>
                      <motion.a
                        href="https://www.google.com/maps/dir/?api=1&destination=9.0320,38.7469"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:bg-orange-100"
                        whileHover={{ x: 4 }}
                      >
                        Directions
                        <ArrowRightIcon className="h-3 w-3" />
                      </motion.a>
                    </div>
                    
                    {/* Social Links */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">Follow us</span>
                      <div className="flex gap-3">
                        {socialLinks.map((social, idx) => (
                          <motion.a
                            key={idx}
                            href="#"
                            className={`text-slate-400 transition-colors ${social.color}`}
                            whileHover={{ y: -2, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <social.icon className="h-5 w-5" />
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Newsletter Signup - Enhanced */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100 transition-all hover:shadow-2xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-orange-100 p-2">
                      <NewspaperIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Stay updated</h3>
                      <p className="text-sm text-slate-600">Get the latest features and industry insights.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-orange-300"
                      required
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
                    >
                      Subscribe
                    </motion.button>
                  </form>
                  
                  <AnimatePresence>
                    {newsletterSubmitted && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-green-600 font-medium"
                      >
                        ✓ Thanks for subscribing!
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    No spam, unsubscribe anytime.
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Enhanced */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">
                FAQ
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-lg text-slate-600">Quick answers to common questions</p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <motion.button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
                    whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.5)' }}
                  >
                    <span className="text-sm font-semibold text-slate-900">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                    >
                      <svg
                        className="h-4 w-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-t border-slate-100"
                      >
                        <div className="px-5 py-4 bg-slate-50">
                          <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-10 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center ring-1 ring-orange-100"
            >
              <h3 className="text-lg font-bold text-slate-900">Still have questions?</h3>
              <p className="mt-1 text-sm text-slate-600">Can't find the answer? Our support team is here to help.</p>
              <motion.a
                href="mailto:support@menugo.com"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
              >
                <EnvelopeIcon className="h-4 w-4" />
                Contact Support
                <ArrowRightIcon className="h-4 w-4" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Contact;