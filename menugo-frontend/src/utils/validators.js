import * as yup from 'yup'

export const emailSchema = yup
  .string()
  .email('Invalid email address')
  .required('Email is required')

export const passwordSchema = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .required('Password is required')

export const phoneSchema = yup
  .string()
  .matches(/^[0-9]{10,15}$/, 'Invalid phone number')

export const nameSchema = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .required('Name is required')

export const priceSchema = yup
  .number()
  .positive('Price must be positive')
  .required('Price is required')

export const quantitySchema = yup
  .number()
  .integer('Quantity must be an integer')
  .min(1, 'Quantity must be at least 1')
  .required('Quantity is required')

export const urlSchema = yup
  .string()
  .url('Invalid URL')

export const dateSchema = yup
  .date()
  .required('Date is required')

export const timeSchema = yup
  .string()
  .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')

// Validation functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
  return phoneRegex.test(phone)
}

export const isValidPassword = (password) => {
  return password && password.length >= 6
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidCreditCard = (cardNumber) => {
  const cardRegex = /^\d{4}-?\d{4}-?\d{4}-?\d{4}$/
  return cardRegex.test(cardNumber)
}

export const isValidZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// Form validation schemas
export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: yup.boolean(),
})

export const registerSchema = yup.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms'),
})

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
})

export const resetPasswordSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
})

export const profileSchema = yup.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
})

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
})

export const restaurantSchema = yup.object({
  name: yup.string().required('Restaurant name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
})

export const menuItemSchema = yup.object({
  name: yup.string().required('Item name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string(),
  price: priceSchema,
  categoryId: yup.string().required('Category is required'),
  preparationTime: yup.number().positive().integer(),
  calories: yup.number().positive().integer(),
  spiceLevel: yup.number().min(0).max(5),
})

export const tableSchema = yup.object({
  tableNumber: yup.string().required('Table number is required'),
  capacity: yup.number().positive().integer().min(1).required('Capacity is required'),
  section: yup.string(),
})

export const reservationSchema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  customerPhone: phoneSchema.required('Phone number is required'),
  customerEmail: emailSchema,
  partySize: yup.number().positive().integer().min(1).required('Party size is required'),
  reservationDate: dateSchema,
  reservationTime: timeSchema,
})

export const couponSchema = yup.object({
  code: yup.string().required('Coupon code is required').matches(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers'),
  discountType: yup.string().required('Discount type is required'),
  discountValue: yup.number().positive().required('Discount value is required'),
  startDate: dateSchema,
  endDate: dateSchema.min(yup.ref('startDate'), 'End date must be after start date'),
})