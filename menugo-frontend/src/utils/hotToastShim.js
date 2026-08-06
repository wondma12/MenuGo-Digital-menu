import { toast as _toast } from 'react-toastify'


// Default export to match `import toast from 'react-hot-toast'`
export default _toast

// Named export to match `import { toast } from 'react-hot-toast'`
export const toast = _toast

// Provide a no-op Toaster component to satisfy existing imports of Toaster from 'react-hot-toast'.
export const Toaster = ({ position, toastOptions }) => {
  // react-toastify's ToastContainer is used in App.jsx, so we don't render anything here.
  return null
}
