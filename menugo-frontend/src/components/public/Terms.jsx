import {useState, useEffect} from 'react'
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Users, 
  CreditCard,
  Globe,
  Clock,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  UserCheck,
  Database,
  Lock,
  Server,
  Award,
  Calendar,
  Building,
  Scale,
  Gavel,
  FileCheck,
  AlertTriangle,
  HeartHandshake,
  Smartphone,
  ShoppingBag,
  Receipt,
  Settings,
  HelpCircle,
  Info,
  SparklesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const Terms = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [lastUpdated] = useState('January 15, 2024');
  const [activeTab, setActiveTab] = useState('overview');

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 'acceptance',
      icon: FileCheck,
      title: '1. Acceptance of Terms',
      content: 'By using MenuGo, you agree to these terms. If you don\'t agree, please don\'t use our service.',
      details: [
        'You must be at least 18 years old to use this service.',
        'You are responsible for maintaining the security of your account.',
        'You agree to provide accurate and complete information.',
        'You will use the service in compliance with all applicable laws.'
      ]
    },
    {
      id: 'account',
      icon: UserCheck,
      title: '2. Account Registration',
      content: 'Create and manage your account responsibly.',
      details: [
        'You are responsible for all activities under your account.',
        'You must notify us immediately of any unauthorized use.',
        'We reserve the right to suspend or terminate accounts.',
        'You must keep your password secure and confidential.'
      ]
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: '3. Payments & Subscriptions',
      content: 'Understand our payment terms and subscription plans.',
      details: [
        'All payments are processed securely through our payment partners.',
        'Subscriptions auto-renew unless cancelled before the renewal date.',
        'Refunds are handled according to our refund policy.',
        'Prices may change with prior notice.'
      ]
    },
    {
      id: 'data',
      icon: Database,
      title: '4. Data & Privacy',
      content: 'How we handle your data and protect your privacy.',
      details: [
        'We collect only necessary data to provide our services.',
        'Your data is encrypted and stored securely.',
        'We never sell your personal information to third parties.',
        'You can request data deletion at any time.'
      ]
    },
    {
      id: 'usage',
      icon: Globe,
      title: '5. Acceptable Use',
      content: 'Guidelines for using our service responsibly.',
      details: [
        'Do not use the service for any illegal activities.',
        'Do not attempt to breach our security measures.',
        'Do not interfere with other users\' experience.',
        'Do not upload malicious content or code.'
      ]
    },
    {
      id: 'intellectual',
      icon: Scale,
      title: '6. Intellectual Property',
      content: 'Ownership of content and intellectual property rights.',
      details: [
        'All content on MenuGo is protected by copyright.',
        'You retain ownership of your content.',
        'You grant us a license to display your content.',
        'You may not copy or reproduce our content without permission.'
      ]
    },
    {
      id: 'termination',
      icon: Gavel,
      title: '7. Termination',
      content: 'Conditions for terminating your account.',
      details: [
        'You may cancel your account at any time.',
        'We may suspend or terminate accounts for violations.',
        'Termination does not affect existing legal obligations.',
        'Some provisions survive termination.'
      ]
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: '8. Limitation of Liability',
      content: 'Our liability is limited to the extent permitted by law.',
      details: [
        'We are not liable for indirect or consequential damages.',
        'Our liability is limited to the amount paid for services.',
        'We do not warrant uninterrupted or error-free service.',
        'You use the service at your own risk.'
      ]
    },
    {
      id: 'changes',
      icon: Calendar,
      title: '9. Changes to Terms',
      content: 'We may update these terms from time to time.',
      details: [
        'Changes are effective upon posting.',
        'We will notify you of significant changes.',
        'Continued use constitutes acceptance.',
        'You should review terms periodically.'
      ]
    },
    {
      id: 'contact',
      icon: HeartHandshake,
      title: '10. Contact Us',
      content: 'Reach out if you have questions or concerns.',
      details: [
        'Email: haymanotwondmagegn3@gmail.com',
        'Phone: +251931486967',
        'Address: AA  Ethiopia, Suite 100',
        'Support: support@menugo.com'
      ]
    }
  ];

  const quickLinks = [
    { label: 'Privacy Policy', icon: Shield, href: '/privacy' },
    { label: 'Security', icon: Lock, href: '/security' },
    // { label: 'Cookie Policy', icon: Info, href: '/cookies' },
    // { label: 'Support', icon: HelpCircle, href: '/support' }
  ];

  const keyPoints = [
    { icon: Shield, text: 'Your data is protected with enterprise-grade security' },
    { icon: Clock, text: '24/7 monitoring and support' },
    { icon: Award, text: 'Industry-leading compliance standards' },
    { icon: Building, text: 'Trusted by thousands of restaurants' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white mb-4">
              <SparklesIcon className="h-4 w-4" />
              Legal Information
            </div>
            
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <FileText className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>
            
            <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-100">
              Please read these terms carefully before using MenuGo services.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
                <Calendar className="h-4 w-4" />
                Last Updated: {lastUpdated}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
                <FileCheck className="h-4 w-4" />
                Version 2.1
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Points Banner */}
      <section className="border-b border-slate-200 bg-white py-8 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keyPoints.map((point, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div className="flex-shrink-0 rounded-full bg-orange-100 p-2">
                  <point.icon className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Quick Links:</span>
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm text-slate-700 transition hover:bg-orange-100 hover:text-orange-700 shadow-sm"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <h3 className="mb-4 font-semibold text-slate-900">On this page</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const element = document.getElementById(section.id);
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title.replace(/^\d+\.\s*/, '')}
                    </button>
                  ))}
                </nav>

                {/* Download Button */}
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 hover:-translate-y-0.5 shadow-md">
                    <FileText className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSection === section.id;

                  return (
                    <motion.div
                      key={section.id}
                      id={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-xl"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-start justify-between text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 rounded-lg bg-orange-100 p-2">
                            <Icon className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                              {section.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">{section.content}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-orange-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 border-t border-slate-100 pt-4 overflow-hidden"
                          >
                            <ul className="space-y-2">
                              {section.details.map((detail, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-8 rounded-xl border border-slate-200 bg-orange-50 p-6 text-center"
              >
                <p className="text-sm text-slate-600">
                  By using MenuGo, you agree to these terms and conditions. 
                  If you have any questions, please{' '}
                  <a href="/contact" className="font-medium text-orange-600 hover:underline">
                    contact us
                  </a>
                  .
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Terms;