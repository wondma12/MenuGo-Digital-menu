import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  Mail, 
  Cookie,
  Globe,
  Clock,
  FileCheck,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Smartphone,
  Building,
  Users,
  Share2,
  Trash2,
  Edit3,
  Bell,
  Search,
  MapPin,
  CreditCard,
  Fingerprint,
  ShieldCheck,
  Award,
  Calendar,
  Download,
  Printer,
  Info,
  HelpCircle,
  HeartHandshake
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const Privacy = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [lastUpdated] = useState('January 15, 2024');
  const [activeTab, setActiveTab] = useState('overview');
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('privacy_consent');
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem('privacy_consent', 'true');
    setShowConsent(false);
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 'information',
      icon: Database,
      title: '1. Information We Collect',
      content: 'We collect information to provide and improve our services.',
      details: [
        'Personal identification information (Name, email address, phone number)',
        'Restaurant data (Menu items, pricing, categories, images)',
        'Usage data (How you interact with our platform)',
        'Device information (Browser type, IP address, device type)',
        'Location data (With your permission)',
        'Payment information (Processed securely through partners)'
      ]
    },
    {
      id: 'usage',
      icon: Eye,
      title: '2. How We Use Your Information',
      content: 'We use your data to deliver and improve our services.',
      details: [
        'To provide and maintain our services',
        'To process your orders and payments',
        'To send you updates and promotional materials',
        'To improve and optimize our platform',
        'To ensure security and prevent fraud',
        'To comply with legal obligations'
      ]
    },
    {
      id: 'sharing',
      icon: Share2,
      title: '3. Information Sharing',
      content: 'We do not sell your personal information to third parties.',
      details: [
        'We share data with service providers who help us operate',
        'We may share data with your consent',
        'We may share data to comply with legal requirements',
        'We do not sell your data to advertisers or third parties',
        'Data is shared only as described in this policy'
      ]
    },
    {
      id: 'security',
      icon: Lock,
      title: '4. Data Security',
      content: 'We implement industry-standard security measures.',
      details: [
        'AES-256 encryption for data at rest',
        'TLS 1.3 encryption for data in transit',
        'Regular security audits and penetration testing',
        '24/7 monitoring and threat detection',
        'Access controls and authentication protocols',
        'Regular backups and disaster recovery plans'
      ]
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: '5. Cookies & Tracking',
      content: 'We use cookies to enhance your experience.',
      details: [
        'Essential cookies for basic functionality',
        'Analytics cookies to understand usage patterns',
        'Preference cookies to remember your settings',
        'Marketing cookies for targeted advertising (with consent)',
        'You can manage cookie preferences in your browser settings'
      ]
    },
    {
      id: 'rights',
      icon: ShieldCheck,
      title: '6. Your Rights',
      content: 'You have control over your personal data.',
      details: [
        'Right to access your personal data',
        'Right to correct inaccurate data',
        'Right to delete your data (Right to be forgotten)',
        'Right to restrict or object to processing',
        'Right to data portability',
        'Right to withdraw consent at any time'
      ]
    },
    {
      id: 'children',
      icon: Users,
      title: '7. Children\'s Privacy',
      content: 'We do not knowingly collect data from children.',
      details: [
        'Our services are not directed to children under 13',
        'We do not knowingly collect data from minors',
        'If we discover we have collected data from a child, we will delete it',
        'Parents can contact us to request deletion of their child\'s data'
      ]
    },
    {
      id: 'international',
      icon: Globe,
      title: '8. International Data Transfers',
      content: 'Your data may be transferred across borders.',
      details: [
        'We comply with GDPR and other data protection regulations',
        'Data may be stored on servers in multiple countries',
        'We ensure appropriate safeguards for international transfers',
        'Standard contractual clauses are in place for data transfers'
      ]
    },
    {
      id: 'changes',
      icon: Calendar,
      title: '9. Changes to This Policy',
      content: 'We may update this policy from time to time.',
      details: [
        'We will notify you of significant changes via email',
        'The latest version will always be available on this page',
        'Your continued use constitutes acceptance of the updated policy',
        'We recommend reviewing this policy periodically'
      ]
    },
    {
      id: 'contact',
      icon: HeartHandshake,
      title: '10. Contact Us',
      content: 'Reach out if you have questions about this policy.',
      details: [
        'Email: privacy@menugo.com',
        'Phone: +1 (555) 123-4567',
        'Address: 123 Business St, Suite 100',
        'Data Protection Officer: dpo@menugo.com'
      ]
    }
  ];

  const quickLinks = [
    { label: 'Terms of Service', icon: FileCheck, href: '/terms' },
    { label: 'Security', icon: Lock, href: '/security' },
    { label: 'Cookie Policy', icon: Cookie, href: '/cookies' },
    { label: 'Support', icon: HelpCircle, href: '/support' }
  ];

  const keyPoints = [
    { icon: Shield, text: 'Your data is encrypted and secure' },
    { icon: UserCheck, text: 'You control your privacy settings' },
    { icon: Award, text: 'GDPR and CCPA compliant' },
    { icon: Clock, text: 'Regular security audits' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Consent Banner */}
      {showConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 p-4 text-white shadow-lg">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 flex-shrink-0 text-indigo-400" />
              <div>
                <h4 className="font-semibold">We value your privacy</h4>
                <p className="text-sm text-slate-300">
                  We use cookies to enhance your experience. By continuing, you agree to our{' '}
                  <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleConsent}
                className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition hover:bg-indigo-700"
              >
                Accept
              </button>
              <button 
                onClick={() => setShowConsent(false)}
                className="rounded-lg border border-slate-600 px-6 py-2 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 pt-28 pb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            
            <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-200">
              Your privacy matters to us. Learn how we collect, use, and protect your personal information.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                Last Updated: {lastUpdated}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <FileCheck className="h-4 w-4" />
                Version 3.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points Banner */}
      <section className="border-b border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keyPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-indigo-100 p-2">
                  <point.icon className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-sm text-slate-700">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Quick Links:</span>
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-900">On this page</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const element = document.getElementById(section.id);
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title.replace(/^\d+\.\s*/, '')}
                    </button>
                  ))}
                </nav>

                {/* Download Button */}
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Introduction</h2>
                  <p className="mt-2 text-slate-600">
                    At MenuGo, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                    disclose, and safeguard your information when you use our digital menu platform. Please read 
                    this policy carefully to understand our views and practices regarding your personal data.
                  </p>
                  <div className="mt-4 rounded-lg bg-indigo-50 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm text-indigo-800">
                        <span className="font-semibold">Key Principle:</span> We only collect data that helps us 
                        provide better service, and we never sell your personal information to third parties.
                      </p>
                    </div>
                  </div>
                </div>

                {sections.map((section) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSection === section.id;

                  return (
                    <div
                      key={section.id}
                      id={section.id}
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-start justify-between text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 rounded-lg bg-indigo-100 p-2">
                            <Icon className="h-5 w-5 text-indigo-600" />
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
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 border-t border-slate-100 pt-4 animate-fade-in">
                          <ul className="space-y-2">
                            {section.details.map((detail, index) => (
                              <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Footer Note */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    By using MenuGo, you agree to this Privacy Policy. 
                    If you have any questions, please{' '}
                    <a href="/contact" className="font-medium text-indigo-600 hover:underline">
                      contact our Privacy Team
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Privacy;