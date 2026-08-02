import React from 'react'
import { Link } from 'react-router-dom'

const WelcomeLanding = () => {
  const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('pendingVerificationEmail') : ''
  const displayName = (storedEmail && storedEmail.split('@')[0]) || 'Customer'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">Welcome to MenuGo! 🎉</h1>
          <p className="mt-4 text-gray-600">Hello {displayName},</p>
          <p className="mt-2 text-gray-700">Thank you for choosing MenuGo! We're excited to help your restaurant grow with a modern digital experience.</p>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-gray-700">What you can do with MenuGo:</p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Create beautiful digital menus accessible via QR codes</li>
            <li>Track orders and analytics in real-time</li>
            <li>Manage staff and tables efficiently</li>
            <li>Process payments securely</li>
            <li>Collect and respond to customer reviews</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Get started — Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default WelcomeLanding
