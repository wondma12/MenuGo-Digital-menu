import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t mt-12">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} MenuGo. All rights reserved.</div>

        <div className="flex items-center gap-6 mt-3 md:mt-0">
          <div className="hidden sm:flex gap-4">
            <Link to="/about" className="text-gray-600 hover:text-primary-600">About</Link>
            <Link to="/services" className="text-gray-600 hover:text-primary-600">Services</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-600 hover:text-primary-600">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-600 hover:text-primary-600">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-primary-600">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-600 hover:text-primary-600">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
