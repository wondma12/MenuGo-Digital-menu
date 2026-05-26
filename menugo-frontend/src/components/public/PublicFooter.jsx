import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { CheckBadgeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function PublicFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      setNewsletterStatus('Please enter a valid email address.');
      return;
    }
    // Simulate API call
    setNewsletterStatus('Thanks for subscribing!');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(''), 3000);
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                MenuGo
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-300">
              Digital dining, reimagined. Smart QR ordering, live analytics, and seamless team coordination for modern restaurants.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@menugo.com" className="hover:text-orange-400 transition">support@menugo.com</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4" />
                <a href="tel:+15551234567" className="hover:text-orange-400 transition">+1 (555) 123-4567</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4" />
                <span>123 Main Street, New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-slate-300 hover:text-orange-400 transition">About Us</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-orange-400 transition">Services</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-orange-400 transition">Contact</Link></li>
              <li><Link to="/pricing" className="text-slate-300 hover:text-orange-400 transition">Pricing</Link></li>
              <li><Link to="/blog" className="text-slate-300 hover:text-orange-400 transition">Blog</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/faq" className="text-slate-300 hover:text-orange-400 transition">FAQ</Link></li>
              <li><Link to="/privacy" className="text-slate-300 hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-300 hover:text-orange-400 transition">Terms of Service</Link></li>
              <li><Link to="/security" className="text-slate-300 hover:text-orange-400 transition">Security</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold">Stay updated</h3>
            <p className="mt-2 text-sm text-slate-300">Get the latest news, tips, and exclusive offers.</p>
            <form onSubmit={handleNewsletterSubmit} className="mt-4 flex flex-col gap-2">
              <div className="flex">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-l-lg border-0 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="submit"
                  className="rounded-r-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Subscribe
                </button>
              </div>
              {newsletterStatus && (
                <p className={`text-xs ${newsletterStatus.includes('Thanks') ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterStatus}
                </p>
              )}
            </form>
            <div className="mt-4 flex gap-4">
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-400 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} MenuGo. All rights reserved. Built with ❤️ for restaurants worldwide.</p>
        </div>
      </div>
    </footer>
  );
}