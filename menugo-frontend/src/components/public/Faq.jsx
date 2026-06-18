import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  BookOpen,
  CreditCard,
  Settings,
  Users,
  Shield,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  Building,
  Zap,
  HeartHandshake,
  Menu,
  ShoppingBag,
  UserCheck,
  Lock,
  Database,
  Server,
  Cloud,
  Link,
  QrCode
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const Faq = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'menu-management', label: 'Menu Management', icon: Menu },
    { id: 'orders', label: 'Orders & Payments', icon: ShoppingBag },
    { id: 'account', label: 'Account & Security', icon: UserCheck },
    { id: 'technical', label: 'Technical', icon: Server },
    { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
  ];

  const faqs = [
    // Getting Started
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with MenuGo?',
      answer: 'Getting started is easy! Sign up for a free trial, complete your restaurant profile, and start adding your menu items. Our onboarding wizard will guide you through each step. You can have your digital menu ready in less than 30 minutes.',
      related: ['How long does setup take?', 'Is there a setup fee?']
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'Is there a setup fee?',
      answer: 'No, there are absolutely no setup fees. You only pay for your chosen subscription plan. We believe in making it easy for restaurants to go digital without any upfront costs.',
      related: ['What payment methods do you accept?', 'Can I cancel anytime?']
    },
    {
      id: 3,
      category: 'getting-started',
      question: 'How long does setup take?',
      answer: 'Most restaurants can set up their digital menu in under 30 minutes. This includes adding your menu items, uploading images, and customizing your restaurant profile. Our step-by-step wizard makes it quick and easy.',
      related: ['Can I import my existing menu?', 'Do I need technical skills?']
    },
    {
      id: 4,
      category: 'getting-started',
      question: 'Do I need technical skills to use MenuGo?',
      answer: 'Not at all! MenuGo is designed to be user-friendly for restaurant owners and staff. You don\'t need any coding or technical skills to create and manage your digital menu. Everything is done through an intuitive dashboard.',
      related: ['Is there training available?', 'Do you offer customer support?']
    },

    // Menu Management
    {
      id: 5,
      category: 'menu-management',
      question: 'How do I add menu items?',
      answer: 'You can add menu items through your admin dashboard. Simply click "Add Item", fill in the details (name, description, price, category), upload an image, and set availability. Your menu updates are reflected instantly on the customer view.',
      related: ['Can I add images to menu items?', 'How do I organize categories?']
    },
    {
      id: 6,
      category: 'menu-management',
      question: 'Can I organize menu items into categories?',
      answer: 'Yes! You can create and manage categories like "Appetizers", "Main Courses", "Desserts", "Drinks", and more. You can easily drag and drop items between categories and reorder them as needed.',
      related: ['How many categories can I have?', 'Can I have subcategories?']
    },
    {
      id: 7,
      category: 'menu-management',
      question: 'How do I update prices or availability?',
      answer: 'You can update prices and availability in real-time through your dashboard. Changes are instantly reflected on the customer-facing menu. You can also set items as "Out of Stock" temporarily without deleting them.',
      related: ['Can I schedule availability changes?', 'Do changes happen instantly?']
    },
    {
      id: 8,
      category: 'menu-management',
      question: 'What image formats are supported?',
      answer: 'We support JPEG, PNG, WebP, and GIF formats. For best results, we recommend using high-quality images with a 1:1 or 4:3 aspect ratio. Images should be at least 800x800 pixels for optimal display.',
      related: ['Is there an image size limit?', 'Can I use animated images?']
    },

    // Orders & Payments
    {
      id: 9,
      category: 'orders',
      question: 'How do customers place orders?',
      answer: 'Customers scan your QR code, browse your menu, select items, add them to their cart, enter their table number, and submit their order. The order appears instantly on your dashboard for staff to process.',
      related: ['Can customers customize their orders?', 'How are orders tracked?']
    },
    {
      id: 10,
      category: 'orders',
      question: 'Can customers customize their orders?',
      answer: 'Yes! Customers can add special instructions, request modifications, and note allergies or dietary preferences. You can also enable custom options like "Extra Cheese" or "Gluten-Free" for specific items.',
      related: ['Can I customize the order form?', 'Is there a limit on modifications?']
    },
    {
      id: 11,
      category: 'orders',
      question: 'How are orders tracked?',
      answer: 'Orders move through a clear status flow: Pending → Verified → Preparing → Ready → Served. Staff can update statuses from the dashboard or mobile app, and customers can see real-time updates if enabled.',
      related: ['Can customers track their orders?', 'How do I handle order issues?']
    },
    {
      id: 12,
      category: 'orders',
      question: 'What payment methods are supported?',
      answer: 'We support cash on delivery, credit/debit cards, mobile money, and digital wallets. Payments can be processed through your existing POS system or through our integrated payment gateway (coming soon).',
      related: ['Can I accept online payments?', 'Are there transaction fees?']
    },

    // Account & Security
    {
      id: 13,
      category: 'account',
      question: 'Is my data secure?',
      answer: 'Yes! We use enterprise-grade security measures including AES-256 encryption for data at rest, TLS 1.3 for data in transit, regular security audits, and 24/7 monitoring. Your data is as secure as with any major banking platform.',
      related: ['Do you share my data with third parties?', 'What compliance certifications do you have?']
    },
    {
      id: 14,
      category: 'account',
      question: 'How do I manage staff access?',
      answer: 'You can create staff accounts for your team with role-based permissions. Assign roles like "Manager", "Waiter", or "Chef" with appropriate access levels. You can also enable or disable accounts instantly.',
      related: ['How many staff accounts can I create?', 'Can I limit what staff can see?']
    },
    {
      id: 15,
      category: 'account',
      question: 'Can I reset my password?',
      answer: 'Yes! You can reset your password from the login page. We\'ll send a password reset link to your registered email address. For security reasons, we recommend using a strong, unique password.',
      related: ['Can I enable two-factor authentication?', 'How often should I change my password?']
    },
    {
      id: 16,
      category: 'account',
      question: 'What GDPR compliance measures are in place?',
      answer: 'MenuGo is fully GDPR compliant. We have implemented data protection measures, provide data access and deletion requests, maintain detailed privacy policies, and ensure all data processing is transparent and lawful.',
      related: ['Can users request their data?', 'How is customer data handled?']
    },

    // Technical
    {
      id: 17,
      category: 'technical',
      question: 'Do I need to install any software?',
      answer: 'No! MenuGo is a fully cloud-based SaaS platform. You don\'t need to install any software. Simply access your dashboard through any modern web browser on your computer, tablet, or smartphone.',
      related: ['What browsers are supported?', 'Is there a mobile app available?']
    },
    {
      id: 18,
      category: 'technical',
      question: 'What happens if my internet goes down?',
      answer: 'We recommend having a backup plan. While MenuGo requires internet access, we offer offline mode capabilities (coming soon) and suggest printing QR codes in advance. You can also access basic features through our mobile app.',
      related: ['Is there an offline mode?', 'Can I use it without internet?']
    },
    {
      id: 19,
      category: 'technical',
      question: 'How often is the system updated?',
      answer: 'We continuously improve the platform with regular updates. Major features are released monthly, while security patches are deployed immediately. We maintain high uptime and notify users of scheduled maintenance.',
      related: ['Will I be notified of updates?', 'Do updates cause downtime?']
    },
    {
      id: 20,
      category: 'technical',
      question: 'What devices can I use MenuGo on?',
      answer: 'MenuGo works on any device with a modern web browser - desktop computers, laptops, tablets, and smartphones. We also have dedicated mobile apps for iOS and Android coming soon for a native experience.',
      related: ['Is there a mobile app?', 'Can I use it on my tablet?']
    },

    // Billing & Subscriptions
    {
      id: 21,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. For enterprise customers, we also offer invoice-based billing.',
      related: ['Can I pay annually for a discount?', 'Is there a free trial available?']
    },
    {
      id: 22,
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. There are no long-term contracts or cancellation fees. You\'ll have access until the end of your current billing period.',
      related: ['Will I get a refund if I cancel?', 'Can I pause my subscription?']
    },
    {
      id: 23,
      category: 'billing',
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card is required to start your trial, and you can upgrade to a paid plan at any time.',
      related: ['What happens after my trial ends?', 'Can I extend my trial?']
    },
    {
      id: 24,
      category: 'billing',
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! We offer significant discounts for annual subscriptions. You can save up to 20% compared to monthly billing. Contact our sales team for custom enterprise pricing.',
      related: ['What are your enterprise plans?', 'Can I switch plans later?']
    }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const popularQuestions = faqs.slice(0, 4);
  const stats = [
    { label: 'Total Questions', value: faqs.length },
    { label: 'Response Time', value: '< 1 hour' },
    { label: 'Satisfaction Rate', value: '98%' },
    { label: 'Categories', value: categories.length - 1 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-28 pb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
              Frequently Asked
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Questions</span>
            </h1>
            
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Find answers to the most common questions about MenuGo. Can't find what you're looking for? 
              <a href="/contact" className="text-indigo-600 hover:underline"> Contact our support team</a>
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-slate-200 py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-500">Popular Questions</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {popularQuestions.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => {
                      setExpandedFaq(faq.id);
                      document.getElementById(`faq-${faq.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-900">Categories</h3>
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    const count = category.id === 'all' 
                      ? faqs.length 
                      : faqs.filter(f => f.category === category.id).length;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact Support */}
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600">Still have questions?</p>
                  <a
                    href="/contact"
                    className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Support
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3">
              {filteredFaqs.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                  <Search className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">No results found</h3>
                  <p className="mt-2 text-slate-600">
                    We couldn't find any questions matching "{searchTerm}". Try adjusting your search or browse by category.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                    className="mt-4 text-indigo-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    const category = categories.find(c => c.id === faq.category);
                    const CategoryIcon = category?.icon || HelpCircle;

                    return (
                      <div
                        key={faq.id}
                        id={`faq-${faq.id}`}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="flex w-full items-start justify-between text-left"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 rounded-lg bg-indigo-100 p-2">
                              <CategoryIcon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">
                                {category?.label}
                              </p>
                              <h3 className="text-base font-semibold text-slate-900">
                                {faq.question}
                              </h3>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-4 border-t border-slate-100 pt-4 animate-fade-in">
                            <p className="text-slate-600">{faq.answer}</p>
                            
                            {faq.related && faq.related.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-slate-700">Related questions:</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {faq.related.map((related, index) => (
                                    <span
                                      key={index}
                                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                                    >
                                      {related}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {filteredFaqs.length > 10 && (
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500">
                    Showing {filteredFaqs.length} questions
                  </p>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">
                      Previous
                    </button>
                    <button className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white">
                      1
                    </button>
                    <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">
                      2
                    </button>
                    <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-bold">Still Have Questions?</h2>
            <p className="mt-2 text-indigo-100">
              Our support team is ready to help you with any questions or concerns.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Us
              </a>
              <a
                href="mailto:support@menugo.com"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <Mail className="h-5 w-5" />
                support@menugo.com
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                +251931486967
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Faq;