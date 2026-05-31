import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Globe,
  Home,
  ArrowLeft,
} from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../../services/authService';
import { toast } from 'react-toastify';

const MultiStepRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    country: "",
    city: "",
    subCity: "",
    streetAddress: "",
    googleMapsLink: "",
    ownerName: "",
    businessLicenseNumber: "",
    tinNumber: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, name: "Account", icon: User, description: "Create your account" },
    { id: 2, name: "Restaurant", icon: Building, description: "Restaurant details" },
    { id: 3, name: "Location", icon: MapPin, description: "Location information" },
    { id: 4, name: "Verification", icon: FileText, description: "Business verification" },
    { id: 5, name: "Review", icon: Check, description: "Review & submit" },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        break;

      case 2:
        if (!formData.restaurantName.trim()) newErrors.restaurantName = "Restaurant name is required";
        break;

      case 3:
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.subCity.trim()) newErrors.subCity = "Sub-city/District is required";
        if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
        if (!formData.googleMapsLink.trim()) newErrors.googleMapsLink = "Google Maps link is required";
        break;

      case 4:
        if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
        if (!formData.businessLicenseNumber.trim()) newErrors.businessLicenseNumber = "Business license number is required";
        if (!formData.tinNumber.trim()) newErrors.tinNumber = "TIN number is required";
        if (!formData.businessLicenseDocument) newErrors.businessLicenseDocument = "Business license document is required";
        else {
          const file = formData.businessLicenseDocument;
          const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
          if (file && file.size > 5 * 1024 * 1024) {
            newErrors.businessLicenseDocument = 'Business license must be 5MB or smaller';
          } else if (file && !allowed.includes(file.type)) {
            newErrors.businessLicenseDocument = 'Unsupported file type for business license';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsLoading(true);
      try {
        let payload;
        const hasFiles = formData.logo || formData.banner || formData.businessLicenseDocument;
        if (hasFiles) {
          const fd = new FormData();
          fd.append('email', formData.email);
          fd.append('password', formData.password);
          fd.append('full_name', formData.fullName);
          fd.append('phone', formData.phoneNumber);
          fd.append('role', 'restaurant_admin');
          fd.append('restaurant_name', formData.restaurantName);
          fd.append('restaurant_address', formData.streetAddress);
          fd.append('restaurant_city', formData.city);
          fd.append('restaurant_country', formData.country);
          fd.append('restaurant_website', formData.googleMapsLink);
          fd.append('restaurant_slogan', formData.description);
          if (formData.logo) fd.append('logo', formData.logo);
          if (formData.banner) fd.append('banner', formData.banner);
          if (formData.businessLicenseDocument) fd.append('businessLicenseDocument', formData.businessLicenseDocument);
          payload = fd;
        } else {
          payload = {
            email: formData.email,
            password: formData.password,
            full_name: formData.fullName,
            phone: formData.phoneNumber,
            role: 'restaurant_admin',
            restaurant_name: formData.restaurantName,
            restaurant_address: formData.streetAddress,
            restaurant_city: formData.city,
            restaurant_country: formData.country,
            restaurant_website: formData.googleMapsLink,
            restaurant_slogan: formData.description,
          };
        }

        const response = await registerUser(payload);
        toast.success(response?.message || 'Registration successful. Sign in to continue.');
        navigate('/login', { replace: true });
      } catch (err) {
        console.error('Registration error', err);
        toast.error(err?.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    // Animation variants for form steps
    const variants = {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    };

    const stepContent = (() => {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Create Your Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password *</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm Password *</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          );

        case 2:
          return (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Restaurant Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Restaurant Name *</label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter restaurant name"
                      value={formData.restaurantName}
                      onChange={(e) => handleChange("restaurantName", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.restaurantName && <p className="mt-1 text-xs text-red-600">{errors.restaurantName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Brand Logo (Optional)</label>
                  <div className="mt-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                    <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                    <p className="text-xs text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG up to 2MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("logo", e.target.files[0])}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="mt-2 inline-block cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100">
                      Choose File
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Banner Image (Optional)</label>
                  <div className="mt-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                    <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                    <p className="text-xs text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG up to 2MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("banner", e.target.files[0])}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload" className="mt-2 inline-block cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100">
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Location Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Country *</label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">City *</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. New York"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Sub-City / District *</label>
                  <div className="relative mt-1">
                    <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. Manhattan"
                      value={formData.subCity}
                      onChange={(e) => handleChange("subCity", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.subCity && <p className="mt-1 text-xs text-red-600">{errors.subCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Google Maps Link *</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="url"
                      placeholder="https://goo.gl/maps/..."
                      value={formData.googleMapsLink}
                      onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.googleMapsLink && <p className="mt-1 text-xs text-red-600">{errors.googleMapsLink}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Street Address *</label>
                  <div className="relative mt-1">
                    <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Suite number, building name, and street details"
                      value={formData.streetAddress}
                      onChange={(e) => handleChange("streetAddress", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.streetAddress && <p className="mt-1 text-xs text-red-600">{errors.streetAddress}</p>}
                </div>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Business Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Owner Name *</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter owner name"
                      value={formData.ownerName}
                      onChange={(e) => handleChange("ownerName", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.ownerName && <p className="mt-1 text-xs text-red-600">{errors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Business License Number *</label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter business license number"
                      value={formData.businessLicenseNumber}
                      onChange={(e) => handleChange("businessLicenseNumber", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.businessLicenseNumber && <p className="mt-1 text-xs text-red-600">{errors.businessLicenseNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">TIN Number *</label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter TIN number"
                      value={formData.tinNumber}
                      onChange={(e) => handleChange("tinNumber", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  {errors.tinNumber && <p className="mt-1 text-xs text-red-600">{errors.tinNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Tell us about your restaurant"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Business License Document *</label>
                  <div className="mt-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                    <FileText className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                    <p className="text-xs text-slate-600">Upload legal document (PDF, DOC, or image)</p>
                    <p className="text-[11px] text-slate-500">Max file size: 5MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange("businessLicenseDocument", e.target.files[0])}
                      className="hidden"
                      id="license-upload"
                    />
                    <label htmlFor="license-upload" className="mt-2 inline-block cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100">
                      Choose File
                    </label>
                  </div>
                  {errors.businessLicenseDocument && <p className="mt-1 text-xs text-red-600">{errors.businessLicenseDocument}</p>}
                </div>
              </div>
            </div>
          );

        case 5:
          return (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Review & Submit</h2>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Account Information</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Restaurant Details</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Name:</span> {formData.restaurantName}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Location</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Country:</span> {formData.country}</p>
                    <p><span className="font-medium">City:</span> {formData.city}</p>
                    <p><span className="font-medium">Sub-City:</span> {formData.subCity}</p>
                    <p><span className="font-medium">Address:</span> {formData.streetAddress}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Verification</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Owner:</span> {formData.ownerName}</p>
                    <p><span className="font-medium">License #:</span> {formData.businessLicenseNumber}</p>
                    <p><span className="font-medium">TIN:</span> {formData.tinNumber}</p>
                    <p><span className="font-medium">Description:</span> {formData.description || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                By clicking "Submit for Verification", you agree to our Terms of Service and Privacy Policy. Your restaurant dashboard will be prepared after verification.
              </div>
            </div>
          );

        default:
          return null;
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="mx-auto w-full max-w-md">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xl">MG</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-600">Sign up to manage your restaurant and menu</p>
          </div>

          {/* Step indicator */}
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          isActive || isCompleted ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`mt-1.5 text-[10px] font-semibold ${isActive || isCompleted ? 'text-orange-600' : 'text-slate-500'}`}>
                        {step.name}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full ${currentStep > step.id ? 'bg-orange-600' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {renderStepContent()}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="secondary"
              className="flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep === 5 ? (
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isLoading}
                className="flex items-center gap-1.5"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} className="flex items-center gap-1.5">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;