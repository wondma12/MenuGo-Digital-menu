import {useEffect, useState} from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../services/api'
import RestaurantInfo from '../menu/RestaurantInfo'
import LoadingSpinner from '../common/LoadingSpinner'

const Landing = () => {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await api.get(`/restaurants/${restaurantId}`)
        if (mounted) setRestaurant(res.data?.data || res.data)
      } catch (err) {
        // silent
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [restaurantId])

  if (loading) return (
    <div className="p-8"><LoadingSpinner /></div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      {restaurant ? (
        <>
          <RestaurantInfo restaurant={restaurant} />

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/menu/${restaurantId}`} className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg">View Menu</Link>
            <Link to="/scan" className="inline-flex items-center px-4 py-2 border rounded-lg">Scan QR</Link>
            <Link to={`/menu/${restaurantId}/cart`} className="inline-flex items-center px-4 py-2 border rounded-lg">View Cart</Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">Restaurant not found.</div>
      )}
    </div>
  )
}

export default Landing
