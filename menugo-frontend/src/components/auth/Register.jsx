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
  Globe,
  Home,
  ArrowLeft,
} from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import FileUpload from "../common/FileUpload";
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
    subscriptionPlan: "monthly",
    country: "",
    city: "",
    subCity: "",
    streetAddress: "",
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

  const floatAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  };

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
        break;

      case 4:
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
          fd.append('subscription_plan', formData.subscriptionPlan);
          fd.append('restaurant_address', formData.streetAddress);
          fd.append('restaurant_city', formData.city);
          fd.append('restaurant_country', formData.country);
          fd.append('restaurant_sub_city', formData.subCity);
          fd.append('business_license_number', formData.businessLicenseNumber);
          fd.append('tin_number', formData.tinNumber);
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
            subscription_plan: formData.subscriptionPlan,
            restaurant_address: formData.streetAddress,
            restaurant_city: formData.city,
            restaurant_country: formData.country,
            restaurant_sub_city: formData.subCity,
            business_license_number: formData.businessLicenseNumber,
            tin_number: formData.tinNumber,
            restaurant_slogan: formData.description,
          };
        }

        const response = await registerUser(payload);
        toast.success(response?.message || 'Registration successful. Sign in to continue.');
        navigate('/login', { replace: true });
      } catch (err) {
        console.error('Registration error', err);
        const responseMessage = err?.response?.data?.message || err?.message || 'Registration failed';
        toast.error(responseMessage);
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
                  <label className="block text-sm font-medium text-slate-700">Subscription Plan *</label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="subscriptionPlan"
                        value="monthly"
                        checked={formData.subscriptionPlan === "monthly"}
                        onChange={(e) => handleChange("subscriptionPlan", e.target.value)}
                        className="accent-orange-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Monthly</p>
                        <p className="text-xs text-slate-500">Renews every month</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="subscriptionPlan"
                        value="six_months"
                        checked={formData.subscriptionPlan === "six_months"}
                        onChange={(e) => handleChange("subscriptionPlan", e.target.value)}
                        className="accent-orange-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">6 Months</p>
                        <p className="text-xs text-slate-500">Save up to 10%</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="subscriptionPlan"
                        value="yearly"
                        checked={formData.subscriptionPlan === "yearly"}
                        onChange={(e) => handleChange("subscriptionPlan", e.target.value)}
                        className="accent-orange-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Yearly</p>
                        <p className="text-xs text-slate-500">Save up to 20%</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Brand Logo (Optional)</label>
                  <FileUpload
                    onFileSelect={(file) => handleFileChange('logo', file)}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                    maxSize={2 * 1024 * 1024}
                    label="Click to upload or drag and drop"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Banner Image (Optional)</label>
                  <FileUpload
                    onFileSelect={(file) => handleFileChange('banner', file)}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                    maxSize={2 * 1024 * 1024}
                    label="Click to upload or drag and drop"
                    className="mt-1"
                  />
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
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Andorra">Andorra</option>
                      <option value="Angola">Angola</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Australia">Australia</option>
                      <option value="Austria">Austria</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Belize">Belize</option>
                      <option value="Benin">Benin</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Canada">Canada</option>
                      <option value="Cape Verde">Cape Verde</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Chile">Chile</option>
                      <option value="China">China</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Congo">Congo</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Egypt">Egypt</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Germany">Germany</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Greece">Greece</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hong Kong">Hong Kong</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Iceland">Iceland</option>
                      <option value="India">India</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Iran">Iran</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Israel">Israel</option>
                      <option value="Italy">Italy</option>
                      <option value="Ivory Coast">Ivory Coast</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Japan">Japan</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Laos">Laos</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Libya">Libya</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Macau">Macau</option>
                      <option value="Macedonia">Macedonia</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malta">Malta</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="North Korea">North Korea</option>
                      <option value="Norway">Norway</option>
                      <option value="Oman">Oman</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palau">Palau</option>
                      <option value="Palestine">Palestine</option>
                      <option value="Panama">Panama</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Peru">Peru</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Samoa">Samoa</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Korea">South Korea</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sudan">Sudan</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Syria">Syria</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Timor-Leste">Timor-Leste</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican City">Vatican City</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
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
                  <FileUpload
                    onFileSelect={(file) => handleFileChange('businessLicenseDocument', file)}
                    accept={{
                      'application/pdf': ['.pdf'],
                      'application/msword': ['.doc'],
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                    }}
                    maxSize={5 * 1024 * 1024}
                    label="Upload legal document (PDF, DOC, or image)"
                    className="mt-1"
                  />
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
                    <p><span className="font-medium">Subscription:</span> {formData.subscriptionPlan === 'six_months' ? '6 Months' : formData.subscriptionPlan.charAt(0).toUpperCase() + formData.subscriptionPlan.slice(1)}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
      />
      <motion.div
        animate={floatAnimation}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-300/10 blur-3xl"
      />

      <div className="mx-auto w-full max-w-md relative z-10">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition-all duration-300 group">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/80 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-2xl">MG</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Sign up to manage your restaurant and menu</p>
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
              fullWidth
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
                fullWidth
                variant="primary"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:shadow-orange-500/30 hover:-translate-y-0.5"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                fullWidth
                variant="primary"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:shadow-orange-500/30 hover:-translate-y-0.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700 transition-colors hover:underline"
              >
                Sign in
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;