
import { motion } from 'framer-motion'
import MenuItemCard from './MenuItemCard'

const MenuGrid = ({ items, selectedItems, onSelectItem, onEdit, onRefresh }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <MenuItemCard
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={() => onSelectItem(item.id)}
            onEdit={() => onEdit(item)}
            onRefresh={onRefresh}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default MenuGrid