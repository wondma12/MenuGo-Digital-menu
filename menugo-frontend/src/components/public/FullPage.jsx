import {useState, useEffect, useRef} from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  PlayIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  PresentationChartLineIcon,
  Bars3BottomLeftIcon,
  BoltIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  LanguageIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Mail,
  ExternalLink,
  BookOpen,
  Settings,
  Smartphone,
  ShoppingBag,
  UserCheck,
  Lock,
  Database,
  Server,
  Cloud,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Scale,
  Gavel,
  FileCheck,
  AlertTriangle,
  HeartHandshake,
  Info,
  Shield,
  Fingerprint,
  ShieldAlert,
  BadgeCheck,
  Key,
  Globe,
  Building,
  Award,
  Calendar,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Menu,
  Zap,
  ArrowPathIcon,
  Battery100Icon,
  Eye,
  Cookie,
  Share2,
  Trash2,
  Edit3,
  Bell,
  Printer,
  Download,
  Sparkles
} from 'lucide-react';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { getPublicPlatformSummary, getPlatformDashboardData } from '../../services/analyticsService';
import { getSubscriptionPlans } from '../../services/subscriptionService';
import { createPublicContact } from '../../services/contactService';
import { formatPrice } from '../../utils/currency';
import { useAuthStore } from '../../store/authStore';
import { getSystemSettings } from '../../services/systemService';
import { useQuery } from 'react-query';

// ==================== LOADING SKELETON ====================
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full w-full"></div>
  </div>
);

// ==================== HEADER COMPONENT ====================
function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = { pathname: '/home' };

  const { data: settings } = useQuery('systemSettings', getSystemSettings);
  const headerLogo = settings?.platform_logo || settings?.logo || settings?.logo_url || settings?.logoUrl || settings?.branding?.logo || settings?.branding?.logo_url || settings?.preferences?.logo;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '#home', label: 'Home' },
    { path: '#about', label: 'About' },
    { path: '#services', label: 'Services' },
    { path: '#contact', label: 'Contact' },
    { path: '#faq', label: 'FAQ' },
    { path: '#privacy', label: 'Privacy' },
    { path: '#terms', label: 'Terms' },
    { path: '#security', label: 'Security' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link to="#home" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md transition-all group-hover:scale-105">
              {headerLogo ? (
                <img src={headerLogo} alt="Platform logo" className="h-8 w-8 object-contain" />
              ) : (
                <span className="text-2xl font-extrabold text-orange-600">M</span>
              )}
            </div>
            {!headerLogo && (
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Menu<span className="text-orange-600">Go</span>
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6 whitespace-nowrap overflow-x-auto max-w-[60%]">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`relative text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.path) ? 'text-orange-600' : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <a href="#contact" className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-lg">
              Get Started
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-orange-600 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 bg-white/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive(link.path) ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ==================== FOOTER COMPONENT ====================
function PublicFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      setNewsletterStatus('Please enter a valid email address.');
      setTimeout(() => setNewsletterStatus(''), 3000);
      return;
    }
    setNewsletterStatus('🎉 Thanks for subscribing!');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(''), 4000);
  };

  const quickLinks = [
    { name: 'About Us', path: '#about' },
    { name: 'Services', path: '#services' },
    { name: 'Contact', path: '#contact' },
    { name: 'FAQ', path: '#faq' },
  ];

  const supportLinks = [
    { name: 'Privacy Policy', path: '#privacy' },
    { name: 'Terms of Service', path: '#terms' },
    { name: 'Security', path: '#security' },
  ];

  const socialLinks = [
    { icon: Twitter, name: 'Twitter', url: 'https://x.com/HWondmageg23368', color: 'hover:bg-[#1DA1F2]', bgColor: 'bg-[#1DA1F2]/10' },
    { icon: Facebook, name: 'Facebook', url: 'https://web.facebook.com/profile.php?id=100091640838987', color: 'hover:bg-[#1877F2]', bgColor: 'bg-[#1877F2]/10' },
    { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/haymanotwondmagegn/', color: 'hover:bg-gradient-to-r hover:from-[#E4405F] hover:to-[#F58529]', bgColor: 'bg-[#E4405F]/10' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://www.linkedin.com/in/haymanot-wondmagegn-b57502300/', color: 'hover:bg-[#0A66C2]', bgColor: 'bg-[#0A66C2]/10' },
    { icon: Youtube, name: 'YouTube', url: 'https://www.youtube.com', color: 'hover:bg-[#FF0000]', bgColor: 'bg-[#FF0000]/10' },
  ];

  const floatAnimation = {
    y: [0, -5, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={floatAnimation} className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <a href="#home" className="inline-block group">
              <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2">
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-orange-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  MenuGo
                </span>
                <motion.div animate={pulseAnimation} className="relative">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                </motion.div>
              </motion.div>
            </a>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xs">
              Digital dining, reimagined. Smart QR ordering, live analytics, and seamless team coordination for modern restaurants.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, text: 'support@menugo.com', href: 'mailto:support@menugo.com' },
                { icon: Phone, text: '+251 931 48 69 67', href: 'tel:+251931486967' },
                { icon: MapPinIcon, text: 'Addis Ababa, Ethiopia', href: null },
              ].map((item, idx) => (
                <motion.div key={idx} whileHover={{ x: 4 }} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="hover:text-orange-400 transition-colors duration-300">{item.text}</a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <motion.h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"></span>
              Quick Links
            </motion.h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link, idx) => (
                <motion.li key={idx} whileHover={{ x: 6 }} onMouseEnter={() => setHoveredLink(`quick-${idx}`)} onMouseLeave={() => setHoveredLink(null)}>
                  <a href={link.path} className="text-slate-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group">
                    <motion.span animate={{ opacity: hoveredLink === `quick-${idx}` ? 1 : 0, x: hoveredLink === `quick-${idx}` ? 0 : -5 }} className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    {link.name}
                    <motion.span animate={{ opacity: hoveredLink === `quick-${idx}` ? 1 : 0, x: hoveredLink === `quick-${idx}` ? 0 : -5 }}>
                      <ArrowRightIcon className="h-3 w-3 text-orange-400" />
                    </motion.span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <motion.h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></span>
              Support
            </motion.h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {supportLinks.map((link, idx) => (
                <motion.li key={idx} whileHover={{ x: 6 }} onMouseEnter={() => setHoveredLink(`support-${idx}`)} onMouseLeave={() => setHoveredLink(null)}>
                  <a href={link.path} className="text-slate-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group">
                    <motion.span animate={{ opacity: hoveredLink === `support-${idx}` ? 1 : 0, x: hoveredLink === `support-${idx}` ? 0 : -5 }} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {link.name}
                    <motion.span animate={{ opacity: hoveredLink === `support-${idx}` ? 1 : 0, x: hoveredLink === `support-${idx}` ? 0 : -5 }}>
                      <ArrowRightIcon className="h-3 w-3 text-blue-400" />
                    </motion.span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5 text-orange-400" /><span>24/7 Support</span></div>
              <div className="flex items-center gap-1.5"><ShieldCheckIcon className="h-3.5 w-3.5 text-orange-400" /><span>Secure</span></div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <motion.h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full"></span>
              Stay updated
            </motion.h3>
            <p className="mt-2 text-sm text-slate-300">Get the latest news, tips, and exclusive offers.</p>
            <form onSubmit={handleNewsletterSubmit} className="mt-4">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-l-xl border-0 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-300"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-r-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50"
                >
                  <span className="hidden sm:inline">Subscribe</span>
                  <span className="sm:hidden">→</span>
                </motion.button>
              </div>
              <AnimatePresence>
                {newsletterStatus && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className={`mt-2 text-xs ${newsletterStatus.includes('Thanks') ? 'text-green-400' : 'text-red-400'} flex items-center gap-1.5`}>
                    {newsletterStatus.includes('Thanks') ? <CheckBadgeIcon className="h-3.5 w-3.5" /> : <span className="text-red-400">!</span>}
                    {newsletterStatus}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-3">Follow us</p>
              <div className="flex gap-2">
                {socialLinks.map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredSocial(idx)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    className={`relative p-2.5 rounded-xl ${social.bgColor} text-slate-400 transition-all duration-300 hover:text-white hover:shadow-lg group`}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="h-4 w-4 transition-colors duration-300 group-hover:text-white" />
                    <AnimatePresence>
                      {hoveredSocial === idx && (
                        <motion.span initial={{ opacity: 0, y: -5, scale: 0.8 }} animate={{ opacity: 1, y: -8, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.8 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-[10px] text-white rounded whitespace-nowrap">
                          {social.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-12 border-t border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            © {new Date().getFullYear()} MenuGo. All rights reserved.
            <motion.span animate={floatAnimation} className="inline-block">
              <HeartIcon className="h-3.5 w-3.5 text-orange-400" />
            </motion.span>
            Built with ❤️ for restaurants worldwide.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#privacy" className="hover:text-orange-400 transition-colors duration-300">Privacy</a>
            <span className="w-px h-3 bg-slate-700"></span>
            <a href="#terms" className="hover:text-orange-400 transition-colors duration-300">Terms</a>
            <span className="w-px h-3 bg-slate-700"></span>
            <a href="#security" className="hover:text-orange-400 transition-colors duration-300">Security</a>
            <span className="w-px h-3 bg-slate-700"></span>
            <motion.div animate={pulseAnimation} className="flex items-center gap-1.5 text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px]">All systems go</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
      `}</style>
    </motion.footer>
  );
}

// ==================== BACKGROUND CAROUSEL ====================
function BackgroundCarousel() {
  const images = [
    'https://images.pexels.com/photos/29000057/pexels-photo-29000057.jpeg',
    'https://images.pexels.com/photos/28999499/pexels-photo-28999499.jpeg',
    'https://images.pexels.com/photos/26729401/pexels-photo-26729401.jpeg',
    'https://images.pexels.com/photos/29000046/pexels-photo-29000046.jpeg',
    'https://images.pexels.com/photos/33948377/pexels-photo-33948377.jpeg'
  ];

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const showOverlay = hovered || overlayVisible;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-80 sm:h-96 lg:h-[420px]">
      {images.map((src, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 1s ease-in-out' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1 }}
        />
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOverlayVisible((visible) => !visible)}
        style={{ cursor: 'pointer' }}
      >
        <motion.div
          className={`pointer-events-auto mx-auto max-w-3xl px-4 text-center transition-opacity duration-200 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showOverlay ? 1 : 0, y: showOverlay ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl bg-black/60 px-8 py-6 text-white backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Digital dining, reimagined</h2>
            <p className="mt-2 text-sm">Design a better restaurant journey — click to explore.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ==================== ANIMATION VARIANTS ====================
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'backOut' } },
};

const heroImage = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

// ==================== UTILITY FUNCTIONS ====================
const compactNumber = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numericValue);
};

// ==================== MAIN PAGE COMPONENT ====================
export default function FullPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // State for various sections
  const [platformSummary, setPlatformSummary] = useState({
    restaurants_live: 500,
    orders_processed: null,
    active_users: 2300,
    uptime: '99.99%',
    support: '24/7',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');
  const [faqSearchTerm, setFaqSearchTerm] = useState('');

  // Privacy/Terms/Security state
  const [expandedSection, setExpandedSection] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ==================== DATA LOADING ====================
  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const summary = await getPublicPlatformSummary();
        if (!cancelled && summary && typeof summary === 'object') {
          const summaryOrders = Number(summary.orders_processed ?? summary.completed_orders ?? summary.total_orders ?? summary.totalOrders ?? 0);
          setPlatformSummary((current) => ({
            ...current,
            ...summary,
            orders_processed: summaryOrders > 0 ? summaryOrders : current.orders_processed,
          }));
        }
      } catch (e) { /* ignore */ }

      try {
        const dashboard = await getPlatformDashboardData();
        if (!cancelled && dashboard && typeof dashboard === 'object') {
          const dashboardOrders = Number(dashboard.totalOrders ?? dashboard.completedOrders ?? dashboard.total_orders ?? dashboard.completed_orders ?? 0);
          if (dashboardOrders > 0) {
            setPlatformSummary((cur) => ({ ...cur, orders_processed: dashboardOrders }));
          }
        }
      } catch (e) { /* ignore dashboard errors */ } finally {
        setIsLoading(false);
      }
    };

    loadSummary();

    return () => { cancelled = true; };
  }, []);

  // Load pricing plans
  useEffect(() => {
    let cancelled = false;

    const normalizePlan = (plan) => {
      const rawTier = plan.tier || '';
      const tier = typeof rawTier === 'string' ? rawTier.toLowerCase() : 'monthly';
      const normalizedFeatures = Array.isArray(plan.features)
        ? plan.features
        : typeof plan.features === 'string'
          ? plan.features.split(',').map((item) => item.trim()).filter(Boolean)
          : ['Everything in Premium', 'Dedicated support', 'Custom integrations', 'Unlimited menu items', 'Unlimited staff', 'API access'];

      const name = plan.name || (tier === 'six_month' ? '6-Month' : tier === 'yearly' ? 'Yearly' : 'Monthly');
      const period = tier === 'yearly' ? 'year' : tier === 'six_month' ? '6 months' : 'month';
      const priceValue = tier === 'yearly'
        ? plan.price_yearly ?? plan.priceYearly ?? plan.price ?? 0
        : tier === 'six_month'
          ? plan.price_yearly ?? plan.priceYearly ?? plan.price ?? 0
          : plan.price_monthly ?? plan.priceMonthly ?? plan.price ?? 0;

      return {
        name,
        description: plan.description || '',
        price: formatPrice(Number(priceValue) || 0),
        period,
        features: normalizedFeatures,
        recommended: tier === 'six_month',
      };
    };

    const loadPlans = async () => {
      try {
        const plans = await getSubscriptionPlans();
        if (cancelled) return;
        if (Array.isArray(plans) && plans.length > 0) {
          setPricing(plans.map(normalizePlan));
        } else {
          setPricing([]);
        }
      } catch (error) {
        setPricing([]);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    };

    loadPlans();
    return () => { cancelled = true; };
  }, []);

  // ==================== CONTACT FORM HANDLERS ====================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError((resp && resp.message) || 'Failed to send message');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FAQ HANDLERS ====================
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // ==================== DATA DEFINITIONS ====================
  const stats = [
    { value: compactNumber(platformSummary.restaurants_live), label: 'Restaurants Live', suffix: '', icon: FireIcon, gradient: 'from-orange-500 to-amber-500' },
    { value: compactNumber(platformSummary.orders_processed ?? 0), label: 'Orders Processed', suffix: '', icon: TrophyIcon, gradient: 'from-blue-500 to-cyan-500' },
    { value: '98%', label: 'Customer Retention', suffix: '', icon: HeartIcon, gradient: 'from-rose-500 to-pink-500' },
    { value: '24/7', label: 'Priority Support', suffix: '', icon: AcademicCapIcon, gradient: 'from-emerald-500 to-green-500' },
  ];

  const features = [
    { icon: DevicePhoneMobileIcon, title: 'Mobile-first Menus', description: 'Blazing-fast menu pages that feel like a native app on any smartphone.', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    { icon: QrCodeIcon, title: 'Smart QR Flows', description: 'Instant table QR codes with dine-in, takeaway & prepayment modes.', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: PresentationChartLineIcon, title: 'Live Performance Data', description: 'Monitor revenue, popular items & staff performance from one dashboard.', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: ClockIcon, title: 'Real-time Updates', description: 'Change prices, availability & descriptions — reflected instantly.', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Bars3BottomLeftIcon, title: 'Operational Simplicity', description: 'Clear workflows for waiters, kitchen display & manager oversight.', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50', iconColor: 'text-rose-600' },
    { icon: ShieldCheckIcon, title: 'Enterprise Security', description: 'GDPR-ready, encrypted payments, and 99.99% uptime SLA.', color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  ];

  const advancedFeatures = [
    { icon: CreditCardIcon, title: 'Split Payments', description: 'Let guests split bills seamlessly via QR or waiter assistance.', gradient: 'from-emerald-400 to-cyan-400' },
    { icon: GlobeAltIcon, title: 'Multi-language', description: 'Auto-translate menus into 15+ languages for international guests.', gradient: 'from-blue-400 to-indigo-400' },
    { icon: ChatBubbleLeftRightIcon, title: 'AI Order Assistant', description: 'Smart upsell suggestions & allergen alerts during ordering.', gradient: 'from-purple-400 to-pink-400' },
    { icon: CalendarDaysIcon, title: 'Reservations Sync', description: 'Connect with Google Calendar & booking platforms automatically.', gradient: 'from-orange-400 to-red-400' },
  ];

  const testimonials = [
    { quote: "MenuGo completely removed friction from our ordering process. Our staff loves it, and customers keep coming back!", name: 'Luca Romano', title: 'Owner, Trattoria Roma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', rating: 5 },
    { quote: "The analytics dashboard gave us insights we never had before. We redesigned our menu and saw a 22% increase in average check.", name: 'Priya Patel', title: 'Manager, Spice Route', avatar: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=200&q=80', rating: 5 },
    { quote: "Onboarding took only 48 hours, and the QR codes work perfectly even during Friday rush hours. A game-changer.", name: 'Daniel Kim', title: 'GM, Seoul Eats', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80', rating: 5 },
  ];

  const stepCards = [
    { step: '01', title: 'Create your account', desc: 'Sign up and add your restaurant details — takes under 2 minutes.', icon: RocketLaunchIcon, gradient: 'from-orange-500 to-amber-500' },
    { step: '02', title: 'Upload your menu', desc: 'Add items, prices, and categories. Bulk import from Excel or PDF.', icon: DevicePhoneMobileIcon, gradient: 'from-blue-500 to-cyan-500' },
    { step: '03', title: 'Print QR codes & go live', desc: 'Download your table QR codes, place them, and start accepting orders.', icon: QrCodeIcon, gradient: 'from-emerald-500 to-green-500' },
  ];

  const values = [
    { icon: HeartIcon, title: 'Customer First', description: 'We design every screen around the real needs of restaurant teams and guests.', gradient: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50' },
    { icon: LightBulbIcon, title: 'Innovation', description: 'We keep the platform practical, modern, and easy to adopt in busy environments.', gradient: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50' },
    { icon: UsersIcon, title: 'Collaboration', description: 'We build for kitchens, waiters, owners, and diners as one connected system.', gradient: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
    { icon: GlobeAltIcon, title: 'Global Impact', description: 'We want to help restaurants everywhere deliver smoother, smarter service.', gradient: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50' },
  ];

  const milestones = [
    { year: '2026', title: 'Started MenuGo', text: 'Built to replace paper menus with a smoother digital flow.', icon: RocketLaunchIcon, gradient: 'from-orange-500 to-amber-500' },
    { year: '2026', title: 'Expanded Workflows', text: 'Added live orders, kitchen visibility, and staff coordination.', icon: ClockIcon, gradient: 'from-blue-500 to-cyan-500' },
    { year: 'Now', title: 'Growing With Restaurants', text: 'Helping teams deliver faster service and clearer analytics.', icon: ChartBarIcon, gradient: 'from-emerald-500 to-green-500' },
  ];

  const metrics = [
    { value: `${compactNumber(platformSummary.restaurants_live)}+`, label: 'Active Restaurants', icon: BuildingStorefrontIcon, gradient: 'from-orange-500 to-amber-500' },
    { value: `${compactNumber(platformSummary.active_users || 2300)}+`, label: 'Team Members Enabled', icon: UserGroupIcon, gradient: 'from-blue-500 to-cyan-500' },
    { value: '99.99%', label: 'Platform Uptime', icon: ShieldCheckIcon, gradient: 'from-emerald-500 to-green-500' },
    { value: '24/7', label: 'Priority Support', icon: AcademicCapIcon, gradient: 'from-purple-500 to-violet-500' },
  ];

  const capabilities = [
    { icon: BuildingStorefrontIcon, title: 'Built for hospitality', text: 'Designed for front-of-house speed, kitchen clarity, and management control.', gradient: 'from-orange-500 to-amber-500' },
    { icon: ChartBarIcon, title: 'Actionable analytics', text: 'See what sells, where delays happen, and how to improve service quickly.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: ShieldCheckIcon, title: 'Secure by design', text: 'Protected sessions and stable infrastructure for day-to-day restaurant operations.', gradient: 'from-emerald-500 to-green-500' },
  ];

  const contactInfo = [
    { icon: EnvelopeIcon, title: 'Email Us', details: 'support@menugo.com', sub: 'sales@menugo.com', action: 'mailto:support@menugo.com', actionText: 'support@menugo.com', gradient: 'from-blue-500 to-cyan-500' },
    { icon: PhoneIcon, title: 'Call Us', details: '+1 (555) 123-4567', sub: 'Mon-Fri, 9am-6pm EST', action: 'tel:+15551234567', actionText: 'Call Now', gradient: 'from-emerald-500 to-green-500' },
    { icon: MapPinIcon, title: 'Visit Us', details: '123 Main Street', sub: 'Addis Abeba, AA 1000', action: 'https://maps.google.com', actionText: 'Get Directions', gradient: 'from-purple-500 to-violet-500' },
    { icon: ClockIcon, title: 'Support Hours', details: '24/7 Support', sub: 'Email support available 24/7', action: null, actionText: null, gradient: 'from-orange-500 to-amber-500' },
  ];

  const faqs = [
    { id: 1, category: 'getting-started', question: 'How do I get started with MenuGo?', answer: 'Getting started is easy! Sign up for a free trial, complete your restaurant profile, and start adding your menu items. Our onboarding wizard will guide you through each step. You can have your digital menu ready in less than 30 minutes.', related: ['How long does setup take?', 'Is there a setup fee?'] },
    { id: 2, category: 'getting-started', question: 'Is there a setup fee?', answer: 'No, there are absolutely no setup fees. You only pay for your chosen subscription plan. We believe in making it easy for restaurants to go digital without any upfront costs.', related: ['What payment methods do you accept?', 'Can I cancel anytime?'] },
    { id: 3, category: 'menu-management', question: 'How do I add menu items?', answer: 'You can add menu items through your admin dashboard. Simply click "Add Item", fill in the details (name, description, price, category), upload an image, and set availability. Your menu updates are reflected instantly on the customer view.', related: ['Can I add images to menu items?', 'How do I organize categories?'] },
    { id: 4, category: 'menu-management', question: 'Can I organize menu items into categories?', answer: 'Yes! You can create and manage categories like "Appetizers", "Main Courses", "Desserts", "Drinks", and more. You can easily drag and drop items between categories and reorder them as needed.', related: ['How many categories can I have?', 'Can I have subcategories?'] },
    { id: 5, category: 'orders', question: 'How do customers place orders?', answer: 'Customers scan your QR code, browse your menu, select items, add them to their cart, enter their table number, and submit their order. The order appears instantly on your dashboard for staff to process.', related: ['Can customers customize their orders?', 'How are orders tracked?'] },
    { id: 6, category: 'orders', question: 'Can customers customize their orders?', answer: 'Yes! Customers can add special instructions, request modifications, and note allergies or dietary preferences. You can also enable custom options like "Extra Cheese" or "Gluten-Free" for specific items.', related: ['Can I customize the order form?', 'Is there a limit on modifications?'] },
    { id: 7, category: 'account', question: 'Is my data secure?', answer: 'Yes! We use enterprise-grade security measures including AES-256 encryption for data at rest, TLS 1.3 for data in transit, regular security audits, and 24/7 monitoring. Your data is as secure as with any major banking platform.', related: ['Do you share my data with third parties?', 'What compliance certifications do you have?'] },
    { id: 8, category: 'account', question: 'How do I manage staff access?', answer: 'You can create staff accounts for your team with role-based permissions. Assign roles like "Manager", "Waiter", or "Chef" with appropriate access levels. You can also enable or disable accounts instantly.', related: ['How many staff accounts can I create?', 'Can I limit what staff can see?'] },
    { id: 9, category: 'technical', question: 'Do I need to install any software?', answer: 'No! MenuGo is a fully cloud-based SaaS platform. You don\'t need to install any software. Simply access your dashboard through any modern web browser on your computer, tablet, or smartphone.', related: ['What browsers are supported?', 'Is there a mobile app available?'] },
    { id: 10, category: 'technical', question: 'What happens if my internet goes down?', answer: 'We recommend having a backup plan. While MenuGo requires internet access, we offer offline mode capabilities (coming soon) and suggest printing QR codes in advance. You can also access basic features through our mobile app.', related: ['Is there an offline mode?', 'Can I use it without internet?'] },
    { id: 11, category: 'billing', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. For enterprise customers, we also offer invoice-based billing.', related: ['Can I pay annually for a discount?', 'Is there a free trial available?'] },
    { id: 12, category: 'billing', question: 'Can I cancel my subscription anytime?', answer: 'Yes, you can cancel your subscription at any time from your account settings. There are no long-term contracts or cancellation fees. You\'ll have access until the end of your current billing period.', related: ['Will I get a refund if I cancel?', 'Can I pause my subscription?'] },
  ];

  const faqCategories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'menu-management', label: 'Menu Management', icon: Menu },
    { id: 'orders', label: 'Orders & Payments', icon: ShoppingBag },
    { id: 'account', label: 'Account & Security', icon: UserCheck },
    { id: 'technical', label: 'Technical', icon: Server },
    { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCardIcon },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(faqSearchTerm.toLowerCase());
    const matchesCategory = activeFaqCategory === 'all' || faq.category === activeFaqCategory;
    return matchesSearch && matchesCategory;
  });

  const termsSections = [
    { id: 'acceptance', icon: FileCheck, title: '1. Acceptance of Terms', content: 'By using MenuGo, you agree to these terms. If you don\'t agree, please don\'t use our service.', details: ['You must be at least 18 years old to use this service.', 'You are responsible for maintaining the security of your account.', 'You agree to provide accurate and complete information.', 'You will use the service in compliance with all applicable laws.'] },
    { id: 'account', icon: UserCheck, title: '2. Account Registration', content: 'Create and manage your account responsibly.', details: ['You are responsible for all activities under your account.', 'You must notify us immediately of any unauthorized use.', 'We reserve the right to suspend or terminate accounts.', 'You must keep your password secure and confidential.'] },
    { id: 'payments', icon: CreditCardIcon, title: '3. Payments & Subscriptions', content: 'Understand our payment terms and subscription plans.', details: ['All payments are processed securely through our payment partners.', 'Subscriptions auto-renew unless cancelled before the renewal date.', 'Refunds are handled according to our refund policy.', 'Prices may change with prior notice.'] },
    { id: 'data', icon: Database, title: '4. Data & Privacy', content: 'How we handle your data and protect your privacy.', details: ['We collect only necessary data to provide our services.', 'Your data is encrypted and stored securely.', 'We never sell your personal information to third parties.', 'You can request data deletion at any time.'] },
    { id: 'usage', icon: Globe, title: '5. Acceptable Use', content: 'Guidelines for using our service responsibly.', details: ['Do not use the service for any illegal activities.', 'Do not attempt to breach our security measures.', 'Do not interfere with other users\' experience.', 'Do not upload malicious content or code.'] },
    { id: 'intellectual', icon: Scale, title: '6. Intellectual Property', content: 'Ownership of content and intellectual property rights.', details: ['All content on MenuGo is protected by copyright.', 'You retain ownership of your content.', 'You grant us a license to display your content.', 'You may not copy or reproduce our content without permission.'] },
    { id: 'termination', icon: Gavel, title: '7. Termination', content: 'Conditions for terminating your account.', details: ['You may cancel your account at any time.', 'We may suspend or terminate accounts for violations.', 'Termination does not affect existing legal obligations.', 'Some provisions survive termination.'] },
    { id: 'liability', icon: AlertTriangle, title: '8. Limitation of Liability', content: 'Our liability is limited to the extent permitted by law.', details: ['We are not liable for indirect or consequential damages.', 'Our liability is limited to the amount paid for services.', 'We do not warrant uninterrupted or error-free service.', 'You use the service at your own risk.'] },
    { id: 'changes', icon: Calendar, title: '9. Changes to Terms', content: 'We may update these terms from time to time.', details: ['Changes are effective upon posting.', 'We will notify you of significant changes.', 'Continued use constitutes acceptance.', 'You should review terms periodically.'] },
    { id: 'contact', icon: HeartHandshake, title: '10. Contact Us', content: 'Reach out if you have questions or concerns.', details: ['Email: haymanotwondmagegn3@gmail.com', 'Phone: +251931486967', 'Address: AA Ethiopia, Suite 100', 'Support: support@menugo.com'] },
  ];

  const privacySections = [
    { id: 'information', icon: Database, title: '1. Information We Collect', content: 'We collect information to provide and improve our services.', details: ['Personal identification information (Name, email address, phone number)', 'Restaurant data (Menu items, pricing, categories, images)', 'Usage data (How you interact with our platform)', 'Device information (Browser type, IP address, device type)', 'Location data (With your permission)', 'Payment information (Processed securely through partners)'] },
    { id: 'usage', icon: Eye, title: '2. How We Use Your Information', content: 'We use your data to deliver and improve our services.', details: ['To provide and maintain our services', 'To process your orders and payments', 'To send you updates and promotional materials', 'To improve and optimize our platform', 'To ensure security and prevent fraud', 'To comply with legal obligations'] },
    { id: 'sharing', icon: Share2, title: '3. Information Sharing', content: 'We do not sell your personal information to third parties.', details: ['We share data with service providers who help us operate', 'We may share data with your consent', 'We may share data to comply with legal requirements', 'We do not sell your data to advertisers or third parties', 'Data is shared only as described in this policy'] },
    { id: 'security', icon: Lock, title: '4. Data Security', content: 'We implement industry-standard security measures.', details: ['AES-256 encryption for data at rest', 'TLS 1.3 encryption for data in transit', 'Regular security audits and penetration testing', '24/7 monitoring and threat detection', 'Access controls and authentication protocols', 'Regular backups and disaster recovery plans'] },
    { id: 'cookies', icon: Cookie, title: '5. Cookies & Tracking', content: 'We use cookies to enhance your experience.', details: ['Essential cookies for basic functionality', 'Analytics cookies to understand usage patterns', 'Preference cookies to remember your settings', 'Marketing cookies for targeted advertising (with consent)', 'You can manage cookie preferences in your browser settings'] },
    { id: 'rights', icon: ShieldCheck, title: '6. Your Rights', content: 'You have control over your personal data.', details: ['Right to access your personal data', 'Right to correct inaccurate data', 'Right to delete your data (Right to be forgotten)', 'Right to restrict or object to processing', 'Right to data portability', 'Right to withdraw consent at any time'] },
    { id: 'children', icon: Users, title: '7. Children\'s Privacy', content: 'We do not knowingly collect data from children.', details: ['Our services are not directed to children under 13', 'We do not knowingly collect data from minors', 'If we discover we have collected data from a child, we will delete it', 'Parents can contact us to request deletion of their child\'s data'] },
    { id: 'international', icon: Globe, title: '8. International Data Transfers', content: 'Your data may be transferred across borders.', details: ['We comply with GDPR and other data protection regulations', 'Data may be stored on servers in multiple countries', 'We ensure appropriate safeguards for international transfers', 'Standard contractual clauses are in place for data transfers'] },
    { id: 'changes', icon: Calendar, title: '9. Changes to This Policy', content: 'We may update this policy from time to time.', details: ['We will notify you of significant changes via email', 'The latest version will always be available on this page', 'Your continued use constitutes acceptance of the updated policy', 'We recommend reviewing this policy periodically'] },
    { id: 'contact', icon: HeartHandshake, title: '10. Contact Us', content: 'Reach out if you have questions about this policy.', details: ['Email: haymanotwondmagegn3@gmail.com', 'Phone: +251931486967', 'Address: AA Ethiopia, Suite 100', 'Data Protection Officer: dpo@menugo.com'] },
  ];

  const securityFeatures = [
    { id: 'encryption', icon: Lock, title: 'End-to-End Encryption', description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.', details: 'We use TLS 1.3 for data in transit and AES-256 for data at rest. Your sensitive information is never stored in plain text.', status: 'Active', statusColor: 'green' },
    { id: 'authentication', icon: ShieldCheck, title: 'Multi-Factor Authentication', description: 'Protect your account with additional layers of security through MFA.', details: 'Support for authenticator apps, SMS verification, and biometric authentication options.', status: 'Available', statusColor: 'blue' },
    { id: 'compliance', icon: FileCheck, title: 'Compliance & Certifications', description: 'We maintain rigorous compliance standards and industry certifications.', details: 'GDPR compliant, SOC 2 Type II certified, and regularly audited by third-party security firms.', status: 'Certified', statusColor: 'green' },
    { id: 'monitoring', icon: Server, title: 'Real-time Monitoring', description: '24/7 monitoring and threat detection to protect your data.', details: 'Continuous security monitoring, automated threat detection, and instant alerting systems.', status: 'Active', statusColor: 'green' },
    { id: 'backup', icon: Database, title: 'Data Backup & Recovery', description: 'Regular automated backups with disaster recovery protocols.', details: 'Daily automated backups stored in geographically redundant locations with 99.99% uptime SLA.', status: 'Active', statusColor: 'green' },
    { id: 'access', icon: UserCheck, title: 'Access Control', description: 'Granular role-based access control for your team.', details: 'Fine-grained permissions, SSO integration, and detailed audit logs for all actions.', status: 'Available', statusColor: 'blue' },
  ];

  const securityBadges = [
    { name: 'GDPR Compliant', icon: Shield },
    { name: 'SOC 2 Type II', icon: BadgeCheck },
    { name: 'ISO 27001', icon: ShieldAlert },
    { name: 'PCI DSS', icon: CreditCardIcon }
  ];

  const securityStats = [
    { label: 'Security Incidents', value: '0', description: 'In the last 365 days' },
    { label: 'Uptime', value: '99.99%', description: 'Average uptime' },
    { label: 'Data Centers', value: '1', description: 'Globally centralized' },
    { label: 'Certifications', value: '12+', description: 'Security certifications' }
  ];

  const securityCertifications = [
    { icon: ShieldCheck, color: 'orange', title: 'SOC 2 Type II', desc: 'Independent audit of our security, availability, and confidentiality controls.' },
    { icon: Lock, color: 'green', title: 'ISO 27001', desc: 'International standard for information security management systems.' },
    { icon: Globe, color: 'purple', title: 'GDPR Compliant', desc: 'Full compliance with European data protection regulations.' }
  ];

  const securityBestPractices = [
    { color: 'green', title: 'Use Strong Passwords', desc: 'Use a mix of uppercase, lowercase, numbers, and special characters.' },
    { color: 'blue', title: 'Enable Two-Factor Authentication', desc: 'Add an extra layer of security to your account.' },
    { color: 'purple', title: 'Regular Security Updates', desc: 'Keep your software and systems up to date.' }
  ];

  const impactStats = [
    { icon: CurrencyDollarIcon, value: '22%', label: 'Avg. revenue increase', gradient: 'from-emerald-500 to-green-500' },
    { icon: ClockIcon, value: '35%', label: 'Faster table turns', gradient: 'from-blue-500 to-cyan-500' },
    { icon: WifiIcon, value: '100%', label: 'Digital adoption rate', gradient: 'from-purple-500 to-violet-500' },
    { icon: CheckBadgeIcon, value: '98%', label: 'Customer satisfaction', gradient: 'from-rose-500 to-pink-500' },
  ];

  const teamStories = [
    { quote: "MenuGo cut our ticket times by 30% and made weekend rushes effortless.", name: "Sarah Chen", role: "Owner, The Noodle House", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80", rating: 5 },
    { quote: "The analytics dashboard helped us increase average check size by 18% in two months.", name: "Marcus Johnson", role: "Operations Director, Burger & Co.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", rating: 5 },
    { quote: "Finally a QR ordering system that waiters actually enjoy using.", name: "Elena Rossi", role: "General Manager, Pizzeria Centrale", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", rating: 5 }
  ];

  const services = [
    { icon: DevicePhoneMobileIcon, title: 'Digital Menu Creation', description: 'Create polished menus with images, descriptions, categories, and quick edits.', features: ['Drag-and-drop layout', 'Menu sections', 'Image support', 'Easy updates'], accent: 'from-sky-100 to-sky-50 text-sky-700', gradient: 'from-sky-500 to-cyan-500', bgColor: 'bg-sky-50' },
    { icon: QrCodeIcon, title: 'QR Ordering System', description: 'Generate QR experiences for tables, promotions, and menu access in seconds.', features: ['Table-specific QR codes', 'Printable QR assets', 'Scan tracking', 'Fast guest access'], accent: 'from-emerald-100 to-emerald-50 text-emerald-700', gradient: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50' },
    { icon: ChartBarIcon, title: 'Analytics & Insights', description: 'See revenue, sales trends, customer activity, and top items from one dashboard.', features: ['Live dashboards', 'Revenue reports', 'Menu performance', 'Customer trends'], accent: 'from-amber-100 to-amber-50 text-amber-700', gradient: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50' },
    { icon: ClockIcon, title: 'Real-time Updates', description: 'Push menu changes, pricing, and availability updates instantly across devices.', features: ['Instant sync', 'Scheduled changes', 'Availability control', 'Version history'], accent: 'from-orange-100 to-orange-50 text-orange-700', gradient: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50' },
    { icon: UsersIcon, title: 'Staff Management', description: 'Coordinate staff roles, shifts, and responsibilities with fewer manual steps.', features: ['Role access', 'Shift planning', 'Activity logs', 'Team visibility'], accent: 'from-rose-100 to-rose-50 text-rose-700', gradient: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50' },
    { icon: ShieldCheckIcon, title: 'Secure Platform', description: 'Use a stable, secure system with encrypted sessions and reliable access control.', features: ['Secure sessions', 'Data protection', 'Role permissions', 'Backup friendly'], accent: 'from-cyan-100 to-cyan-50 text-cyan-700', gradient: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-50' },
  ];

  const extendedServices = [
    { icon: CreditCardIcon, title: 'Split Payments', description: 'Allow guests to split bills easily via QR or waiter assistance.', gradient: 'from-emerald-400 to-cyan-400' },
    { icon: ChatBubbleLeftRightIcon, title: 'AI Order Assistant', description: 'Smart upsell suggestions and allergen alerts during ordering.', gradient: 'from-purple-400 to-pink-400' },
    { icon: CalendarDaysIcon, title: 'Reservations Sync', description: 'Integrate with Google Calendar and booking platforms automatically.', gradient: 'from-orange-400 to-red-400' },
    { icon: LanguageIcon, title: 'Multi-language Menus', description: 'Auto-translate menus into 15+ languages for international guests.', gradient: 'from-blue-400 to-indigo-400' },
  ];

  const process = [
    { icon: BuildingStorefrontIcon, title: 'Set up your space', text: 'Add your restaurant, tables, and menu structure.', gradient: 'from-orange-500 to-amber-500' },
    { icon: QrCodeIcon, title: 'Go live with QR', text: 'Place QR codes and let guests access menus instantly.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: TrophyIcon, title: 'Improve continuously', text: 'Use analytics to refine service and grow revenue.', gradient: 'from-emerald-500 to-green-500' },
  ];

  const serviceFaqs = [
    { q: 'How fast can I set up MenuGo?', a: 'Most restaurants go live within 24 hours. Our onboarding team guides you every step.' },
    { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade anytime. No hidden fees.' },
    { q: 'Do I need any hardware?', a: 'No, MenuGo works on existing smartphones, tablets, and printers.' },
    { q: 'Is there a contract?', a: 'No long-term contracts. Cancel anytime with one month notice.' },
  ];

  const serviceStats = [
    { value: `${compactNumber(platformSummary.restaurants_live)}+`, label: 'Restaurants live', icon: BuildingStorefrontIcon, gradient: 'from-orange-500 to-amber-500' },
    { value: `${compactNumber(platformSummary.active_users || 2300)}+`, label: 'Active users', icon: UserGroupIcon, gradient: 'from-blue-500 to-cyan-500' },
    { value: `${compactNumber(platformSummary.orders_processed ?? 0)}+`, label: 'Orders processed', icon: ChartBarIcon, gradient: 'from-emerald-500 to-green-500' },
    { value: platformSummary.uptime || '99.99%', label: 'Uptime', icon: ShieldCheckIcon, gradient: 'from-purple-500 to-violet-500' },
    { value: platformSummary.support || '24/7', label: 'Support', icon: AcademicCapIcon, gradient: 'from-rose-500 to-pink-500' },
  ];

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-gray-900 overflow-x-hidden">
      <PublicHeader />

      <div ref={containerRef}>
        {/* ==================== HOME SECTION ==================== */}
        <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
          <BackgroundCarousel />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.25),transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.15),transparent_60%)]" />
          <motion.div animate={floatAnimation} className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <motion.div variants={fadeInUp} className="max-w-2xl">
                <motion.div whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-orange-700 shadow-lg backdrop-blur-sm transition-all hover:shadow-orange-100">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  SOFTWARE AS A SERVICE (SaaS) FOR RESTAURANTS
                </motion.div>
                <motion.h1 variants={fadeInUp} className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Design a better
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    restaurant journey
                  </span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  MenuGo helps restaurants move from paper menus to a complete digital flow with QR ordering,
                  instant updates, and practical analytics your team can use every day.
                </motion.p>
                <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50">
                      Book Demo
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#services" className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md">
                      Explore Features
                    </a>
                  </motion.div>
                </motion.div>
                <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4 text-green-500" /><span>No credit card required</span></div>
                  <div className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4 text-green-500" /><span>Free 14-day trial</span></div>
                </motion.div>
              </motion.div>

              <motion.div variants={heroImage} className="relative">
                <motion.div animate={floatAnimation} className="absolute -left-4 -top-4 h-32 w-32 rounded-2xl bg-orange-300/30 blur-2xl" />
                <motion.div animate={{ x: [0, 15, 0], y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-orange-400/25 blur-2xl" />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D" alt="MenuGo preview" className="h-auto w-full rounded-xl object-cover transition-transform duration-700 hover:scale-105" />
                  <div className="mt-4 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                    {stats.slice(0, 4).map((item, index) => (
                      <motion.div key={item.label} className="min-w-[100px] rounded-xl border border-slate-100 bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm flex-shrink-0 transition-all hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.08 }} whileHover={{ y: -2, scale: 1.02 }}>
                        <p className={`text-sm font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${item.gradient}`}>{item.value}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Home Stats */}
        <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={containerVariants} className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div key={index} variants={popIn} whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl hover:border-orange-200 group cursor-pointer">
                  <motion.div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center" whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <stat.icon className="h-4 w-4 text-orange-600" />
                  </motion.div>
                  <motion.p className={`mt-2 text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${stat.gradient}`}>{stat.value}</motion.p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Home Features */}
        <section className="bg-white py-16 sm:py-20" id="features">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">Core Features</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Everything you need to digitize your restaurant</h2>
                <p className="mt-3 text-lg text-slate-600">Powerful tools that work together seamlessly — from QR to checkout.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div key={index} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCard(index)} onMouseLeave={() => setHoveredCard(null)}>
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" initial={{ scale: 0 }} animate={{ scale: hoveredCard === index ? 1 : 0 }} transition={{ duration: 0.5 }} />
                  <div className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} transition-colors group-hover:bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor} transition-colors group-hover:text-white`} />
                  </div>
                  <h3 className="relative z-10 mb-2 text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="relative z-10 text-sm text-slate-600">{feature.description}</p>
                  <motion.div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" initial={{ x: -10 }} animate={{ x: hoveredCard === index ? 0 : -10 }}>
                    <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Home Advanced Features */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-800">
                  <LightBulbIcon className="h-4 w-4" />
                  Next‑gen capabilities
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Go beyond basic ordering</h2>
                <p className="mt-3 text-lg text-slate-600">Premium features designed to maximize revenue and guest satisfaction.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advancedFeatures.map((feature, idx) => (
                <motion.div key={idx} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative group rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer">
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.gradient})` }} />
                  <div className={`relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="relative mt-2 text-sm text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Home How It Works */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">Get Started</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Get started in 3 simple steps</h2>
                <p className="mt-3 text-lg text-slate-600">From setup to first order — faster than you think.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200 -z-10"></div>
              {stepCards.map((step, idx) => (
                <motion.div key={idx} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }} className="relative">
                  <div className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer">
                    <div className="mb-4 flex items-center justify-between">
                      <motion.span className={`text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent ${step.gradient}`} whileHover={{ scale: 1.1 }}>{step.step}</motion.span>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${step.gradient} shadow-lg`}><step.icon className="h-6 w-6 text-white" /></div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Home Testimonials */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-3">Testimonials</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Loved by restaurant teams</h2>
                <p className="mt-3 text-lg text-slate-600">Real feedback from happy customers.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div key={i} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer">
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => <StarIcon key={idx} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200" whileHover={{ scale: 1.1 }} />
                    <div><p className="text-sm font-bold text-slate-900">{t.name}</p><p className="text-xs text-slate-500">{t.title}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Home CTA */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-16 sm:py-20">
          <motion.div animate={floatAnimation} className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </motion.div>
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.h2 className="text-3xl font-extrabold text-white sm:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Ready to transform your restaurant?
            </motion.h2>
            <motion.p className="mt-4 text-lg text-orange-100" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Join thousands of restaurants already using MenuGo to streamline their operations.
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-orange-600 shadow-lg transition-all hover:shadow-orange-700/30 hover:bg-orange-50">
                  Start Free Trial
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#services" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 backdrop-blur-sm">
                  Learn More
                </a>
              </motion.div>
            </motion.div>
            <motion.div className="mt-6 flex justify-center items-center gap-6 text-sm text-orange-100" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <span className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4" />No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4" />14-day free trial</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ==================== ABOUT SECTION ==================== */}
        <section id="about" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div variants={fadeInDown} className="mx-auto max-w-3xl text-center">
                <motion.div whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 backdrop-blur-sm shadow-lg transition-all hover:shadow-orange-100">
                  <Sparkles className="h-4 w-4 animate-pulse" /> About MenuGo
                </motion.div>
                <motion.h1 variants={fadeInUp} className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  We help restaurants run a cleaner,
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    faster digital service flow
                  </span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  MenuGo brings menus, ordering, and operations into one polished system so teams can work faster and guests can enjoy a smoother dining experience.
                </motion.p>
                <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50">
                      Contact Us <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#services" className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md">
                      See Services
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Metrics */}
        <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {metrics.map((item, index) => (
                <motion.div key={item.label} variants={popIn} whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl hover:border-orange-200 group cursor-pointer">
                  <motion.div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center" whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <item.icon className="h-4 w-4 text-orange-600" />
                  </motion.div>
                  <motion.p className={`mt-2 text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${item.gradient}`}>{item.value}</motion.p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* About Story */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <motion.div whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-800">
                  <HeartIcon className="h-4 w-4" /> Our Story
                </motion.div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Built from real restaurant pain points</h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">MenuGo was created to solve the everyday friction that slows restaurants down: printing costs, outdated menus, scattered coordination, and lack of visibility during service.</p>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">We focused on a simple idea: give staff and owners one place to update content, manage orders, and make better decisions without extra complexity.</p>
                <div className="mt-8 space-y-4">
                  {milestones.map((item, idx) => (
                    <motion.div key={item.year} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                      whileHover={{ scale: 1.02, x: 8, transition: { type: 'spring', stiffness: 300 } }} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                      <motion.div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${item.gradient}`} whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                        <item.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2"><span className="text-xs font-black text-orange-600">{item.year}</span><h3 className="font-bold text-sm text-slate-900">{item.title}</h3></div>
                        <p className="mt-0.5 text-xs text-slate-500">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={heroImage} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
                <motion.div animate={floatAnimation} className="absolute -left-4 -top-4 h-32 w-32 rounded-2xl bg-orange-300/30 blur-2xl" />
                <motion.div animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-orange-400/25 blur-2xl" />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" alt="About MenuGo" className="h-auto w-full rounded-xl object-cover transition-transform duration-700 hover:scale-105" />
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <p className="text-xs font-semibold text-slate-900">Trusted by 500+ restaurants</p>
                    <p className="text-xs text-slate-500">Growing every day</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Values */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">Core Values</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What we value</h2>
                <p className="mt-3 text-lg text-slate-600">These principles shape every product decision and customer interaction.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div key={index} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCard(`value-${index}`)} onMouseLeave={() => setHoveredCard(null)}>
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${value.gradient})` }} />
                  <div className={`relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${value.bgColor} group-hover:scale-110 transition-transform`}>
                    <value.icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="relative text-lg font-bold text-slate-900">{value.title}</h3>
                  <p className="relative mt-2 text-sm text-slate-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Impact */}
        <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-orange-200 text-orange-800 text-sm font-semibold mb-3">Impact</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Real impact, measured</h2>
                <p className="mt-3 text-lg text-slate-700">Numbers from restaurants using MenuGo every day.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {impactStats.map((stat, idx) => (
                <motion.div key={idx} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.05, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl bg-white p-6 text-center shadow-md transition-all hover:shadow-xl overflow-hidden">
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.gradient})` }} />
                  <div className="relative">
                    <stat.icon className="mx-auto h-8 w-8 text-orange-600" />
                    <motion.p className="mt-2 text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${stat.gradient})` }}>{stat.value}</motion.p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Team Stories */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-3">Testimonials</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Stories from our community</h2>
                <p className="mt-3 text-lg text-slate-600">Real restaurant leaders share their experience with MenuGo.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {teamStories.map((story, idx) => (
                <motion.div key={idx} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer">
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(story.rating)].map((_, i) => <StarSolidIcon key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">"{story.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.img src={story.avatar} alt={story.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200" whileHover={{ scale: 1.1 }} />
                    <div><p className="text-sm font-bold text-slate-900">{story.name}</p><p className="text-xs text-slate-500">{story.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Capabilities */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">Our Approach</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">How our team thinks</h2>
                <p className="mt-3 text-lg text-slate-600">We ship with a product-first mindset and build around the realities of restaurant operations.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {capabilities.map((item, index) => (
                <motion.div key={item.title} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer">
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${item.gradient})` }} />
                  <div className="relative">
                    <motion.div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg`} whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SERVICES SECTION ==================== */}
        <section id="services" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div variants={fadeInUp} className="max-w-2xl">
                <motion.div whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-700 backdrop-blur-sm shadow-lg transition-all hover:shadow-orange-100">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Services & Pricing
                </motion.div>
                <motion.h1 variants={fadeInUp} className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Tools that make your
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    restaurant feel effortless
                  </span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  MenuGo combines digital menus, QR ordering, analytics, and team coordination into one clean system. The result is faster service, less manual work, and a better guest experience.
                </motion.p>
                <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50">
                      Book a Demo <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#pricing" className="inline-flex items-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm hover:shadow-md">
                      View Pricing
                    </a>
                  </motion.div>
                </motion.div>
                <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><CheckBadgeIcon className="h-4 w-4 text-emerald-600" />No credit card required</div>
                  <div className="flex items-center gap-1.5"><CheckBadgeIcon className="h-4 w-4 text-emerald-600" />Fast setup and onboarding</div>
                </motion.div>
              </motion.div>

              <motion.div variants={heroImage} className="relative">
                <motion.div animate={floatAnimation} className="absolute -left-4 -top-4 h-32 w-32 rounded-2xl bg-orange-300/30 blur-2xl" />
                <motion.div animate={{ x: [0, 15, 0], y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-orange-400/25 blur-2xl" />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
                  <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D" alt="MenuGo services preview" className="h-auto w-full rounded-xl object-cover transition-transform duration-700 hover:scale-105" />
                  <div className="mt-4 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                    {serviceStats.slice(0, 4).map((item, index) => (
                      <motion.div key={item.label} className="min-w-[100px] rounded-xl border border-slate-100 bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm flex-shrink-0 transition-all hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.08 }} whileHover={{ y: -2, scale: 1.02 }}>
                        <p className={`text-sm font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${item.gradient}`}>{item.value}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services How It Works */}
        <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <motion.span variants={fadeInUp} className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-3">How It Works</motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Get started in 3 simple steps</motion.h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200 -z-10"></div>
              {process.map((item, index) => (
                <motion.div key={item.title} variants={popIn} whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }} className="relative group">
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl cursor-pointer">
                    <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg mb-4`}><item.icon className="h-6 w-6 text-white" /></div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                    <motion.div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" initial={{ x: -10 }} animate={{ x: hoveredCard === `process-${index}` ? 0 : -10 }}>
                      <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Services Core Services */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">Core Services</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Everything your service team needs</h2>
                <p className="mt-3 text-lg text-slate-600">A complete toolkit to digitize restaurant operations while keeping the interface simple and polished.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div key={index} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCard(index)} onMouseLeave={() => setHoveredCard(null)}>
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${service.gradient})` }} initial={{ scale: 0 }} animate={{ scale: hoveredCard === index ? 1 : 0 }} transition={{ duration: 0.5 }} />
                  <div className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.bgColor} transition-colors group-hover:bg-gradient-to-r ${service.gradient}`}>
                    <service.icon className={`h-6 w-6 ${service.accent.split(' ')[2]} transition-colors group-hover:text-white`} />
                  </div>
                  <h3 className="relative z-10 text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="relative z-10 mt-2 text-sm text-slate-600">{service.description}</p>
                  <ul className="relative z-10 mt-4 space-y-2">
                    {service.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" />{feature}</li>)}
                  </ul>
                  <a href="#contact" className="relative z-10 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-800">
                    Learn more <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <motion.div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" initial={{ x: -10 }} animate={{ x: hoveredCard === index ? 0 : -10 }}>
                    <ChevronRightIcon className="h-5 w-5 text-orange-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Extended Capabilities */}
        <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-800">
                  <Sparkles className="h-4 w-4" /> Advanced Features
                </span>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Powerful capabilities</h2>
                <p className="mt-3 text-lg text-slate-600">Premium features to elevate your guest experience.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {extendedServices.map((service, idx) => (
                <motion.div key={idx} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer">
                  <motion.div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${service.gradient})` }} />
                  <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r shadow-lg" style={{ backgroundImage: `linear-gradient(to right, ${service.gradient})` }}>
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-slate-900">{service.title}</h3>
                  <p className="relative mt-2 text-sm text-slate-500">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Testimonials */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-3">Testimonials</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Trusted by restaurant owners</h2>
                <p className="mt-3 text-lg text-slate-600">Real results from real teams.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div key={i} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer">
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => <StarSolidIcon key={idx} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200" whileHover={{ scale: 1.1 }} />
                    <div><p className="text-sm font-bold text-slate-900">{t.name}</p><p className="text-xs text-slate-500">{t.title}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Pricing */}
        <section id="pricing" className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-3">Pricing</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Simple pricing that scales with you</h2>
                <p className="mt-3 text-lg text-slate-600">Pick a plan that fits your restaurant today and upgrade when you need more locations or automation.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricing.length > 0 ? pricing.map((plan, index) => (
                <motion.div key={index} variants={popIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                  className={`relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl ${plan.recommended ? 'border-2 border-orange-400 ring-2 ring-orange-500/20' : 'border border-slate-200'}`}>
                  {plan.recommended && <motion.div className="bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-white" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 3, repeat: Infinity }}>🔥 Most Popular</motion.div>}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{plan.price}</span>
                      {plan.period && <span className="pb-1 text-sm text-slate-500">/{plan.period}</span>}
                    </div>
                    <ul className="mt-5 space-y-2.5 text-left">
                      {(plan.features || []).map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600"><CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{feature}</span></li>)}
                    </ul>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <a href="#contact" className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all ${plan.recommended ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50' : 'border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600'}`}>
                        Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-3 text-center py-8 text-slate-500">Loading pricing plans...</div>
              )}
            </div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 text-center text-sm text-slate-500">All plans include a 14-day free trial. No credit card required.</motion.p>
          </div>
        </section>

        {/* Services FAQ */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">FAQ</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Frequently asked questions</h2>
                <p className="mt-3 text-lg text-slate-600">Everything you need to know before getting started.</p>
              </motion.div>
            </div>
            <div className="space-y-4">
              {serviceFaqs.map((faq, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 300 } }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-orange-200 cursor-pointer">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="text-orange-500 text-lg">Q:</span> {faq.q}</h3>
                  <p className="mt-2 text-sm text-slate-600 pl-6"><span className="text-orange-500 font-semibold">A:</span> {faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services CTA */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-16 sm:py-20">
          <motion.div animate={floatAnimation} className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </motion.div>
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.h2 className="text-3xl font-extrabold text-white sm:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Ready to upgrade your restaurant workflow?
            </motion.h2>
            <motion.p className="mt-4 text-lg text-orange-100" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Start with a flexible plan, then scale your menus, analytics, and team operations as your business grows.
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-orange-600 shadow-lg transition-all hover:shadow-orange-700/30 hover:bg-orange-50">
                  Start Free Trial <ArrowRightIcon className="h-4 w-4" />
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#faq" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 backdrop-blur-sm">
                  Learn More
                </a>
              </motion.div>
            </motion.div>
            <motion.div className="mt-6 flex justify-center items-center gap-6 text-sm text-orange-100" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <span className="flex items-center gap-1"><CheckBadgeIcon className="h-4 w-4" />No credit card required</span>
              <span className="flex items-center gap-1"><CheckBadgeIcon className="h-4 w-4" />14-day free trial</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ==================== CONTACT SECTION ==================== */}
        <section id="contact" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
                animate={{ y: [0, -200, 0], x: [0, Math.random() * 80 - 40, 0] }}
                transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 8 }} />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <motion.div animate={floatAnimation} className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <motion.div animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl">
              <motion.div whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-white mb-4">
                <Sparkles className="h-4 w-4 animate-pulse" /> Get in touch
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Let's talk
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 text-base text-orange-100 max-w-2xl mx-auto sm:text-lg">
                We're here to answer your questions, schedule a demo, or help you get started with MenuGo.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-10 bg-white -mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }} viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl overflow-hidden cursor-pointer">
                  <div className={`relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r ${info.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                    <info.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-slate-900">{info.title}</h3>
                  <p className="relative mt-1 text-sm text-slate-600 font-medium">{info.details}</p>
                  <p className="relative text-xs text-slate-500">{info.sub}</p>
                  {info.action && (
                    <motion.a href={info.action} className="relative mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-600 transition-colors hover:text-orange-800" target={info.title === 'Visit Us' ? '_blank' : '_self'} rel="noopener noreferrer" whileHover={{ x: 4 }}>
                      {info.actionText} <ArrowRightIcon className="h-3 w-3" />
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 300 }} viewport={{ once: true }}
                className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
                  <p className="mt-1 text-sm text-slate-600">We'll reply within 24 hours. For urgent issues, use live chat.</p>
                </motion.div>

                <AnimatePresence>
                  {submitted && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-green-700"><CheckCircleIcon className="h-5 w-5" /><span className="font-medium">Thank you — we'll get back to you shortly.</span></div>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-5 w-5" /><span className="font-medium">{error}</span></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name *</label>
                      <div className="relative group">
                        <UsersIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300" placeholder="Your name" />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address *</label>
                      <div className="relative group">
                        <EnvelopeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300" placeholder="you@example.com" />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone (optional)</label>
                      <div className="relative group">
                        <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300" placeholder="+1 (555) 000-0000" />
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                      <div className="relative group">
                        <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 group-hover:border-orange-300" placeholder="How can we help?" />
                      </div>
                    </motion.div>
                  </div>
                  <motion.div whileHover={{ scale: 1.005 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Message *</label>
                    <textarea name="message" rows={5} required value={formData.message} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-orange-300" placeholder="Please describe your question or concern..." />
                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                  </motion.div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70">
                    {loading ? (
                      <><svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</>
                    ) : (<>Send Message <ArrowRightIcon className="h-4 w-4" /></>)}
                  </motion.button>
                </form>
              </motion.div>

              {/* Right column: Map + Live Chat + Newsletter */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 300 }} viewport={{ once: true }} className="space-y-6">
                <motion.div whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 transition-all hover:shadow-2xl">
                  <div className="h-56 w-full bg-slate-200 relative overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} />
                    <iframe src="https://www.google.com/maps?q=9.0320,38.7469&z=13&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="MenuGo Office Location"></iframe>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div><h3 className="text-base font-bold text-slate-900">Visit our office</h3><p className="mt-1 text-sm text-slate-600">123 Main Street, Suite 100<br />Addis Abeba, AA 1000</p></div>
                      <motion.a href="https://www.google.com/maps/dir/?api=1&destination=9.0320,38.7469" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:bg-orange-100" whileHover={{ x: 4 }}>
                        Directions <ArrowRightIcon className="h-3 w-3" />
                      </motion.a>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">Follow us</span>
                      <div className="flex gap-3">
                        {[
                          { icon: Twitter, color: 'hover:text-sky-500' },
                          { icon: Facebook, color: 'hover:text-blue-600' },
                          { icon: Instagram, color: 'hover:text-pink-500' },
                          { icon: Linkedin, color: 'hover:text-blue-700' },
                          { icon: Youtube, color: 'hover:text-red-600' },
                        ].map((social, idx) => (
                          <motion.a key={idx} href="#" className={`text-slate-400 transition-colors ${social.color}`} whileHover={{ y: -2, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <social.icon className="h-5 w-5" />
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-white/20" />
                      <ChatBubbleLeftRightIcon className="relative h-8 w-8" />
                    </div>
                    <div><h3 className="text-lg font-bold">Live Chat Support</h3><p className="text-sm text-orange-100">Need immediate assistance? Our team is available 24/7.</p></div>
                  </div>
                  <motion.button onClick={() => window.open('/chat', '_blank')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 shadow-lg transition-all hover:shadow-xl">
                    Start Live Chat <ArrowRightIcon className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== FAQ SECTION ==================== */}
        <section id="faq" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-orange-600 to-orange-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Help Center
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Frequently Asked <span className="text-orange-200">Questions</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-100 sm:text-base">
                Find answers to the most common questions about MenuGo. Can't find what you're looking for?
                <a href="#contact" className="text-white font-semibold hover:underline"> Contact our support team</a>
              </p>
              <div className="mx-auto mt-6 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search for answers..." value={faqSearchTerm} onChange={(e) => setFaqSearchTerm(e.target.value)}
                    className="w-full rounded-full border-0 py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-400 shadow-lg" />
                  {faqSearchTerm && <button onClick={() => setFaqSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Stats */}
        <section className="border-y border-slate-200 bg-white py-6 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="text-center"><p className="text-xl font-bold text-orange-600 sm:text-2xl">{faqs.length}</p><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Total Questions</p></div>
              <div className="text-center"><p className="text-xl font-bold text-orange-600 sm:text-2xl">&lt; 1 hour</p><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Response Time</p></div>
              <div className="text-center"><p className="text-xl font-bold text-orange-600 sm:text-2xl">98%</p><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Satisfaction Rate</p></div>
              <div className="text-center"><p className="text-xl font-bold text-orange-600 sm:text-2xl">{faqCategories.length - 1}</p><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Categories</p></div>
            </div>
          </div>
        </section>

        {/* FAQ Main Content */}
        <section className="py-10 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Categories</h3>
                  <nav className="space-y-1">
                    {faqCategories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeFaqCategory === category.id;
                      const count = category.id === 'all' ? faqs.length : faqs.filter(f => f.category === category.id).length;
                      return (
                        <button key={category.id} onClick={() => setActiveFaqCategory(category.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                          <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{category.label}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-xs ${isActive ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-600">Still have questions?</p>
                    <a href="#contact" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-700 hover:-translate-y-0.5 shadow-md">
                      <MessageCircle className="h-3.5 w-3.5" /> Contact Support
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {filteredFaqs.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-lg">
                      <Search className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-3 text-base font-semibold text-slate-900">No results found</h3>
                      <p className="mt-1 text-sm text-slate-600">We couldn't find any questions matching "{faqSearchTerm}". Try adjusting your search or browse by category.</p>
                      <button onClick={() => { setFaqSearchTerm(''); setActiveFaqCategory('all'); }} className="mt-3 text-sm text-orange-600 hover:underline font-medium">Clear filters</button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFaqs.map((faq) => {
                        const isExpanded = expandedFaq === faq.id;
                        const category = faqCategories.find(c => c.id === faq.category);
                        const CategoryIcon = category?.icon || HelpCircle;

                        return (
                          <motion.div key={faq.id} id={`faq-${faq.id}`} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} viewport={{ once: true }}
                            className="rounded-xl border border-slate-200 bg-white p-3 shadow-md transition hover:shadow-lg">
                            <button onClick={() => toggleFaq(faq.id)} className="flex w-full items-start justify-between text-left">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 rounded-lg bg-orange-100 p-1.5"><CategoryIcon className="h-3.5 w-3.5 text-orange-600" /></div>
                                <div>
                                  <p className="text-xs font-medium text-slate-500">{category?.label}</p>
                                  <h3 className="text-sm font-semibold text-slate-900">{faq.question}</h3>
                                </div>
                              </div>
                              <div className="ml-3 flex-shrink-0">
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                  className="mt-3 border-t border-slate-100 pt-3 overflow-hidden">
                                  <p className="text-sm text-slate-600">{faq.answer}</p>
                                  {faq.related && faq.related.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-xs font-medium text-slate-700">Related questions:</p>
                                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {faq.related.map((related, index) => <span key={index} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700">{related}</span>)}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Contact */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-center text-white md:p-10 shadow-xl">
              <h2 className="text-xl font-bold md:text-2xl">Still Have Questions?</h2>
              <p className="mt-1 text-sm text-orange-100">Our support team is ready to help you with any questions or concerns.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 hover:-translate-y-0.5 shadow-md">
                  <MessageCircle className="h-4 w-4" /> Contact Us
                </a>
                <a href="mailto:support@menugo.com" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Mail className="h-4 w-4" /> support@menugo.com
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Phone className="h-4 w-4" /> +251931486967
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== PRIVACY SECTION ==================== */}
        <section id="privacy" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-orange-600 to-orange-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Your Privacy Matters
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">Privacy Policy</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-100 sm:text-base">Your privacy matters to us. Learn how we collect, use, and protect your personal information.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                  <Calendar className="h-3.5 w-3.5" /> Last Updated: January 15, 2024
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                  <FileCheck className="h-3.5 w-3.5" /> Version 3.0
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-12 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">On this page</h3>
                  <nav className="space-y-1">
                    {privacySections.map((section) => (
                      <button key={section.id} onClick={() => { const el = document.getElementById(`privacy-${section.id}`); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-orange-50 hover:text-orange-700 sm:text-sm">
                        <section.icon className="h-3.5 w-3.5" /> {section.title.replace(/^\d+\.\s*/, '')}
                      </button>
                    ))}
                  </nav>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-700 hover:-translate-y-0.5 shadow-md sm:text-sm">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-900">Introduction</h2>
                    <p className="mt-1.5 text-sm text-slate-600">At MenuGo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital menu platform. Please read this policy carefully to understand our views and practices regarding your personal data.</p>
                    <div className="mt-3 rounded-lg bg-orange-50 p-3 border border-orange-100">
                      <div className="flex items-start gap-2.5"><Info className="h-4 w-4 text-orange-600" /><p className="text-xs text-orange-800 sm:text-sm"><span className="font-semibold">Key Principle:</span> We only collect data that helps us provide better service, and we never sell your personal information to third parties.</p></div>
                    </div>
                  </motion.div>

                  {privacySections.map((section, index) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === `privacy-${section.id}`;

                    return (
                      <motion.div key={section.id} id={`privacy-${section.id}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg transition hover:shadow-xl">
                        <button onClick={() => toggleSection(`privacy-${section.id}`)} className="flex w-full items-start justify-between text-left">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-orange-100 p-1.5"><Icon className="h-4 w-4 text-orange-600" /></div>
                            <div><h2 className="text-base font-semibold text-slate-900">{section.title}</h2><p className="mt-0.5 text-xs text-slate-600">{section.content}</p></div>
                          </div>
                          <div className="flex-shrink-0 ml-3">{isExpanded ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}</div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="mt-3 border-t border-slate-100 pt-3 overflow-hidden">
                              <ul className="space-y-1.5">
                                {section.details.map((detail, idx) => <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 sm:text-sm"><CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-500" /><span>{detail}</span></li>)}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="rounded-xl border border-slate-200 bg-orange-50 p-5 text-center">
                    <p className="text-xs text-slate-600 sm:text-sm">By using MenuGo, you agree to this Privacy Policy. If you have any questions, please <a href="#contact" className="font-medium text-orange-600 hover:underline">contact our Privacy Team</a>.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== TERMS SECTION ==================== */}
        <section id="terms" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-orange-600 to-orange-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white mb-4">
                <Sparkles className="h-4 w-4" /> Legal Information
              </div>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">Terms of Service</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-100">Please read these terms carefully before using MenuGo services.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white"><Calendar className="h-4 w-4" />Last Updated: January 15, 2024</div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white"><FileCheck className="h-4 w-4" />Version 2.1</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-12 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">On this page</h3>
                  <nav className="space-y-1">
                    {termsSections.map((section) => (
                      <button key={section.id} onClick={() => { const el = document.getElementById(`terms-${section.id}`); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-orange-50 hover:text-orange-700 sm:text-sm">
                        <section.icon className="h-3.5 w-3.5" /> {section.title.replace(/^\d+\.\s*/, '')}
                      </button>
                    ))}
                  </nav>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-700 hover:-translate-y-0.5 shadow-md sm:text-sm">
                      <FileText className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {termsSections.map((section, index) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === `terms-${section.id}`;

                    return (
                      <motion.div key={section.id} id={`terms-${section.id}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg transition hover:shadow-xl">
                        <button onClick={() => toggleSection(`terms-${section.id}`)} className="flex w-full items-start justify-between text-left">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-orange-100 p-1.5"><Icon className="h-4 w-4 text-orange-600" /></div>
                            <div><h2 className="text-base font-semibold text-slate-900">{section.title}</h2><p className="mt-0.5 text-xs text-slate-600">{section.content}</p></div>
                          </div>
                          <div className="flex-shrink-0 ml-3">{isExpanded ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}</div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="mt-3 border-t border-slate-100 pt-3 overflow-hidden">
                              <ul className="space-y-1.5">
                                {section.details.map((detail, idx) => <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 sm:text-sm"><CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-500" /><span>{detail}</span></li>)}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="rounded-xl border border-slate-200 bg-orange-50 p-5 text-center">
                    <p className="text-sm text-slate-600">By using MenuGo, you agree to these terms and conditions. If you have any questions, please <a href="#contact" className="font-medium text-orange-600 hover:underline">contact us</a>.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECURITY SECTION ==================== */}
        <section id="security" className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-orange-600 to-orange-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Enterprise Grade Security
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Security is Our <span className="text-orange-200">Top Priority</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-100 sm:text-base">Your data is protected with enterprise-grade security measures. Learn how we keep your information safe and secure.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {securityBadges.map((badge, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 shadow-sm border border-white/10">
                    <badge.icon className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white sm:text-sm">{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security Stats */}
        <section className="border-y border-slate-200 bg-white py-8 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {securityStats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }} className="text-center">
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
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Features</h2>
              <p className="mt-1.5 text-sm text-slate-600">Every layer of our platform is built with security in mind</p>
            </motion.div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                const StatusIcon = feature.statusColor === 'green' ? CheckCircle : ShieldCheck;
                const isExpanded = expandedSection === `security-${feature.id}`;

                return (
                  <motion.div key={feature.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-orange-200">
                    <div className="absolute right-3 top-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${feature.statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        <StatusIcon className="h-2.5 w-2.5" /> {feature.status}
                      </span>
                    </div>
                    <div className="mb-3 inline-flex rounded-xl bg-orange-100 p-2.5 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-600">{feature.description}</p>
                    <button onClick={() => toggleSection(`security-${feature.id}`)} className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 sm:text-sm">
                      {isExpanded ? 'Hide details' : 'Learn more'} {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="mt-3 rounded-lg bg-orange-50 p-3 text-sm text-slate-700 overflow-hidden border border-orange-100">
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
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Certifications</h2>
              <p className="mt-1.5 text-sm text-slate-600">We are committed to maintaining the highest security standards</p>
            </motion.div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {securityCertifications.map((cert, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }}
                  className="rounded-xl bg-slate-50 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
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

        {/* Security Best Practices */}
        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Security Best Practices</h2>
                <p className="mt-1.5 text-sm text-slate-600">Follow these recommended practices to keep your account secure.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="space-y-3">
                {securityBestPractices.map((practice, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className={`flex-shrink-0 rounded-full bg-${practice.color}-100 p-1 mt-0.5`}>
                      <CheckCircle className={`h-4 w-4 text-${practice.color}-600`} />
                    </div>
                    <div><h4 className="text-sm font-medium text-slate-900">{practice.title}</h4><p className="text-xs text-slate-600">{practice.desc}</p></div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security Contact */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-center text-white md:p-10 shadow-xl">
              <h2 className="text-xl font-bold md:text-2xl">Have Security Questions?</h2>
              <p className="mt-1.5 text-sm text-orange-100">Our security team is here to help. Contact us for any security-related concerns.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a href="mailto:security@menugo.com" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 hover:-translate-y-0.5 shadow-md">
                  <Mail className="h-4 w-4" /> security@menugo.com
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Phone className="h-4 w-4" /> +251 931 48 69 67
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <PublicFooter />

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
}