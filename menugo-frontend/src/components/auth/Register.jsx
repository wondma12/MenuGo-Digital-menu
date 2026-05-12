import React, { useState } from "react";
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
} from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import { useNavigate } from 'react-router-dom'
import { register as registerUser } from '../../services/authService'
import toast from 'react-hot-toast'

const MultiStepRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    businessEmail: "",
    businessPhone: "",
    country: "",
    city: "",
    subCity: "",
    streetAddress: "",
    googleMapsLink: "",
    ownerName: "",
    businessLicenseNumber: "",
    tinNumber: "",
    slogan: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, name: "Account", icon: User, description: "Create your account" },
    {
      id: 2,
      name: "Restaurant",
      icon: Building,
      description: "Restaurant details",
    },
    {
      id: 3,
      name: "Location",
      icon: MapPin,
      description: "Location information",
    },
    {
      id: 4,
      name: "Verification",
      icon: FileText,
      description: "Business verification",
    },
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
        if (!formData.fullName.trim())
          newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Invalid email format";
        if (!formData.phoneNumber.trim())
          newErrors.phoneNumber = "Phone number is required";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8)
          newErrors.password = "Password must be at least 8 characters";
        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        break;

      case 2:
        if (!formData.restaurantName.trim())
          newErrors.restaurantName = "Restaurant name is required";
        if (!formData.businessEmail.trim())
          newErrors.businessEmail = "Business email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
          newErrors.businessEmail = "Invalid email format";
        if (!formData.businessPhone.trim())
          newErrors.businessPhone = "Business phone is required";
        break;

      case 3:
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.subCity.trim())
          newErrors.subCity = "Sub-city/District is required";
        if (!formData.streetAddress.trim())
          newErrors.streetAddress = "Street address is required";
        if (!formData.googleMapsLink.trim())
          newErrors.googleMapsLink = "Google Maps link is required";
        break;

      case 4:
        if (!formData.ownerName.trim())
          newErrors.ownerName = "Owner name is required";
        if (!formData.businessLicenseNumber.trim())
          newErrors.businessLicenseNumber =
            "Business license number is required";
        if (!formData.tinNumber.trim())
          newErrors.tinNumber = "TIN number is required";
        if (!formData.businessLicenseDocument)
          newErrors.businessLicenseDocument =
            "Business license document is required";
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

  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          role: 'restaurant_admin',
          restaurant_name: formData.restaurantName,
          restaurant_address: formData.streetAddress,
          restaurant_city: formData.city,
          restaurant_country: formData.country,
          restaurant_phone: formData.businessPhone,
          restaurant_website: formData.googleMapsLink,
          restaurant_slogan: formData.slogan,
        }

        await registerUser(payload)
        toast.success('Registration submitted. Await platform verification.')
        navigate('/auth/login')
      } catch (err) {
        console.error('Registration error', err)
        toast.error(err?.response?.data?.message || 'Registration failed')
      } finally {
        setIsLoading(false)
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Your Account
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Restaurant Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter restaurant name"
                    value={formData.restaurantName}
                    onChange={(e) =>
                      handleChange("restaurantName", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.restaurantName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.restaurantName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="email"
                    placeholder="Enter business email"
                    value={formData.businessEmail}
                    onChange={(e) =>
                      handleChange("businessEmail", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.businessEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="tel"
                    placeholder="Enter business phone"
                    value={formData.businessPhone}
                    onChange={(e) =>
                      handleChange("businessPhone", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.businessPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Upload className="mx-auto text-gray-400 w-8 h-8 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange("logo", e.target.files[0])
                    }
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <span className="text-xs text-black font-medium">
                      Choose File
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Upload className="mx-auto text-gray-400 w-8 h-8 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange("banner", e.target.files[0])
                    }
                    className="hidden"
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <span className="text-xs text-black font-medium">
                      Choose File
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Location Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="flex-1 px-3 py-2 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    {/* Add more countries */}
                  </select>
                </div>
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="e.g. New York"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-City / District
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="e.g. Manhattan"
                    value={formData.subCity}
                    onChange={(e) => handleChange("subCity", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.subCity && (
                  <p className="text-red-500 text-xs mt-1">{errors.subCity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="url"
                    placeholder="https://goo.gl/maps/..."
                    value={formData.googleMapsLink}
                    onChange={(e) =>
                      handleChange("googleMapsLink", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.googleMapsLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.googleMapsLink}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Suite number, building name, and street details"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      handleChange("streetAddress", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.streetAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.streetAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Business Verification
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter owner name"
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.ownerName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.ownerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter business license number"
                    value={formData.businessLicenseNumber}
                    onChange={(e) =>
                      handleChange("businessLicenseNumber", e.target.value)
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.businessLicenseNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessLicenseNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TIN Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter TIN number"
                    value={formData.tinNumber}
                    onChange={(e) => handleChange("tinNumber", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                {errors.tinNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tinNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Enter restaurant slogan"
                    value={formData.slogan}
                    onChange={(e) => handleChange("slogan", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <FileText className="mx-auto text-gray-400 w-8 h-8 mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload legal document (PDF)
                  </p>
                  <p className="text-xs text-gray-500">Max file size: 1MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleFileChange(
                        "businessLicenseDocument",
                        e.target.files[0],
                      )
                    }
                    className="hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="cursor-pointer">
                    <span className="text-xs text-black font-medium">
                      Choose File
                    </span>
                  </label>
                </div>
                {errors.businessLicenseDocument && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessLicenseDocument}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review & Submit
            </h2>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Account Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Name:</strong> {formData.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.phoneNumber}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Restaurant Details
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Name:</strong> {formData.restaurantName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.businessEmail}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.businessPhone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Country:</strong> {formData.country}
                  </p>
                  <p>
                    <strong>City:</strong> {formData.city}
                  </p>
                  <p>
                    <strong>Sub-City:</strong> {formData.subCity}
                  </p>
                  <p>
                    <strong>Address:</strong> {formData.streetAddress}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Verification
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Owner:</strong> {formData.ownerName}
                  </p>
                  <p>
                    <strong>License Number:</strong>{" "}
                    {formData.businessLicenseNumber}
                  </p>
                  <p>
                    <strong>TIN:</strong> {formData.tinNumber}
                  </p>
                  <p>
                    <strong>Slogan:</strong> {formData.slogan}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                By clicking "Submit for Verification", you agree to our Terms of
                Service and Privacy Policy. Your restaurant dashboard will be
                prepared immediately after verification.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="sticky top-0 z-1000 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-[#11c589] text-white"
                          : isCompleted
                            ? "bg-[#11c589] text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isActive
                          ? "text-[#11c589]"
                          : isCompleted
                            ? "text-[#11c589]"
                            : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.id ? "bg-[#11c589]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-2 border bg-black border-gray-30  text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === 5 ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-950 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;