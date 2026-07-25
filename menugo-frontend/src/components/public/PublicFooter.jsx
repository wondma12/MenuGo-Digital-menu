import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Youtube,
  ArrowRight,
  Sparkles,
  Rocket,
  Heart
} from 'lucide-react';
import { 
  CheckBadgeIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
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

const socialVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  show: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
};

const floatAnimation = {
  y: [0, -5, 0],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

export default function PublicFooter() {
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
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Blog', path: '/blog' },
  ];

  const supportLinks = [
    { name: 'FAQ', path: '/faq' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Security', path: '/security' },
  ];

  const socialLinks = [
    { 
      icon: Twitter, 
      name: 'Twitter', 
      url: 'https://x.com/HWondmageg23368',
      color: 'hover:bg-[#1DA1F2]',
      bgColor: 'bg-[#1DA1F2]/10',
    },
    { 
      icon: Facebook, 
      name: 'Facebook', 
      url: 'https://web.facebook.com/profile.php?id=100091640838987',
      color: 'hover:bg-[#1877F2]',
      bgColor: 'bg-[#1877F2]/10',
    },
    { 
      icon: Instagram, 
      name: 'Instagram', 
      url: 'https://www.instagram.com/haymanotwondmagegn/',
      color: 'hover:bg-gradient-to-r hover:from-[#E4405F] hover:to-[#F58529]',
      bgColor: 'bg-[#E4405F]/10',
    },
    { 
      icon: Linkedin, 
      name: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/haymanot-wondmagegn-b57502300/',
      color: 'hover:bg-[#0A66C2]',
      bgColor: 'bg-[#0A66C2]/10',
    },
    { 
      icon: Youtube, 
      name: 'YouTube', 
      url: 'https://www.youtube.com',
      color: 'hover:bg-[#FF0000]',
      bgColor: 'bg-[#FF0000]/10',
    },
  ];

  const features = [
    { icon: DevicePhoneMobileIcon, text: 'Mobile-first' },
    { icon: QrCodeIcon, text: 'QR Ordering' },
    { icon: GlobeAltIcon, text: 'Multi-language' },
    { icon: ShieldCheckIcon, text: 'Secure' },
  ];

  return (
    <motion.footer 
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatAnimation}
          className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Contact - Enhanced */}
          <motion.div variants={fadeInUp}>
            <Link to="/" className="inline-block group">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-orange-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  MenuGo
                </span>
                <motion.div
                  animate={pulseAnimation}
                  className="relative"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                </motion.div>
              </motion.div>
            </Link>
            
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xs">
              Digital dining, reimagined. Smart QR ordering, live analytics, and seamless team coordination for modern restaurants.
            </p>
            
            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, text: 'support@menugo.com', href: 'mailto:support@menugo.com' },
                { icon: Phone, text: '+251 931 48 69 67', href: 'tel:+251931486967' },
                { icon: MapPin, text: 'Addis Ababa, Ethiopia', href: null },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="hover:text-orange-400 transition-colors duration-300">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Feature badges */}
            {/* <div className="mt-6 flex flex-wrap gap-2">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50"
                >
                  <feature.icon className="h-3 w-3 text-orange-400" />
                  <span className="text-[10px] text-slate-300">{feature.text}</span>
                </motion.div>
              ))}
            </div> */}
          </motion.div>

          {/* Quick Links - Enhanced */}
          <motion.div variants={fadeInUp}>
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              <span className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"></span>
              Quick Links
            </motion.h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 6 }}
                  onMouseEnter={() => setHoveredLink(`quick-${idx}`)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <motion.span
                      animate={{ 
                        opacity: hoveredLink === `quick-${idx}` ? 1 : 0,
                        x: hoveredLink === `quick-${idx}` ? 0 : -5
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-orange-400"
                    />
                    {link.name}
                    <motion.span
                      animate={{ 
                        opacity: hoveredLink === `quick-${idx}` ? 1 : 0,
                        x: hoveredLink === `quick-${idx}` ? 0 : -5
                      }}
                    >
                      <ArrowRight className="h-3 w-3 text-orange-400" />
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support & Legal - Enhanced */}
          <motion.div variants={fadeInUp}>
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></span>
              Support
            </motion.h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {supportLinks.map((link, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 6 }}
                  onMouseEnter={() => setHoveredLink(`support-${idx}`)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <motion.span
                      animate={{ 
                        opacity: hoveredLink === `support-${idx}` ? 1 : 0,
                        x: hoveredLink === `support-${idx}` ? 0 : -5
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-blue-400"
                    />
                    {link.name}
                    <motion.span
                      animate={{ 
                        opacity: hoveredLink === `support-${idx}` ? 1 : 0,
                        x: hoveredLink === `support-${idx}` ? 0 : -5
                      }}
                    >
                      <ArrowRight className="h-3 w-3 text-blue-400" />
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-orange-400" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-orange-400" />
                <span>Secure</span>
              </div>
            </div>
          </motion.div>

          {/* Newsletter Signup - Enhanced */}
          <motion.div variants={fadeInUp}>
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              <span className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full"></span>
              Stay updated
            </motion.h3>
            <p className="mt-2 text-sm text-slate-300">
              Get the latest news, tips, and exclusive offers.
            </p>
            
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
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-2 text-xs ${newsletterStatus.includes('Thanks') ? 'text-green-400' : 'text-red-400'} flex items-center gap-1.5`}
                  >
                    {newsletterStatus.includes('Thanks') ? (
                      <CheckBadgeIcon className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-red-400">!</span>
                    )}
                    {newsletterStatus}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            {/* Social Links - Enhanced */}
            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-3">Follow us</p>
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-2"
              >
                {socialLinks.map((social, idx) => (
                  <motion.a
                    key={idx}
                    variants={socialVariants}
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
                    
                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredSocial === idx && (
                        <motion.span
                          initial={{ opacity: 0, y: -5, scale: 0.8 }}
                          animate={{ opacity: 1, y: -8, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.8 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-[10px] text-white rounded whitespace-nowrap"
                        >
                          {social.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 border-t border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-slate-400 flex items-center gap-2">
            © {new Date().getFullYear()} MenuGo. All rights reserved.
            <motion.span
              animate={floatAnimation}
              className="inline-block"
            >
              <Heart className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />
            </motion.span>
            Built with ❤️ for restaurants worldwide.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300">Privacy</Link>
            <span className="w-px h-3 bg-slate-700"></span>
            <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300">Terms</Link>
            <span className="w-px h-3 bg-slate-700"></span>
            <Link to="/security" className="hover:text-orange-400 transition-colors duration-300">Security</Link>
            <span className="w-px h-3 bg-slate-700"></span>
            <motion.div
              animate={pulseAnimation}
              className="flex items-center gap-1.5 text-green-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px]">All systems go</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
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