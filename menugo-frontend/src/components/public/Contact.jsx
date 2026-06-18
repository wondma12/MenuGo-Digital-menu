import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  PencilIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { createPublicContact } from '../../services/contactService';

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
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      sub: 'Mon-Fri, 9am-6pm EST',
      action: 'tel:+15551234567',
      actionText: 'Call Now',
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      details: '123 Main Street',
      sub: 'New York, NY 10001',
      action: 'https://maps.google.com',
      actionText: 'Get Directions',
    },
    {
      icon: ClockIcon,
      title: 'Support Hours',
      details: '24/7 Support',
      sub: 'Email support available 24/7',
      action: null,
      actionText: null,
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

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-gradient-to-br from-orange-600 to-orange-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white mb-4">
              <SparklesIcon className="h-4 w-4" />
              Get in touch
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let's talk
            </h1>
            <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto">
              We're here to answer your questions, schedule a demo, or help you get started with MenuGo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Send a Message
                <EnvelopeIcon className="h-5 w-5" />
              </a>
              <a
                href="/schedule-demo"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500/80 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-500"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                Schedule Demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-white -mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <info.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{info.title}</h3>
                <p className="mt-1 text-slate-600">{info.details}</p>
                <p className="text-sm text-slate-500">{info.sub}</p>
                {info.action && (
                  <a
                    href={info.action}
                    className="mt-3 inline-block text-sm font-medium text-orange-600 transition-colors hover:text-orange-800"
                    target={info.title === 'Visit Us' ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                  >
                    {info.actionText} →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map Section */}
      <section id="contact-form" className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white p-6 shadow-lg sm:p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
              <p className="mt-1 text-slate-600">We'll reply within 24 hours. For urgent issues, use live chat.</p>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Thank you — we'll get back to you shortly.</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-center gap-2 text-red-700">
                    <ExclamationCircleIcon className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Full name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="Your name"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email address *</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                    <div className="relative">
                      <PencilIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Message *</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 p-3 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Please describe your question or concern..."
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Right column: Map + Live Chat + Newsletter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Map */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-64 w-full bg-slate-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bbaf9a7%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1644262073846!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="MenuGo Office Location"
                  ></iframe>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">Visit our office</h3>
                  <p className="mt-1 text-slate-600">
                    123 Main Street, Suite 100<br />
                    Addis Abeba , AA 1000
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-orange-600 hover:text-orange-800"
                    >
                      Get directions →
                    </a>
                    <div className="flex gap-3">
                      <a href="#" className="text-slate-500 transition-colors hover:text-orange-600">
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a href="#" className="text-slate-500 transition-colors hover:text-orange-600">
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a href="#" className="text-slate-500 transition-colors hover:text-orange-600">
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href="#" className="text-slate-500 transition-colors hover:text-orange-600">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Chat CTA */}
              <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                  <h3 className="text-xl font-bold">Live Chat Support</h3>
                </div>
                <p className="mt-2 text-orange-100">Need immediate assistance? Our team is available 24/7.</p>
                <button
                  onClick={() => window.open('/chat', '_blank')}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-semibold text-orange-600 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  Start Live Chat
                </button>
              </div>

              {/* Newsletter Signup */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <NewspaperIcon className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-900">Stay updated</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">Get the latest features, tips, and restaurant industry insights.</p>
                <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                  >
                    Subscribe
                  </button>
                </form>
                {newsletterSubmitted && (
                  <p className="mt-2 text-sm text-green-600">Thanks for subscribing!</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheckIcon className="h-4 w-4" />
                  No spam, unsubscribe anytime.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-lg text-slate-600">Quick answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${activeFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 bg-slate-50"
                    >
                      <div className="px-5 py-4">
                        <p className="text-slate-600">{faq.answer}</p>
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
            className="mt-12 rounded-xl bg-slate-50 p-6 text-center"
          >
            <h3 className="text-lg font-bold text-slate-900">Still have questions?</h3>
            <p className="mt-1 text-slate-600">Can't find the answer? Our support team is here to help.</p>
            <a
              href="mailto:support@menugo.com"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-orange-700"
            >
              <EnvelopeIcon className="h-5 w-5" />
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Contact;