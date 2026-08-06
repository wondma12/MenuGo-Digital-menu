
import { motion } from 'framer-motion'
import MenuItemCard from './MenuItemCard'

const MenuGridView = ({ items, onItemClick, itemStatuses = {} }) => {
  return (
    <div className="grid items-stretch grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id || `${item.name || 'item'}-${index}`}
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <MenuItemCard item={item} onClick={onItemClick} statusInfo={itemStatuses[item.id]} />
        </motion.div>
      ))}
    </div>
  )
}

export default MenuGridView