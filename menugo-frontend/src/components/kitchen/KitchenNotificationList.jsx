import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import { motion } from 'framer-motion'
import KitchenNotificationItem from './KitchenNotificationItem'
import Loading from '../common/Loading'

const KitchenNotificationList = () => {
  const { user } = useAuthStore()
  const { notifications, isLoading } = useNotifications(user?.id)

  if (isLoading) return <Loading />

  return (
    <div className="space-y-3">
      {notifications?.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <KitchenNotificationItem notification={notification} />
        </motion.div>
      ))}

      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500">No notifications</p>
        </div>
      )}
    </div>
  )
}

export default KitchenNotificationList
