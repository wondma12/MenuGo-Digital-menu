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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant menu items</p>
        </div>
        <Button onClick={() => setShowItemModal(true)} icon={PlusIcon}>
          Add Menu Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <MenuSearch value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <MenuFilters filters={filters} onFiltersChange={setFilters} />
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
      {data?.items?.length === 0 ? (
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