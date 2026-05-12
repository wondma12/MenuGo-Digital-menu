import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import MenuGrid from './MenuGrid'
import MenuList from './MenuList'
import MenuFilters from './MenuFilters'
import MenuSearch from './MenuSearch'
import MenuItemModal from './MenuItemModal'
import BulkActions from './BulkActions'
import Button from '../../common/Button'
import PageHero from '../../common/PageHero'
import Loading from '../../common/Loading'
import EmptyState from '../../common/EmptyState'
import { getMenuItems } from '../../../services/menuService'
import { useAuthStore } from '../../../store/authStore'

const MenuManagement = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: 'all',
    availability: 'all',
    dietary: [],
  })
  const [selectedItems, setSelectedItems] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const { user } = useAuthStore()

  const { data, isLoading, refetch } = useQuery(
    ['menuItems', user?.restaurant_id, searchTerm, filters],
    () => getMenuItems(user?.restaurant_id, { search: searchTerm, ...filters }),
    { enabled: !!user?.restaurant_id }
  )

  if (isLoading) return <Loading />

  const handleBulkAction = (action) => {
    // Handle bulk actions (delete, update availability, etc.)
    console.log('Bulk action:', action, selectedItems)
    setSelectedItems([])
  }

  const items = data?.items || []
  const totalItems = items.length
  const availableItems = items.filter(i => i.isAvailable).length

  return (
    <div className="p-6">
      <PageHero
        title="Menu Management"
        subtitle="Design, edit and publish your dishes — beautiful, fast and simple."
        stats={[{ label: 'Total items', value: totalItems }, { label: 'Available', value: availableItems }]}
        primaryAction={<Button onClick={() => setShowItemModal(true)} icon={PlusIcon}>Add Menu Item</Button>}
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
            <MenuSearch value={searchTerm} onChange={setSearchTerm} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 h-10 w-36 flex items-center justify-center gap-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-sm text-gray-700"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`ml-2 h-10 w-36 flex items-center justify-center border border-gray-300 rounded-lg ${viewMode === 'grid' ? 'bg-white text-primary-600 font-semibold' : 'bg-white text-gray-700'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`ml-2 h-10 w-36 flex items-center justify-center border border-gray-300 rounded-lg ${viewMode === 'list' ? 'bg-white text-primary-600 font-semibold' : 'bg-white text-gray-700'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm`}
            >
              List
            </button>


          </div>
        </div>
        
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <MenuFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <BulkActions
            selectedCount={selectedItems.length}
            onAction={handleBulkAction}
            onClear={() => setSelectedItems([])}
          />
        </div>
      )}

      {/* Menu Items */}
      {items.length === 0 ? (
        <EmptyState
          title="No menu items found"
          description="Add your first menu item to get started"
          actionText="Add Menu Item"
          onAction={() => setShowItemModal(true)}
        />
      ) : viewMode === 'grid' ? (
        <MenuGrid
          items={data?.items || []}
          selectedItems={selectedItems}
          onSelectItem={(id) => {
            setSelectedItems(prev =>
              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )
          }}
          onEdit={(item) => {
            setEditingItem(item)
            setShowItemModal(true)
          }}
          onRefresh={refetch}
        />
      ) : (
        <MenuList
          items={items}
          selectedItems={selectedItems}
          onSelectItem={(id) => {
            setSelectedItems(prev =>
              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )
          }}
          onEdit={(item) => {
            setEditingItem(item)
            setShowItemModal(true)
          }}
          onRefresh={refetch}
        />
      )}

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false)
          setEditingItem(null)
        }}
        item={editingItem}
        onSuccess={() => {
          refetch()
          setShowItemModal(false)
          setEditingItem(null)
        }}
      />
    </div>
  )
}

export default MenuManagement