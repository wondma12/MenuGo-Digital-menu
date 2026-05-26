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

  const items = data?.items || []
  const totalItems = items.length
  const availableItems = items.filter(i => i.isAvailable).length

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant menu</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Menu Management</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Design, edit and publish your dishes with an analytics-style workspace.</p>
          </div>
          <div className="relative z-50">
            <Button onClick={() => setShowItemModal(true)} icon={PlusIcon} className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2.5 text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-blue-600">
              Add Menu Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-500">Total items</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{totalItems}</p>
          </div>
          <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{availableItems}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start">
        <div className="flex-1">
          <div className="bg-white p-3 flex items-center gap-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <MenuSearch value={searchTerm} onChange={setSearchTerm} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 flex h-10 w-36 items-center justify-center gap-2 border border-slate-200 bg-white text-sm text-slate-700 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <FunnelIcon className="h-5 w-5 text-orange-500" />
              Filters
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`ml-2 flex h-10 w-36 items-center justify-center border border-slate-200 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-100 ${viewMode === 'grid' ? 'bg-orange-50 font-semibold text-orange-700' : 'bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`ml-2 flex h-10 w-36 items-center justify-center border border-slate-200 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-100 ${viewMode === 'list' ? 'bg-orange-50 font-semibold text-orange-700' : 'bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'}`}
            >
              List
            </button>


          </div>
        </div>
        
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <div className="bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
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