import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, ArchiveBoxIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import InventoryList from './InventoryList'
import InventoryItemCard from './InventoryItemCard'
import InventoryForm from './InventoryForm'
import LowStockAlert from './LowStockAlert'
import StockAdjustment from './StockAdjustment'
import InventoryTransactions from './InventoryTransactions'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import Modal from '../../../common/Modal'
import Tabs from '../../../common/Tabs'
import { getInventory } from '../../../services/inventoryService'

const InventoryManagement = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showAdjustment, setShowAdjustment] = useState(null)
  const [filters, setFilters] = useState({
    category: 'all',
    lowStock: false,
    search: '',
  })

  const { data: inventory, isLoading, refetch } = useQuery(['inventory', filters], () => getInventory(filters))

  if (isLoading) return <Loading />

  const lowStockItems = inventory?.filter(item => item.quantity <= item.reorderLevel) || []

  const tabs = [
    { label: 'All Items', content: renderInventoryContent() },
    { label: 'Low Stock', content: <LowStockAlert items={lowStockItems} onRefresh={refetch} /> },
    { label: 'Transactions', content: <InventoryTransactions /> },
  ]

  function renderInventoryContent() {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-500 mt-1">Track and manage your stock levels</p>
          </div>
          <div className="flex gap-3">
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
            <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
              Add Item
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search inventory..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="raw">Raw Materials</option>
              <option value="beverage">Beverages</option>
              <option value="packaging">Packaging</option>
              <option value="other">Other</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">Show low stock only</span>
            </label>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <InventoryItemCard
                  item={item}
                  onEdit={() => {
                    setEditingItem(item)
                    setShowModal(true)
                  }}
                  onAdjust={() => setShowAdjustment(item)}
                  onRefresh={refetch}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <InventoryList
            items={inventory || []}
            onEdit={setEditingItem}
            onAdjust={setShowAdjustment}
            onRefresh={refetch}
          />
        )}
      </>
    )
  }

  return (
    <div className="p-6">
      <Tabs tabs={tabs} />
      
      <InventoryForm
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingItem(null)
        }}
        item={editingItem}
        onSuccess={() => {
          refetch()
          setShowModal(false)
          setEditingItem(null)
        }}
      />

      <StockAdjustment
        isOpen={!!showAdjustment}
        onClose={() => setShowAdjustment(null)}
        item={showAdjustment}
        onSuccess={refetch}
      />
    </div>
  )
}

export default InventoryManagement