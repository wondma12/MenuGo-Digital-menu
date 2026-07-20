import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore'
import { useQuery } from 'react-query'
import { getSystemSettings } from '../../services/systemService'

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { data: settings } = useQuery('systemSettings', getSystemSettings)
  const headerLogo = settings?.platform_logo || settings?.logo || settings?.logo_url || settings?.logoUrl || settings?.branding?.logo || settings?.branding?.logo_url || settings?.preferences?.logo

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
                  {/* Logo */}
                  <Link to="/home" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md transition-all group-hover:scale-105">
                      <HeaderLogo src={headerLogo} className="h-8 w-8 object-contain" />
                    </div>
                    {!headerLogo && (
                      <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        Menu<span className="text-orange-600">Go</span>
                      </span>
                    )}
                  </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 whitespace-nowrap">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-orange-600'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-orange-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-orange-600"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-orange-600 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 bg-white/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-4 py-6 whitespace-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-shrink-0 items-center gap-2 pt-0">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-orange-300 hover:text-orange-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeaderLogo({ src, className }) {
  const logoSrc = src || '/colored-logo.png'
  return (
    <img
      src={logoSrc}
      alt="Platform logo"
      className={className || 'h-6 w-6 object-contain'}
      onError={(e) => {
        e.currentTarget.src = '/colored-logo.png'
      }}
    />
  )
}