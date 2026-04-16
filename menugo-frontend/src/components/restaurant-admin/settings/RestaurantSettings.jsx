import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
  BuildingStorefrontIcon,
  ClockIcon,
  TruckIcon,
  CreditCardIcon,
  BellIcon,
  ReceiptPercentIcon,
  PaintBrushIcon,
  UsersIcon,
  KeyIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import Tabs from '../../../common/Tabs'
import Loading from '../../../common/Loading'
import RestaurantProfile from './RestaurantProfile'
import OperatingHours from './OperatingHours'
import DeliverySettings from './DeliverySettings'
import PaymentSettings from './PaymentSettings'
import NotificationSettings from './NotificationSettings'
import TaxSettings from './TaxSettings'
import ThemeSettings from './ThemeSettings'
import UserManagement from './UserManagement'
import ChangePassword from './ChangePassword'
import SubscriptionPlan from './SubscriptionPlan'
import { getRestaurantSettings } from '../../../services/restaurantService'

const RestaurantSettings = () => {
  const { data: settings, isLoading } = useQuery('restaurantSettings', getRestaurantSettings)

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Profile', icon: BuildingStorefrontIcon, content: <RestaurantProfile settings={settings} /> },
    { label: 'Hours', icon: ClockIcon, content: <OperatingHours settings={settings} /> },
    { label: 'Delivery', icon: TruckIcon, content: <DeliverySettings settings={settings} /> },
    { label: 'Payments', icon: CreditCardIcon, content: <PaymentSettings settings={settings} /> },
    { label: 'Notifications', icon: BellIcon, content: <NotificationSettings settings={settings} /> },
    { label: 'Taxes', icon: ReceiptPercentIcon, content: <TaxSettings settings={settings} /> },
    { label: 'Appearance', icon: PaintBrushIcon, content: <ThemeSettings settings={settings} /> },
    { label: 'Staff', icon: UsersIcon, content: <UserManagement /> },
    { label: 'Security', icon: KeyIcon, content: <ChangePassword /> },
    { label: 'Subscription', icon: DocumentTextIcon, content: <SubscriptionPlan settings={settings} /> },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
        <p className="text-gray-500 mt-1">Manage your restaurant configuration</p>
      </div>
      <Tabs tabs={tabs} />
    </div>
  )
}

export default RestaurantSettings