import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center text-white font-bold">MG</div>
          <span className="font-semibold text-lg text-gray-900">MenuGo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link to="/home" className="text-gray-700 hover:text-primary-600">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-primary-600">About</Link>
          <Link to="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary-600">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 bg-primary-600 text-white rounded-md hidden sm:inline-block">Sign In</Link>
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link to="/home" onClick={() => setOpen(false)} className="text-gray-700">Home</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="text-gray-700">About</Link>
            <Link to="/services" onClick={() => setOpen(false)} className="text-gray-700">Services</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="text-gray-700">Contact</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="text-gray-700">Sign In</Link>
          </div>
        </div>
      )}
    </header>
  )
}
