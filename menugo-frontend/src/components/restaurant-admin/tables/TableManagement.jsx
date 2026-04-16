import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, Squares2X2Icon, MapIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import TableGrid from './TableGrid'
import TableMap from './TableMap'
import TableList from './TableList'
import TableModal from './TableModal'
import TableFilters from './TableFilters'
import ReservationsList from './ReservationsList'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import Tabs from '../../../common/Tabs'
import { getTables } from '../../../services/tableService'
import { useAuthStore } from '../../../store/authStore'

const TableManagement = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    section: 'all',
    search: '',
  })

  const { user } = useAuthStore()

  const { data: tables, isLoading, refetch } = useQuery(
    ['tables', user?.restaurant_id, filters],
    () => getTables(user?.restaurant_id, filters),
    { enabled: !!user?.restaurant_id }
  )

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Tables', content: renderTablesContent() },
    { label: 'Reservations', content: <ReservationsList /> },
  ]

  function renderTablesContent() {
    return (
      <>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-500 mt-1">Manage restaurant tables and floor layout</p>
          </div>
          <div className="flex gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <TableCellsIcon className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
              Add Table
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TableFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Tables Display */}
        {viewMode === 'grid' && <TableGrid tables={tables || []} onEdit={setEditingTable} onRefresh={refetch} />}
        {viewMode === 'map' && <TableMap tables={tables || []} onEdit={setEditingTable} onRefresh={refetch} />}
        {viewMode === 'list' && <TableList tables={tables || []} onEdit={setEditingTable} onRefresh={refetch} />}
      </>
    )
  }

  return (
    <div className="p-6">
      <Tabs tabs={tabs} />
      
      <TableModal
        isOpen={showModal || !!editingTable}
        onClose={() => {
          setShowModal(false)
          setEditingTable(null)
        }}
        table={editingTable}
        onSuccess={() => {
          refetch()
          setShowModal(false)
          setEditingTable(null)
        }}
      />
    </div>
  )
}

export default TableManagement