import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} MenuGo. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="/terms" className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer