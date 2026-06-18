import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Server, 
  Database, 
  UserCheck, 
  Key, 
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Fingerprint,
  Globe,
  FileCheck,
  Cloud,
  ShieldAlert,
  Clock,
  Building,
  CreditCard,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BadgeCheck,
  SparklesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const Security = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const securityFeatures = [
    {
      id: 'encryption',
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
      details: 'We use TLS 1.3 for data in transit and AES-256 for data at rest. Your sensitive information is never stored in plain text.',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 'authentication',
      icon: ShieldCheck,
      title: 'Multi-Factor Authentication',
      description: 'Protect your account with additional layers of security through MFA.',
      details: 'Support for authenticator apps, SMS verification, and biometric authentication options.',
      status: 'Available',
      statusColor: 'blue'
    },
    {
      id: 'compliance',
      icon: FileCheck,
      title: 'Compliance & Certifications',
      description: 'We maintain rigorous compliance standards and industry certifications.',
      details: 'GDPR compliant, SOC 2 Type II certified, and regularly audited by third-party security firms.',
      status: 'Certified',
      statusColor: 'green'
    },
    {
      id: 'monitoring',
      icon: Server,
      title: 'Real-time Monitoring',
      description: '24/7 monitoring and threat detection to protect your data.',
      details: 'Continuous security monitoring, automated threat detection, and instant alerting systems.',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 'backup',
      icon: Database,
      title: 'Data Backup & Recovery',
      description: 'Regular automated backups with disaster recovery protocols.',
      details: 'Daily automated backups stored in geographically redundant locations with 99.99% uptime SLA.',
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 'access',
      icon: UserCheck,
      title: 'Access Control',
      description: 'Granular role-based access control for your team.',
      details: 'Fine-grained permissions, SSO integration, and detailed audit logs for all actions.',
      status: 'Available',
      statusColor: 'blue'
    }
  ];

  const stats = [
    { label: 'Security Incidents', value: '0', description: 'In the last 365 days' },
    { label: 'Uptime', value: '99.99%', description: 'Average uptime' },
    { label: 'Data Centers', value: '1', description: 'Globally centralized' },
    { label: 'Certifications', value: '12+', description: 'Security certifications' }
  ];

  const securityBadges = [
    { name: 'GDPR Compliant', icon: Shield },
    { name: 'SOC 2 Type II', icon: BadgeCheck },
    { name: 'ISO 27001', icon: ShieldAlert },
    { name: 'PCI DSS', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800 pt-28 pb-16 sm:pt-32 sm:pb-20">
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
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white mb-3">
              <SparklesIcon className="h-3.5 w-3.5" />
              Enterprise Grade Security
            </div>
            
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Security is Our
              <span className="text-orange-200"> Top Priority</span>
            </h1>
            
            <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-100 sm:text-base">
              Your data is protected with enterprise-grade security measures. 
              Learn how we keep your information safe and secure.
            </p>

            {/* Badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {securityBadges.map((badge, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 shadow-sm border border-white/10"
                >
                  <badge.icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-medium text-white sm:text-sm">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-white py-8 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-orange-600 sm:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-700 sm:text-sm">{stat.label}</p>
                <p className="text-[10px] text-slate-500 sm:text-xs">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Features</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Every layer of our platform is built with security in mind
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const StatusIcon = feature.statusColor === 'green' ? CheckCircle : ShieldCheck;
              const isExpanded = expandedSection === feature.id;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-orange-200"
                >
                  {/* Status Badge */}
                  <div className="absolute right-3 top-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      feature.statusColor === 'green' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {feature.status}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-3 inline-flex rounded-xl bg-orange-100 p-2.5 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{feature.description}</p>

                  {/* Expandable Details */}
                  <button
                    onClick={() => toggleSection(feature.id)}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 sm:text-sm"
                  >
                    {isExpanded ? 'Hide details' : 'Learn more'}
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 rounded-lg bg-orange-50 p-3 text-sm text-slate-700 overflow-hidden border border-orange-100"
                      >
                        {feature.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Certifications */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Certifications</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              We are committed to maintaining the highest security standards
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, color: 'orange', title: 'SOC 2 Type II', desc: 'Independent audit of our security, availability, and confidentiality controls.' },
              { icon: Lock, color: 'green', title: 'ISO 27001', desc: 'International standard for information security management systems.' },
              { icon: Globe, color: 'purple', title: 'GDPR Compliant', desc: 'Full compliance with European data protection regulations.' }
            ].map((cert, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="rounded-xl bg-slate-50 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-${cert.color}-100`}>
                  <cert.icon className={`h-7 w-7 text-${cert.color}-600`} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{cert.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{cert.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Best Practices</h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Follow these recommended practices to keep your account secure.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              {[
                { color: 'green', title: 'Use Strong Passwords', desc: 'Use a mix of uppercase, lowercase, numbers, and special characters.' },
                { color: 'blue', title: 'Enable Two-Factor Authentication', desc: 'Add an extra layer of security to your account.' },
                { color: 'purple', title: 'Regular Security Updates', desc: 'Keep your software and systems up to date.' }
              ].map((practice, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className={`flex-shrink-0 rounded-full bg-${practice.color}-100 p-1 mt-0.5`}>
                    <CheckCircle className={`h-4 w-4 text-${practice.color}-600`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{practice.title}</h4>
                    <p className="text-xs text-slate-600">{practice.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-center text-white md:p-10 shadow-xl"
          >
            <h2 className="text-xl font-bold md:text-2xl">Have Security Questions?</h2>
            <p className="mt-1.5 text-sm text-orange-100">
              Our security team is here to help. Contact us for any security-related concerns.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:security@menugo.com"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 hover:-translate-y-0.5 shadow-md"
              >
                <Mail className="h-4 w-4" />
                security@menugo.com
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                +251 931 48 69 67
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Security;