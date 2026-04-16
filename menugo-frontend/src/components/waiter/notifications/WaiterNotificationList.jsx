import React from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useWaiterNotifications } from '../../../hooks/useNotifications'
import { motion } from 'framer-motion'
import WaiterNotificationItem from './WaiterNotificationItem'
import Loading from '../../common/Loading'

const WaiterNotificationList = () => {
  const { user } = useAuthStore()
  const { notifications, isLoading } = useWaiterNotifications(user?.id)

  if (isLoading) return <Loading />

  return (
    <div className="space-y-3">
      {notifications?.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <WaiterNotificationItem notification={notification} />
        </motion.div>
      ))}
      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No notifications</p>
        </div>
      )}
    </div>
  )
}

export default WaiterNotificationList