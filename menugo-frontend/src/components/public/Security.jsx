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
  BadgeCheck
} from 'lucide-react';
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
    { label: 'Data Centers', value: '5', description: 'Globally distributed' },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-28 pb-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Shield Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
              Security is Our
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Top Priority</span>
            </h1>
            
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Your data is protected with enterprise-grade security measures. 
              Learn how we keep your information safe and secure.
            </p>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {securityBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                  <badge.icon className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Security Features</h2>
            <p className="mt-2 text-slate-600">
              Every layer of our platform is built with security in mind
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              const StatusIcon = feature.statusColor === 'green' ? CheckCircle : ShieldCheck;
              
              return (
                <div
                  key={feature.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:border-indigo-200"
                >
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      feature.statusColor === 'green' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <StatusIcon className="h-3 w-3" />
                      {feature.status}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-100 p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>

                  {/* Expandable Details */}
                  <button
                    onClick={() => toggleSection(feature.id)}
                    className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {expandedSection === feature.id ? 'Hide details' : 'Learn more'}
                    {expandedSection === feature.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedSection === feature.id && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 animate-fade-in">
                      {feature.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Certifications */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Security Certifications</h2>
            <p className="mt-2 text-slate-600">
              We are committed to maintaining the highest security standards
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">SOC 2 Type II</h3>
              <p className="mt-2 text-sm text-slate-600">
                Independent audit of our security, availability, and confidentiality controls.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">ISO 27001</h3>
              <p className="mt-2 text-sm text-slate-600">
                International standard for information security management systems.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">GDPR Compliant</h3>
              <p className="mt-2 text-sm text-slate-600">
                Full compliance with European data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Security Best Practices</h2>
              <p className="mt-2 text-slate-600">
                Follow these recommended practices to keep your account secure.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-green-100 p-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Use Strong Passwords</h4>
                  <p className="text-sm text-slate-600">Use a mix of uppercase, lowercase, numbers, and special characters.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-blue-100 p-1">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-purple-100 p-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Regular Security Updates</h4>
                  <p className="text-sm text-slate-600">Keep your software and systems up to date.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-bold">Have Security Questions?</h2>
            <p className="mt-2 text-indigo-100">
              Our security team is here to help. Contact us for any security-related concerns.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:security@menugo.com"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                <Mail className="h-5 w-5" />
                security@menugo.com
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                +1 (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Security;