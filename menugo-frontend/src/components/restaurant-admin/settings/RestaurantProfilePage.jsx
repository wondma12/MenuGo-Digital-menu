import React from 'react'
import { useQuery } from 'react-query'
import Loading from '../../../common/Loading'
import RestaurantProfile from './RestaurantProfile'
import { getRestaurantSettings } from '../../../services/restaurantService'

const RestaurantProfilePage = () => {
  const { data: settings, isLoading } = useQuery('restaurantSettings', getRestaurantSettings)

  if (isLoading) return <Loading />

  return (
    <div className="p-6 bg-white text-slate-900 font-['Manrope',system-ui,sans-serif]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Restaurant Profile</h1>
        <p className="text-slate-600 mt-1">Update your restaurant branding and contact details</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <RestaurantProfile settings={settings} />
      </div>
    </div>
  )
}

export default RestaurantProfilePage
